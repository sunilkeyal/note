import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { NoteProvider } from '@/contexts/NoteContext';
import { TabProvider } from '@/contexts/TabContext';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NoteProvider>
        <TabProvider>
          <Component {...pageProps} />
        </TabProvider>
      </NoteProvider>
    </ThemeProvider>
  );
}
