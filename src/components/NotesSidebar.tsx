import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemText,
  Box, Typography, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotes } from '@/contexts/NoteContext';
import { useTabs } from '@/contexts/TabContext';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const DRAWER_WIDTH = 260;

export default function NotesSidebar() {
  const { notes, createNote, deleteNote } = useNotes();
  const { openTab, activeTabId, closeTab } = useTabs();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleCreate = async () => {
    const note = await createNote({ title: 'Untitled Note' });
    if (note) openTab(note);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const note = notes.find((n) => n._id === deleteTarget);
    if (note && activeTabId === deleteTarget) {
      closeTab(deleteTarget);
    }
    await deleteNote(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: ['48px', '56px', '64px'],
            height: 'auto',
            bottom: 0,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">My Notes</Typography>
          <Tooltip title="New Note">
            <IconButton size="small" onClick={handleCreate}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <List dense sx={{ overflow: 'auto', flex: 1, px: 1 }}>
          {notes.map((note) => (
            <ListItem
              key={note._id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(note._id); }}
                  sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                selected={activeTabId === note._id}
                onClick={() => openTab(note)}
              >
                <ListItemText
                  primary={note.title}
                  slotProps={{
                    primary: {
                      noWrap: true,
                      sx: {
                        fontSize: '0.9rem',
                        fontWeight: activeTabId === note._id ? 600 : 400,
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
