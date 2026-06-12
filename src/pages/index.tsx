import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import AppHeader from '@/components/AppHeader';
import NotesSidebar from '@/components/NotesSidebar';
import MainArea from '@/components/MainArea';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  React.useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const showMenuButton = isMobile || isTablet;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        showMenuButton={showMenuButton}
      />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Sidebar */}
        <Box
          sx={{
            display: { xs: sidebarOpen ? 'block' : 'none', md: 'block' },
            width: { xs: '100%', md: 280 },
            flexShrink: 0,
            ...(isMobile && {
              position: 'fixed',
              left: 0,
              top: 40,
              width: '100%',
              height: 'calc(100vh - 40px)',
              zIndex: 1200,
              bgcolor: 'background.default',
            }),
            ...(isTablet && {
              position: sidebarOpen ? 'fixed' : 'static',
              left: 0,
              top: 40,
              height: 'calc(100vh - 40px)',
              zIndex: 1200,
              bgcolor: 'background.default',
            }),
          }}
        >
          <NotesSidebar />
        </Box>

        {/* Main content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: { xs: sidebarOpen ? 'none' : 'block', md: 'block' },
          }}
          onClick={() => {
            if (isMobile && sidebarOpen) setSidebarOpen(false);
          }}
        >
          <MainArea />
        </Box>
      </Box>
    </Box>
  );
}
