# Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dark mode support with system preference detection, manual toggle, and localStorage persistence.

**Architecture:** A ThemeContext wraps the app and provides light/dark mode state. MUI's ThemeProvider consumes this to render the correct palette. The AppHeader contains a toggle icon button. The NoteEditor and TabBar use theme-aware colors instead of hardcoded values.

**Tech Stack:** Next.js 16, MUI v9, React 19, localStorage, CSS custom properties

---

### Task 1: Create ThemeContext

**Files:**
- Create: `src/contexts/ThemeContext.tsx`

- [ ] **Step 1: Create ThemeContext with mode state and toggle**

Write `src/contexts/ThemeContext.tsx`:

```tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

interface ThemeContextValue {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(getInitialMode);
  const hasManuallyToggled = useRef(false);

  useEffect(() => {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute('content', `${mode} light`);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!hasManuallyToggled.current) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    hasManuallyToggled.current = true;
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeContextProvider');
  return ctx;
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "ThemeContext"`
Expected: no errors

---

### Task 2: Wire ThemeContext into `_app.tsx`

**Files:**
- Modify: `src/pages/_app.tsx`

- [ ] **Step 1: Read current _app.tsx to confirm content**

Run: `Get-Content src/pages/_app.tsx`

- [ ] **Step 2: Update _app.tsx with ThemeContext and dynamic theme**

```tsx
import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { NoteProvider } from '@/contexts/NoteContext';
import { TabProvider } from '@/contexts/TabContext';
import { ThemeContextProvider, useTheme } from '@/contexts/ThemeContext';

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme();
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            background: { default: '#fff', paper: '#fafafa' },
          }
        : {
            background: { default: '#121212', paper: '#1e1e1e' },
            text: { primary: '#e0e0e0', secondary: '#a0a0a0' },
          }),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeContextProvider>
      <ThemedApp>
        <NoteProvider>
          <TabProvider>
            <Component {...pageProps} />
          </TabProvider>
        </NoteProvider>
      </ThemedApp>
    </ThemeContextProvider>
  );
}
```

- [ ] **Step 3: Verify the app builds**

Run: `npx next build 2>&1 | Select-String -Pattern "error"`
Expected: no errors (warnings are OK)

---

### Task 3: Add dark mode toggle to AppHeader

**Files:**
- Modify: `src/components/AppHeader.tsx`

- [ ] **Step 1: Read current AppHeader.tsx**

Run: `Get-Content src/components/AppHeader.tsx`

- [ ] **Step 2: Add toggle icon button**

```tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '@/contexts/ThemeContext';

export default function AppHeader() {
  const { mode, toggleTheme } = useTheme();

  return (
    <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <NoteAltIcon />
          <Typography variant="h6" component="h1" noWrap>
            Notes
          </Typography>
        </Box>
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
```

- [ ] **Step 3: Verify app builds**

Run: `npx next build 2>&1 | Select-String -Pattern "error"`
Expected: no errors

---

### Task 4: Replace hardcoded colors in NoteEditor and TabBar

**Files:**
- Modify: `src/components/NoteEditor.tsx`
- Modify: `src/components/TabBar.tsx`

- [ ] **Step 1: Read current NoteEditor.tsx**

Run: `Get-Content src/components/NoteEditor.tsx`

- [ ] **Step 2: Replace hardcoded `#fafafa` in NoteEditor toolbar**

Change line 55 from:
```tsx
<Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap', bgcolor: '#fafafa' }}>
```
to:
```tsx
<Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper' }}>
```

- [ ] **Step 3: Read current TabBar.tsx**

Run: `Get-Content src/components/TabBar.tsx`

- [ ] **Step 4: Replace hardcoded `#fafafa` in TabBar**

Change line 12 from:
```tsx
<Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
```
to:
```tsx
<Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
```

- [ ] **Step 5: Add `color-scheme` meta tag to `_document.tsx`**

Add to `src/pages/_document.tsx` inside `<Head>`:
```tsx
<meta name="color-scheme" content="dark light" />
```

- [ ] **Step 6: Verify app builds and runs**

Run: `npx next build 2>&1 | Select-String -Pattern "error"`
Expected: no errors

- [ ] **Step 7: Run lint**

Run: `npm run lint`
Expected: no lint errors

---

### Task 5: Verify dark mode end-to-end

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Manual verification checklist**
  - App loads in light mode by default
  - Click the moon icon in AppHeader → switches to dark mode
  - All MUI components render with dark palette (sidebar, tabs, editor, dialogs)
  - Refresh the page → dark mode persists (localStorage)
  - Clear localStorage and set OS to dark mode → app loads in dark mode
  - Toggle manually, change OS preference → respects manual toggle
