import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import NoteAltIcon from '@mui/icons-material/NoteAlt';

export default function AppHeader() {
  return (
    <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAltIcon />
          <Typography variant="h6" component="h1" noWrap>
            Notes
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
