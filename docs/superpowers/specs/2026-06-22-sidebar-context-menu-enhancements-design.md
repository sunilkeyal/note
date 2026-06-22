# Sidebar Context Menu & UI Enhancements

## Overview

Replace inline hover-reveal action buttons on folder and note sidebar items with right-click context menus, add folder chevron indicators, and remove bulk import/export.

## Changes

### 1. Right-Click Context Menu — Folders

Wrap each folder's `SidebarMenuItem` with shadcn `ContextMenu`:

| Menu Item | Action |
|-----------|--------|
| Rename | Triggers inline rename (`startRenaming(folder._id, folder.name)`) |
| Create new note | Creates note in folder via `createNote`, auto-expands folder, appends at end |
| Move to trash | Opens `DeleteFolderDialog` |

### 2. Right-Click Context Menu — Notes

Wrap each note's `SidebarMenuSubItem` with shadcn `ContextMenu`:

| Menu Item | Action |
|-----------|--------|
| Rename | Triggers inline rename (`startRenaming(note._id, note.title)`) |
| Download | Opens `ExportNotePopover` |
| Move to trash | Opens `DeleteConfirmDialog` |

### 3. Chevron Icons on Folders

Add `ChevronRight`/`ChevronDown` icon at the right edge of each folder item using `SidebarMenuAction` (showOnHover=false), toggling based on expanded/collapsed state.

### 4. Remove Inline Action Buttons

- **Notes (lines 302-314):** Remove the hover-reveal button group (download/rename/trash)
- **Folders (lines 351-358):** Remove the hover-reveal button group (rename/trash)

Functionality preserved via context menus.

### 5. Remove Bulk Import/Export

**Files to delete:**
- `src/app/workspace/import-export/page.tsx`
- `src/app/api/export/route.ts`
- `src/app/api/import/route.ts`
- `src/lib/import.ts`

**Navigation:** Remove `"Import / Export"` entry from `workspaceItems` in `NotesSidebar.tsx`.

**Preserved:** `ExportNotePopover`, `src/app/api/notes/[id]/export/route.ts`, `src/lib/export.ts`, `src/lib/pdf.ts` — individual note export continues working.

## New Dependencies

- `npx shadcn add context-menu` — adds `src/components/ui/context-menu.tsx`

## Files Modified

| File | Change |
|------|--------|
| `src/components/NotesSidebar.tsx` | Context menus, chevrons, remove buttons & nav item |
| `src/components/ui/context-menu.tsx` | **New** — shadcn context menu component |
| `src/app/workspace/import-export/page.tsx` | **Deleted** |
| `src/app/api/export/route.ts` | **Deleted** |
| `src/app/api/import/route.ts` | **Deleted** |
| `src/lib/import.ts` | **Deleted** |

## Branch

Feature branch: `feature/context-menu-enhancements`
