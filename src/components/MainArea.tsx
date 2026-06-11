import React, { useCallback, useRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useNotes } from '@/contexts/NoteContext';
import { useTabs } from '@/contexts/TabContext';
import TabBar from './TabBar';
import NoteEditor from './NoteEditor';

export default function MainArea() {
  const { notes, updateNote } = useNotes();
  const { activeTabId } = useTabs();
  const activeNote = notes.find((n) => n._id === activeTabId);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingUpdate = useRef<{ id: string; content: string } | null>(null);

  const handleUpdate = useCallback((id: string, content: string) => {
    pendingUpdate.current = { id, content };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (pendingUpdate.current) {
        updateNote(pendingUpdate.current.id, { content: pendingUpdate.current.content });
        pendingUpdate.current = null;
      }
    }, 1000);
  }, [updateNote]);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TabBar />
      {activeNote ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ px: 2, pt: 2, pb: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {activeNote.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(activeNote.updatedAt).toLocaleString()}
            </Typography>
            <Divider sx={{ mt: 1, mb: 0 }} />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <NoteEditor note={activeNote} onUpdate={handleUpdate} />
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Select a note or create a new one
          </Typography>
        </Box>
      )}
    </Box>
  );
}
