import React from 'react';
import { Box } from '@mui/material';
import AppHeader from '@/components/AppHeader';
import NotesSidebar from '@/components/NotesSidebar';
import MainArea from '@/components/MainArea';

export default function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <NotesSidebar />
        <MainArea />
      </Box>
    </Box>
  );
}
