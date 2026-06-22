# Sidebar Context Menu & UI Enhancements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace inline hover-reveal action buttons on sidebar items with right-click context menus, add chevron indicators to folders, and remove bulk import/export.

**Architecture:** All changes are in the NotesSidebar component and the context-menu UI component (added via shadcn). Folder/note items wrapped with ContextMenu provide right-click access to Rename, Create note (folders only), Download (notes only), and Move to trash. Chevrons use SidebarMenuAction. Bulk import/export page, API routes, and lib file are deleted.

**Tech Stack:** shadcn ContextMenu (Radix UI), lucide-react icons, Next.js App Router

---

### Task 1: Create feature branch

**Files:** None

- [ ] **Step 1: Create and switch to feature branch**

```bash
git checkout -b feature/context-menu-enhancements
```

- [ ] **Step 2: Stage the spec document**

```bash
git add docs/superpowers/specs/2026-06-22-sidebar-context-menu-enhancements-design.md
git commit -m "docs: add sidebar context menu design spec"
```

---

### Task 2: Add shadcn context-menu component

**Files:**
- Add: `src/components/ui/context-menu.tsx` (via shadcn)

- [ ] **Step 1: Add context-menu component**

```bash
npx shadcn@latest add context-menu
```

This creates `src/components/ui/context-menu.tsx` with the Radix UI context menu primitives wrapped in shadcn styling.

---

### Task 3: Add context menu + chevron to folder items; remove inline folder buttons

**Files:**
- Modify: `src/components/NotesSidebar.tsx`

- [ ] **Step 1: Add imports at top of file**

After the existing `CollapsibleContent` import, add context menu imports:

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
```

Add `ChevronRight, ChevronDown` to the lucide-react imports:

```tsx
import {
  Plus,
  Folder as FolderIcon,
  ChevronsUpDown,
  ChevronsDownUp,
  Trash2,
  Pencil,
  Pen,
  Search,
  Briefcase,
  User,
  GraduationCap,
  Music,
  Image,
  Video,
  FileText,
  Download,
  Code2,
  Utensils,
  Heart,
  StickyNote,
  Lightbulb,
  Star,
  Dumbbell,
  DollarSign,
  Plane,
  ShoppingCart,
  HeartPulse,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
```

Remove the `ExportNotePopover` import line:
```tsx
// DELETE this line:
import ExportNotePopover from "./ExportNotePopover"
```

- [ ] **Step 2: Add handler for creating note in a specific folder**

Add this after the `handleCreate` function (around line 198):

```tsx
const handleCreateInFolder = async (folderId: string) => {
  const folderNotes = notes
    .filter((n) => n.folderId === folderId)
    .sort((a, b) => a.position - b.position)
  const position = folderNotes.length > 0
    ? folderNotes[folderNotes.length - 1].position + 1000
    : 0
  const note = await createNote({ title: "Untitled Note", folderId, position })
  if (note) {
    if (!expandedFolders.has(folderId)) {
      toggleFolder(folderId)
    }
    setActiveNoteId(note._id)
  }
}
```

- [ ] **Step 3: Add handler for exporting a single note**

Add after `handleCreateInFolder`:

```tsx
const handleExportNote = async (noteId: string, noteTitle: string, format: "markdown" | "pdf") => {
  try {
    const res = await fetch(`/api/notes/${noteId}/export?format=${format}`)
    if (!res.ok) throw new Error("Export failed")
    const blob = await res.blob()
    const ext = format === "markdown" ? "md" : "pdf"
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${noteTitle}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error("Export failed:", err)
  }
}
```

- [ ] **Step 4: Wrap folder SidebarMenuItem with ContextMenu and add chevron**

Replace the current folder item structure (current lines 326-374, the `renderFolder` function) with:

```tsx
const renderFolder = (folder: Folder) => {
  const folderNotes = filtered.filter((n) => n.folderId === folder._id)
  const isExpanded = expandedFolders.has(folder._id)
  const FolderIconForFolder = getFolderIcon(folder.name)

  return (
    <Collapsible
      key={folder._id}
      open={isExpanded}
      onOpenChange={() => { toggleFolder(folder._id); setActiveFolderId(folder._id) }}
    >
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <ContextMenu>
                <ContextMenuTrigger render={
                  <CollapsibleTrigger render={<SidebarMenuButton isActive={activeFolderId === folder._id} />}>
                    <FolderIconForFolder />
                    {renamingId === folder._id ? (
                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => finishRename(folder._id)}
                        onKeyDown={(e) => { if (e.key === "Enter") finishRename(folder._id); if (e.key === "Escape") cancelRename() }}
                        autoFocus
                        className="h-6 text-xs px-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex-1 truncate text-left">{folder.name}</span>
                    )}
                  </CollapsibleTrigger>
                } />
                <ContextMenuContent>
                  <ContextMenuItem onClick={(e) => { e.stopPropagation(); startRenaming(folder._id, folder.name) }}>
                    <Pencil /> Rename
                  </ContextMenuItem>
                  <ContextMenuItem onClick={(e) => { e.stopPropagation(); handleCreateInFolder(folder._id) }}>
                    <Plus /> Create new note
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={(e) => { e.stopPropagation(); setDeleteFolderTarget(folder) }}>
                    <Trash2 /> Move to trash
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              {!renamingId && (
                <SidebarMenuAction showOnHover={false} onClick={() => { toggleFolder(folder._id); setActiveFolderId(folder._id) }}>
                  {isExpanded ? <ChevronDown /> : <ChevronRight />}
                </SidebarMenuAction>
              )}
            </SidebarMenuItem>
            <CollapsibleContent>
              <SidebarMenuSub>
                {folderNotes.length === 0 && (
                  <SidebarMenuSubItem>
                    <span className="block px-2 py-1 text-xs text-sidebar-foreground/50">No notes</span>
                  </SidebarMenuSubItem>
                )}
                {folderNotes.map((note, noteIndex) => renderNoteItem(note, noteIndex, folder._id))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Collapsible>
  )
}
```

Key changes from original:
- Wrap `SidebarMenuItem` content with `ContextMenu` / `ContextMenuTrigger`
- Remove the old inline button div (was lines 351-358)
- Add `SidebarMenuAction` with `ChevronRight`/`ChevronDown` (hidden during rename)

- [ ] **Step 5: Wrap note SidebarMenuSubItem with ContextMenu**

Replace the current `renderNoteItem` function (current lines 276-318) with:

```tsx
const renderNoteItem = (note: Note, noteIndex: number, parentFolderId: string | null) => (
  <SidebarMenuSubItem key={note._id}>
    {renamingId === note._id ? (
      <Input
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        onBlur={() => finishRename(note._id)}
        onKeyDown={(e) => { if (e.key === "Enter") finishRename(note._id); if (e.key === "Escape") cancelRename() }}
        autoFocus
        className="h-6 text-xs px-1 mx-2 my-0.5"
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <ContextMenu>
        <ContextMenuTrigger render={
          <SidebarMenuSubButton
            isActive={activeNoteId === note._id}
            onClick={() => { setActiveNoteId(note._id); setActiveFolderId(null); if (pathname !== "/") router.push("/") }}
            onDoubleClick={() => startRenaming(note._id, note.title)}
            className="pr-8"
            draggable
            onDragStart={(e) => handleDragStart(e, note._id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleNoteDragOver(e, noteIndex, parentFolderId)}
          >
            <span className="truncate">{note.title}</span>
          </SidebarMenuSubButton>
        } />
        <ContextMenuContent>
          <ContextMenuItem onClick={(e) => { e.stopPropagation(); startRenaming(note._id, note.title) }}>
            <Pencil /> Rename
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Download /> Download
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={(e) => { e.stopPropagation(); handleExportNote(note._id, note.title, "markdown") }}>
                <FileText /> Markdown
              </ContextMenuItem>
              <ContextMenuItem onClick={(e) => { e.stopPropagation(); handleExportNote(note._id, note.title, "pdf") }}>
                <File /> PDF
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={(e) => { e.stopPropagation(); setDeleteNoteTarget(note._id) }}>
            <Trash2 /> Move to trash
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )}
  </SidebarMenuSubItem>
)
```

Also add `File` to the first lucide-react import block (alongside `FileText` which is already there at line 48).

- [ ] **Step 6: Remove Import/Export from workspaceItems**

Change the `workspaceItems` array (around line 128-131):

```tsx
const workspaceItems = [
  { route: "/workspace/trash",          label: "Trash",            icon: Trash2 },
]
```

Remove the import-export entry with `FileUp`.

- [ ] **Step 7: Remove unused imports**

Remove `Download` from the first lucide-react import block (since it's imported in the second block already).

Remove the `ExportNotePopover` import line at the top of the file.

---

### Task 4: Delete bulk import/export files

**Files:**
- Delete: `src/app/workspace/import-export/page.tsx`
- Delete: `src/app/api/export/route.ts`
- Delete: `src/app/api/import/route.ts`
- Delete: `src/lib/import.ts`

- [ ] **Step 1: Delete the files**

```bash
git rm src/app/workspace/import-export/page.tsx
git rm src/app/api/export/route.ts
git rm src/app/api/import/route.ts
git rm src/lib/import.ts
```

---

### Task 5: Build and verify

- [ ] **Step 1: Run the build**

```bash
npm run build
```

Expected: Compilation succeeds with no errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 3: Commit all changes**

```bash
git add -A
git commit -m "feat: replace inline sidebar actions with right-click context menus and chevrons"
```

---

### Task 6: Push branch (optional)

- [ ] **Step 1: Push to remote**

```bash
git push origin feature/context-menu-enhancements
```
