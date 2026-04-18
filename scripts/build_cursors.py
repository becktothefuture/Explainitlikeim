#!/usr/bin/env python3

from __future__ import annotations

import argparse
import math
from collections import Counter, defaultdict, deque
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "Pillow is required to build cursors. Install it with `python3 -m pip install pillow`."
    ) from exc


FALLBACK_VERTICAL_GUIDES = ((338, 341), (682, 685))
FALLBACK_HORIZONTAL_GUIDES = ((338, 342), (682, 685))
OUTPUT_ORDER = (
    ("default", 0, 0),
    ("pointer", 1, 0),
    ("click", 2, 0),
    ("text", 0, 1),
    ("grab", 1, 1),
    ("grabbing", 2, 1),
)
CANVAS_SIZE = 64
TARGET_BOXES = {
    "default": (40, 40),
    "pointer": (34, 38),
    "click": (34, 38),
    "text": (19, 42),
    "grab": (35, 38),
    "grabbing": (35, 37),
}
PLACEMENT = {
    "default": ("topleft", (4, 4)),
    "pointer": ("topcenter", (0, 4)),
    "click": ("topcenter", (0, 4)),
    "text": ("center", (0, 0)),
    "grab": ("center", (0, 2)),
    "grabbing": ("center", (0, 2)),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build transparent cursor PNGs from a sprite sheet.")
    parser.add_argument("--input", required=True, help="Absolute or repo-relative path to the source sprite sheet.")
    parser.add_argument(
        "--out-dir",
        default="public/assets/cursors",
        help="Directory for generated cursor PNGs. Defaults to public/assets/cursors.",
    )
    return parser.parse_args()


def mean_rgb(values: Iterable[tuple[int, int, int]]) -> tuple[float, float, float]:
    values = list(values)
    if not values:
        return (0.0, 0.0, 0.0)
    total_r = sum(value[0] for value in values)
    total_g = sum(value[1] for value in values)
    total_b = sum(value[2] for value in values)
    count = len(values)
    return (total_r / count, total_g / count, total_b / count)


def color_distance(left: tuple[float, float, float], right: tuple[float, float, float]) -> float:
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(left, right)))


def strip_average(image: Image.Image, axis: str, index: int) -> tuple[float, float, float]:
    pixels = image.load()
    if axis == "x":
        return mean_rgb(tuple(pixels[index, y][:3] for y in range(image.height)))
    return mean_rgb(tuple(pixels[x, index][:3] for x in range(image.width)))


def find_contiguous_runs(indices: list[int]) -> list[tuple[int, int]]:
    if not indices:
        return []
    runs: list[tuple[int, int]] = []
    start = prev = indices[0]
    for index in indices[1:]:
        if index == prev + 1:
            prev = index
            continue
        runs.append((start, prev))
        start = prev = index
    runs.append((start, prev))
    return runs


def detect_guides(
    image: Image.Image,
    axis: str,
    fallbacks: tuple[tuple[int, int], tuple[int, int]],
) -> tuple[tuple[int, int], tuple[int, int]]:
    limit = image.width if axis == "x" else image.height
    detected = []
    for fallback in fallbacks:
        start, end = fallback
        center = (start + end) // 2
        window_start = max(0, start - 18)
        window_end = min(limit - 1, end + 18)
        guide_color = mean_rgb(strip_average(image, axis, index) for index in range(start, end + 1))
        candidate_indices = []
        for index in range(window_start, window_end + 1):
            average = strip_average(image, axis, index)
            if color_distance(average, guide_color) <= 18:
                candidate_indices.append(index)
        runs = find_contiguous_runs(candidate_indices)
        if not runs:
            detected.append(fallback)
            continue
        run = min(runs, key=lambda pair: abs(((pair[0] + pair[1]) // 2) - center))
        detected.append(run)
    return tuple(detected)  # type: ignore[return-value]


def cell_bounds(
    image: Image.Image,
    vertical_guides: tuple[tuple[int, int], tuple[int, int]],
    horizontal_guides: tuple[tuple[int, int], tuple[int, int]],
) -> list[tuple[int, int, int, int]]:
    x_cuts = (
        (0, vertical_guides[0][0]),
        (vertical_guides[0][1] + 1, vertical_guides[1][0]),
        (vertical_guides[1][1] + 1, image.width),
    )
    y_cuts = (
        (0, horizontal_guides[0][0]),
        (horizontal_guides[0][1] + 1, horizontal_guides[1][0]),
        (horizontal_guides[1][1] + 1, image.height),
    )
    bounds: list[tuple[int, int, int, int]] = []
    for y_start, y_end in y_cuts:
        for x_start, x_end in x_cuts:
            bounds.append((x_start, y_start, x_end, y_end))
    return bounds


def build_background_palette(image: Image.Image) -> list[tuple[float, float, float]]:
    border_pixels = []
    width, height = image.size
    sample_depth = min(4, width // 10, height // 10)
    for x in range(width):
        for y in range(sample_depth):
            border_pixels.append(image.getpixel((x, y))[:3])
            border_pixels.append(image.getpixel((x, height - 1 - y))[:3])
    for y in range(height):
        for x in range(sample_depth):
            border_pixels.append(image.getpixel((x, y))[:3])
            border_pixels.append(image.getpixel((width - 1 - x, y))[:3])

    buckets: defaultdict[tuple[int, int, int], list[tuple[int, int, int]]] = defaultdict(list)
    for red, green, blue in border_pixels:
        key = (
            int(round(red / 8) * 8),
            int(round(green / 8) * 8),
            int(round(blue / 8) * 8),
        )
        buckets[key].append((red, green, blue))

    most_common = Counter({key: len(value) for key, value in buckets.items()}).most_common(10)
    return [mean_rgb(buckets[key]) for key, _count in most_common]


def nearest_background_color(
    pixel: tuple[int, int, int],
    palette: list[tuple[float, float, float]],
) -> tuple[tuple[float, float, float], float]:
    best = palette[0]
    best_distance = color_distance(pixel, best)
    for color in palette[1:]:
        distance = color_distance(pixel, color)
        if distance < best_distance:
            best = color
            best_distance = distance
    return best, best_distance


def remove_background(image: Image.Image) -> Image.Image:
    width, height = image.size
    rgba = image.convert("RGBA")
    palette = build_background_palette(rgba)
    pixels = rgba.load()
    background = [[False] * width for _ in range(height)]
    queue: deque[tuple[int, int]] = deque()
    flood_threshold = 30
    expansion_threshold = 42
    feather_threshold = 60

    neighbors = (
        (1, 0),
        (-1, 0),
        (0, 1),
        (0, -1),
        (1, 1),
        (-1, -1),
        (-1, 1),
        (1, -1),
    )

    def maybe_enqueue(x: int, y: int, threshold: int) -> None:
        if background[y][x]:
            return
        _color, distance = nearest_background_color(pixels[x, y][:3], palette)
        if distance <= threshold:
            background[y][x] = True
            queue.append((x, y))

    for x in range(width):
        maybe_enqueue(x, 0, flood_threshold)
        maybe_enqueue(x, height - 1, flood_threshold)
    for y in range(height):
        maybe_enqueue(0, y, flood_threshold)
        maybe_enqueue(width - 1, y, flood_threshold)

    while queue:
        x, y = queue.popleft()
        for dx, dy in neighbors:
            neighbor_x = x + dx
            neighbor_y = y + dy
            if not (0 <= neighbor_x < width and 0 <= neighbor_y < height):
                continue
            if background[neighbor_y][neighbor_x]:
                continue
            _color, distance = nearest_background_color(pixels[neighbor_x, neighbor_y][:3], palette)
            if distance <= flood_threshold:
                background[neighbor_y][neighbor_x] = True
                queue.append((neighbor_x, neighbor_y))

    for _ in range(2):
        additions: list[tuple[int, int]] = []
        for y in range(height):
            for x in range(width):
                if background[y][x]:
                    continue
                if not any(
                    0 <= x + dx < width
                    and 0 <= y + dy < height
                    and background[y + dy][x + dx]
                    for dx, dy in neighbors
                ):
                    continue
                _color, distance = nearest_background_color(pixels[x, y][:3], palette)
                if distance <= expansion_threshold:
                    additions.append((x, y))
        for x, y in additions:
            background[y][x] = True

    result = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    result_pixels = result.load()
    for y in range(height):
        for x in range(width):
            red, green, blue, _alpha = pixels[x, y]
            if background[y][x]:
                result_pixels[x, y] = (0, 0, 0, 0)
                continue

            nearest_color, distance = nearest_background_color((red, green, blue), palette)
            boundary = any(
                0 <= x + dx < width
                and 0 <= y + dy < height
                and background[y + dy][x + dx]
                for dx, dy in neighbors
            )

            alpha = 255
            if boundary:
                if distance <= 22:
                    result_pixels[x, y] = (0, 0, 0, 0)
                    continue
                if distance < feather_threshold:
                    alpha = max(0, min(255, int(round((distance - 22) / (feather_threshold - 22) * 255))))
                    if alpha < 24:
                        result_pixels[x, y] = (0, 0, 0, 0)
                        continue
                    if alpha < 255:
                        mix = 1 - (alpha / 255)
                        red = int(round((red - nearest_color[0] * mix) / (alpha / 255)))
                        green = int(round((green - nearest_color[1] * mix) / (alpha / 255)))
                        blue = int(round((blue - nearest_color[2] * mix) / (alpha / 255)))
                        red = max(0, min(255, red))
                        green = max(0, min(255, green))
                        blue = max(0, min(255, blue))
            result_pixels[x, y] = (red, green, blue, alpha)

    result = remove_small_islands(result, min_area=6)
    bbox = result.getbbox()
    return result.crop(bbox) if bbox else result


def remove_small_islands(image: Image.Image, min_area: int) -> Image.Image:
    width, height = image.size
    pixels = image.load()
    visited = [[False] * width for _ in range(height)]
    neighbors = (
        (1, 0),
        (-1, 0),
        (0, 1),
        (0, -1),
        (1, 1),
        (-1, -1),
        (-1, 1),
        (1, -1),
    )

    for y in range(height):
        for x in range(width):
            if visited[y][x] or pixels[x, y][3] == 0:
                continue
            queue = deque([(x, y)])
            component: list[tuple[int, int]] = []
            visited[y][x] = True

            while queue:
                current_x, current_y = queue.popleft()
                component.append((current_x, current_y))
                for dx, dy in neighbors:
                    neighbor_x = current_x + dx
                    neighbor_y = current_y + dy
                    if not (0 <= neighbor_x < width and 0 <= neighbor_y < height):
                        continue
                    if visited[neighbor_y][neighbor_x]:
                        continue
                    if pixels[neighbor_x, neighbor_y][3] == 0:
                        continue
                    visited[neighbor_y][neighbor_x] = True
                    queue.append((neighbor_x, neighbor_y))

            if len(component) < min_area:
                for component_x, component_y in component:
                    pixels[component_x, component_y] = (0, 0, 0, 0)

    return image


def place_on_canvas(image: Image.Image, name: str) -> Image.Image:
    target_width, target_height = TARGET_BOXES[name]
    placement_mode, offset = PLACEMENT[name]

    scaled = image.copy()
    scaled.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))

    if placement_mode == "topleft":
        paste_x, paste_y = offset
    elif placement_mode == "topcenter":
        paste_x = (CANVAS_SIZE - scaled.width) // 2 + offset[0]
        paste_y = offset[1]
    else:
        paste_x = (CANVAS_SIZE - scaled.width) // 2 + offset[0]
        paste_y = (CANVAS_SIZE - scaled.height) // 2 + offset[1]

    canvas.alpha_composite(scaled, (paste_x, paste_y))
    return canvas


def build_cursors(input_path: Path, out_dir: Path) -> None:
    source = Image.open(input_path).convert("RGBA")
    vertical_guides = detect_guides(source, "x", FALLBACK_VERTICAL_GUIDES)
    horizontal_guides = detect_guides(source, "y", FALLBACK_HORIZONTAL_GUIDES)
    bounds = cell_bounds(source, vertical_guides, horizontal_guides)

    out_dir.mkdir(parents=True, exist_ok=True)
    for name, column, row in OUTPUT_ORDER:
        bound = bounds[(row * 3) + column]
        cell = source.crop(bound)
        cleaned = remove_background(cell)
        output = place_on_canvas(cleaned, name)
        output.save(out_dir / f"{name}.png", optimize=True, compress_level=9)

    print(f"Built {len(OUTPUT_ORDER)} cursor assets from {input_path}")
    print(f"Vertical guides: {vertical_guides}")
    print(f"Horizontal guides: {horizontal_guides}")
    print(f"Output directory: {out_dir}")


def main() -> None:
    args = parse_args()
    input_path = Path(args.input).expanduser().resolve()
    out_dir = Path(args.out_dir).resolve()
    if not input_path.exists():
        raise SystemExit(f"Input file does not exist: {input_path}")
    build_cursors(input_path, out_dir)


if __name__ == "__main__":
    main()
