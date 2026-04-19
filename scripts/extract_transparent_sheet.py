#!/usr/bin/env python3

from __future__ import annotations

import argparse
import colorsys
from collections import deque
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Remove magenta panel/divider backgrounds from an icon atlas while preserving "
            "foreground artwork and writing transparency to a new PNG."
        )
    )
    parser.add_argument("--input", required=True, help="Path to source PNG atlas.")
    parser.add_argument("--output", required=True, help="Path for output transparent PNG.")
    parser.add_argument(
        "--hue-low",
        type=float,
        default=0.74,
        help="Lower magenta hue threshold in [0, 1] for wraparound detection. Default: 0.74",
    )
    parser.add_argument(
        "--hue-high",
        type=float,
        default=0.03,
        help="Upper hue threshold in [0, 1] for wraparound detection. Default: 0.03",
    )
    parser.add_argument(
        "--sat-min",
        type=float,
        default=0.12,
        help="Minimum saturation for magenta background candidate. Default: 0.12",
    )
    parser.add_argument(
        "--val-min",
        type=float,
        default=0.18,
        help="Minimum value/brightness for magenta background candidate. Default: 0.18",
    )
    parser.add_argument(
        "--dark-val-max",
        type=float,
        default=0.20,
        help="Maximum value/brightness for dark divider candidates. Default: 0.20",
    )
    parser.add_argument(
        "--dark-sat-max",
        type=float,
        default=0.28,
        help="Maximum saturation for dark divider candidates. Default: 0.28",
    )
    parser.add_argument(
        "--rows",
        type=int,
        default=3,
        help="Number of atlas rows to process independently. Default: 3",
    )
    parser.add_argument(
        "--cols",
        type=int,
        default=3,
        help="Number of atlas columns to process independently. Default: 3",
    )
    parser.add_argument(
        "--grid-line-band",
        type=int,
        default=4,
        help="Half-width in pixels for clearing internal grid separators. Default: 4",
    )
    return parser.parse_args()


def is_magenta_candidate(
    hue: float,
    saturation: float,
    value: float,
    hue_low: float,
    hue_high: float,
    sat_min: float,
    val_min: float,
) -> bool:
    return (
        (hue >= hue_low or hue <= hue_high)
        and saturation >= sat_min
        and value >= val_min
    )


def is_dark_candidate(value: float, saturation: float, dark_val_max: float, dark_sat_max: float) -> bool:
    return value <= dark_val_max and saturation <= dark_sat_max


def build_background_candidate_mask(
    image: Image.Image,
    hue_low: float,
    hue_high: float,
    sat_min: float,
    val_min: float,
    dark_val_max: float,
    dark_sat_max: float,
) -> list[list[bool]]:
    width, height = image.size
    pixels = image.load()
    candidate = [[False] * width for _ in range(height)]
    for y in range(height):
        for x in range(width):
            red, green, blue, _alpha = pixels[x, y]
            hue, saturation, value = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
            candidate[y][x] = is_magenta_candidate(
                hue, saturation, value, hue_low, hue_high, sat_min, val_min
            ) or is_dark_candidate(value, saturation, dark_val_max, dark_sat_max)
    return candidate


def flood_fill_background(candidate: list[list[bool]]) -> list[list[bool]]:
    height = len(candidate)
    width = len(candidate[0]) if height else 0
    background = [[False] * width for _ in range(height)]
    queue: deque[tuple[int, int]] = deque()

    def enqueue_if_candidate(px: int, py: int) -> None:
        if not candidate[py][px] or background[py][px]:
            return
        background[py][px] = True
        queue.append((px, py))

    for x in range(width):
        enqueue_if_candidate(x, 0)
        enqueue_if_candidate(x, height - 1)
    for y in range(height):
        enqueue_if_candidate(0, y)
        enqueue_if_candidate(width - 1, y)

    neighbors = (
        (1, 0),
        (-1, 0),
        (0, 1),
        (0, -1),
        (1, 1),
        (-1, -1),
        (1, -1),
        (-1, 1),
    )

    while queue:
        x, y = queue.popleft()
        for dx, dy in neighbors:
            nx = x + dx
            ny = y + dy
            if not (0 <= nx < width and 0 <= ny < height):
                continue
            if not candidate[ny][nx] or background[ny][nx]:
                continue
            background[ny][nx] = True
            queue.append((nx, ny))

    return background


def count_transparent_neighbors(alpha_grid: list[list[int]], x: int, y: int) -> int:
    height = len(alpha_grid)
    width = len(alpha_grid[0]) if height else 0
    transparent_neighbors = 0
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dx == 0 and dy == 0:
                continue
            nx = x + dx
            ny = y + dy
            if not (0 <= nx < width and 0 <= ny < height):
                transparent_neighbors += 1
                continue
            if alpha_grid[ny][nx] == 0:
                transparent_neighbors += 1
    return transparent_neighbors


def reduce_magenta_edge_fringe(
    image: Image.Image,
    alpha_grid: list[list[int]],
    hue_low: float,
    hue_high: float,
) -> None:
    width, height = image.size
    pixels = image.load()
    for y in range(height):
        for x in range(width):
            alpha = alpha_grid[y][x]
            if alpha == 0:
                continue
            transparent_neighbors = count_transparent_neighbors(alpha_grid, x, y)
            if transparent_neighbors < 2:
                continue
            red, green, blue, _existing_alpha = pixels[x, y]
            hue, saturation, value = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
            magenta_fringe = is_magenta_candidate(
                hue=hue,
                saturation=saturation,
                value=value,
                hue_low=max(0.0, hue_low - 0.02),
                hue_high=min(1.0, hue_high + 0.02),
                sat_min=0.14,
                val_min=0.20,
            )
            if magenta_fringe:
                alpha_grid[y][x] = min(alpha, int(alpha * 0.35))


def apply_alpha(image: Image.Image, background_mask: list[list[bool]], hue_low: float, hue_high: float) -> Image.Image:
    width, height = image.size
    result = image.copy()
    pixels = result.load()
    alpha_grid = [[255] * width for _ in range(height)]

    for y in range(height):
        for x in range(width):
            if background_mask[y][x]:
                alpha_grid[y][x] = 0

    reduce_magenta_edge_fringe(result, alpha_grid, hue_low, hue_high)

    for y in range(height):
        for x in range(width):
            red, green, blue, _existing_alpha = pixels[x, y]
            pixels[x, y] = (red, green, blue, alpha_grid[y][x])

    return result


def process_cell(
    cell: Image.Image,
    hue_low: float,
    hue_high: float,
    sat_min: float,
    val_min: float,
    dark_val_max: float,
    dark_sat_max: float,
) -> Image.Image:
    candidate = build_background_candidate_mask(
        image=cell,
        hue_low=hue_low,
        hue_high=hue_high,
        sat_min=sat_min,
        val_min=val_min,
        dark_val_max=dark_val_max,
        dark_sat_max=dark_sat_max,
    )
    background = flood_fill_background(candidate)
    return apply_alpha(cell, background, hue_low, hue_high)


def clear_internal_grid_lines(
    image: Image.Image,
    x_cuts: list[int],
    y_cuts: list[int],
    band: int,
) -> None:
    if band <= 0:
        return

    width, height = image.size
    pixels = image.load()

    for cut in x_cuts[1:-1]:
        start = max(0, cut - band)
        end = min(width - 1, cut + band)
        for x in range(start, end + 1):
            for y in range(height):
                red, green, blue, _alpha = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)

    for cut in y_cuts[1:-1]:
        start = max(0, cut - band)
        end = min(height - 1, cut + band)
        for y in range(start, end + 1):
            for x in range(width):
                red, green, blue, _alpha = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)


def main() -> None:
    args = parse_args()
    input_path = Path(args.input).expanduser().resolve()
    output_path = Path(args.output).expanduser().resolve()

    if not input_path.exists():
        raise SystemExit(f"Input file does not exist: {input_path}")

    if args.rows <= 0 or args.cols <= 0:
        raise SystemExit("--rows and --cols must be greater than 0.")

    image = Image.open(input_path).convert("RGBA")
    width, height = image.size
    x_cuts = [int((width * index) / args.cols) for index in range(args.cols)] + [width]
    y_cuts = [int((height * index) / args.rows) for index in range(args.rows)] + [height]

    extracted = Image.new("RGBA", image.size, (0, 0, 0, 0))
    for row in range(args.rows):
        for col in range(args.cols):
            left = x_cuts[col]
            right = x_cuts[col + 1]
            top = y_cuts[row]
            bottom = y_cuts[row + 1]
            cell = image.crop((left, top, right, bottom))
            processed = process_cell(
                cell=cell,
                hue_low=args.hue_low,
                hue_high=args.hue_high,
                sat_min=args.sat_min,
                val_min=args.val_min,
                dark_val_max=args.dark_val_max,
                dark_sat_max=args.dark_sat_max,
            )
            extracted.alpha_composite(processed, (left, top))
    clear_internal_grid_lines(extracted, x_cuts, y_cuts, args.grid_line_band)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    extracted.save(output_path, optimize=True, compress_level=9)

    alpha_min, alpha_max = extracted.getchannel("A").getextrema()
    print(f"Wrote transparent sheet: {output_path}")
    print(f"Input size: {image.size[0]}x{image.size[1]}")
    print(f"Alpha extrema: {alpha_min}..{alpha_max}")


if __name__ == "__main__":
    main()
