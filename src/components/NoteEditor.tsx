import React, { useEffect } from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import { Box } from '@mui/material';
import { Note } from '@/types';

interface Props {
  note: Note;
  editor: Editor | null;
  onUpdate: (id: string, content: string) => void;
}

export default function NoteEditor({ note, editor, onUpdate }: Props) {
  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content || '<p></p>');
    }
  }, [note._id]);

  if (!editor) return null;

  return (
    <Box sx={{ flex: 1 }}>
      <EditorContent editor={editor} />
    </Box>
  );
}
