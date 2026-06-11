# Dark Mode Design

## Overview

Add dark mode support to the Notes app using MUI's theming system. Dark mode respects the user's system preference (`prefers-color-scheme`), allows manual toggle via the AppHeader, and persists the choice in `localStorage`.

## Architecture

- **ThemeContext** (`src/contexts/ThemeContext.tsx`) — manages `'light' | 'dark'` state, reads/writes `localStorage`, listens to `matchMedia('(prefers-color-scheme: dark)')` on mount, and sets `data-theme` and `<meta name="color-scheme">` on `<html>`
- **`_app.tsx`** — wraps children with `ThemeContextProvider` outside MUI's `ThemeProvider`; creates a MUI theme based on the current mode
- **AppHeader** — icon button (sun/moon) toggles the mode

## Files Changed

### New: `src/contexts/ThemeContext.tsx`

- Default state: `'light'`
- On mount: check `localStorage.getItem('theme-mode')` → if absent, check `window.matchMedia('(prefers-color-scheme: dark)')`
- On mode change: write to `localStorage`, set `document.documentElement.dataset.theme`, update `<meta name="color-scheme">`
- Provides `{ mode, toggleTheme }` via React context
- Listens for system preference changes via `matchMedia` change listener and updates state if no manual override exists

### Modified: `src/pages/_app.tsx`

- Import `ThemeContextProvider`
- Wrap `<ThemeContextProvider>` outside `<ThemeProvider>`
- Inside `ThemeContextProvider`, create MUI theme using `createTheme` with explicit light/dark palettes (avoiding deprecated `palette.mode`):
  - Light: `background.default: #fff`, `background.paper: #fafafa`
  - Dark: `background.default: #121212`, `background.paper: #1e1e1e`, text adapted accordingly
- Keep `CssBaseline` inside `ThemeProvider`

### Modified: `src/components/AppHeader.tsx`

- Import `useTheme` from new context, and `DarkModeIcon`/`LightModeIcon` from MUI icons
- Add icon button to the right side of the `<Toolbar>`, before any existing action icons
- Icon: `DarkModeIcon` in light mode, `LightModeIcon` in dark mode
- On click: calls `toggleTheme()`

### Modified: `src/components/NoteEditor.tsx`

- Editor toolbar background uses MUI theme-aware color instead of hardcoded `#fafafa`:
  - Light: `grey[100]`
  - Dark: `grey[900]`
- The `<style jsx global>` block includes a `@media (prefers-color-scheme: dark)` or uses the `data-theme` attribute for `.ProseMirror` text color

### Modified: `src/components/TabBar.tsx`

- Hardcoded `bgcolor: '#fafafa'` replaced with theme-aware color

## Component Tree

```
ThemeContextProvider (manages mode state, localStorage, system pref)
  └── ThemeProvider (creates MUI theme based on mode)
       └── CssBaseline
       └── NoteProvider
            └── TabProvider
                 └── App (pages)
                      └── AppHeader (toggle icon button)
                      └── NotesSidebar
                      └── MainArea
                           └── TabBar
                           └── NoteEditor
```

## Data Flow

1. User clicks toggle in AppHeader → `toggleTheme()` flips mode
2. ThemeContext updates state, writes to `localStorage`, updates `<html data-theme>`
3. React re-renders ThemeProvider with new `createTheme()` call
4. MUI components re-render with new palette colors
5. CssBaseline applies new background/text colors to the body

## Edge Cases

- **No localStorage available**: gracefully degrades — defaults to system preference, manual toggle works but won't persist
- **System preference changes while app is open**: update listener fires, overrides current mode if no manual toggle was made (tracked via a `hasManuallyToggled` ref)
- **Server-side rendering**: `ThemeContext` defaults to `'light'` during SSR; `useEffect` syncs on client

## Testing

- Visual: toggle in AppHeader switches all MUI components to dark palette
- Persistence: refresh the page — mode is preserved
- System preference: set OS to dark mode, open app → defaults to dark; toggle manually, change OS preference → respects manual choice
