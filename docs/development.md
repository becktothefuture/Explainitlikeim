# Development Notes

## Debug UI switch

The landing page hides all debug controls by default in production builds.

To turn them back on locally, set this env var before running Vite:

```bash
VITE_ENABLE_DEBUG_UI=true
```

Debug UI is also enabled automatically when `import.meta.env.DEV` is true (normal `vite` dev mode).

When debug UI is enabled, you get:
- the floating control launcher,
- the inline control dock and external control panel mount,
- the `/` keyboard shortcut for opening controls,
- quick navigation actions for Depth Lab and Typography Lab.
