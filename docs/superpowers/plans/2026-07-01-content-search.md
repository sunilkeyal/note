# Content Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend search to include note content across all search inputs, with unified results on home page and text highlighting in the editor.

**Architecture:** Client-side filtering using existing in-memory notes. Search query passed via URL param (`?q=`) to carry the search term into the editor for text highlighting using the existing `@tiptap/extension-highlight`.

**Tech Stack:** React 19, Next.js 16 App Router, TipTap 3, MongoDB, Tailwind CSS

---

### Task 1: Extract `stripHtml` to shared utility

**Files:**
- Modify: `src/lib/utils.ts`
- Create: `src/__tests__/utils.test.ts` (extend)

- [ ] **Step 1: Add `stripHtml` to `src/lib/utils.ts`**

```typescript
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}
```

- [ ] **Step 2: Add tests for `stripHtml` in `src/__tests__/utils.test.ts`**

Add to existing `describe('cn', ...)` block:

```typescript
import { cn, stripHtml } from '@/lib/utils'

describe('stripHtml', () => {
  it('strips HTML tags', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('returns empty string for empty input', () => {
    expect(stripHtml('')).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(stripHtml('hello world')).toBe('hello world')
  })

  it('trims whitespace', () => {
    expect(stripHtml('  <p>content</p>  ')).toBe('content')
  })
})
```

- [ ] **Step 3: Run tests to verify**

Run: `npx vitest run src/__tests__/utils.test.ts`
Expected: All existing + new tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils.ts src/__tests__/utils.test.ts
git commit -m "feat: add stripHtml utility to shared utils"
```

---

### Task 2: Update sidebar search — content search + pass query param

**Files:**
- Modify: `src/components/NotesSidebar.tsx`
- Test: `src/__tests__/notes-sidebar.test.tsx`

- [ ] **Step 1: Add `stripHtml` import to sidebar**

At the top of `src/components/NotesSidebar.tsx`, add to imports:
```typescript
import { stripHtml } from "@/lib/utils"
```

- [ ] **Step 2: Change filter logic (lines 289-291)**

Change from:
```typescript
const filtered = search
  ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
  : notes
```

To:
```typescript
const query = search.toLowerCase()
const filtered = search
  ? notes.filter((n) =>
      n.title.toLowerCase().includes(query) ||
      stripHtml(n.content).toLowerCase().includes(query)
    )
  : notes

- [ ] **Step 3: Pass query param when clicking a search result**

In the `renderNoteItem` function, change the `onClick` handler on the Button to pass the `q` param when search is active:

```typescript
onClick={() => {
  setActiveNoteId(note._id)
  setActiveFolderId(null)
  const target = pathname !== "/" ? "/" : undefined
  const searchParam = search ? `?q=${encodeURIComponent(search)}` : ""
  router.push(target ? `${target}${searchParam}` : `${pathname}${searchParam}`)
}}
```

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run src/__tests__/notes-sidebar.test.tsx`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/NotesSidebar.tsx
git commit -m "feat: extend sidebar search to include note content and pass query param"
```

---

### Task 3: Update home page — unified search results view

**Files:**
- Modify: `src/components/HomePage.tsx`

- [ ] **Step 1: Update imports**

Change:
```typescript
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}
```
To import:
```typescript
import { stripHtml } from "@/lib/utils"
```

- [ ] **Step 2: Add a `searchResults` derived state**

After the existing `filteredNotes` memo (line 109-117), add:

```typescript
const searchResults = useMemo(() => {
  if (!searchQuery.trim()) return null
  const query = searchQuery.toLowerCase()
  return sortedNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(query) ||
      stripHtml(note.content).toLowerCase().includes(query)
  )
}, [sortedNotes, searchQuery])
```

- [ ] **Step 3: Replace sections layout when searching**

In the return JSX (around line 185-231), replace the sections area with a conditional:

```tsx
{/* Search Results or Sections */}
{searchResults ? (
  <div className="space-y-3">
    <p className="text-sm text-muted-foreground">
      Search results for &quot;{searchQuery}&quot; — {searchResults.length} {searchResults.length === 1 ? "note" : "notes"} found
    </p>
    {searchResults.length === 0 ? (
      <p className="text-sm text-muted-foreground py-6 text-center">No notes match your search.</p>
    ) : (
      <div className="space-y-2">
        {searchResults.map((note) => (
          <div
            key={note._id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => {
              handleNoteClick(note._id)
              router.push(`/?q=${encodeURIComponent(searchQuery)}`)
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{note.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {stripHtml(note.content) || "No content"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(note._id) }}
                className="text-muted-foreground hover:text-amber-500 transition-colors"
              >
                <Star className={`h-4 w-4 ${note.isFavorite ? "text-amber-500 fill-amber-500" : ""}`} />
              </button>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(note.updatedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
) : (
  <>
    {/* Mobile sections */}
    <div className="space-y-8 sm:hidden">
      ...
    </div>
    {/* Desktop sections */}
    <div className="hidden sm:grid sm:grid-cols-2 gap-6">
      ...
    </div>
  </>
)}
```

- [ ] **Step 4: Remove local `stripHtml` definition**

Delete the inline `stripHtml` function.

- [ ] **Step 5: Run tests to verify**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/HomePage.tsx
git commit -m "feat: show unified search results on home page when searching"
```

---

### Task 4: Update favorites page — content search + pass query param

**Files:**
- Modify: `src/app/favorites/page.tsx`

- [ ] **Step 1: Update imports**

Change import and remove local `stripHtml`:
```typescript
import { Star, FileText, Search, X, MoreHorizontal, Pencil, Download, Trash2, File } from "lucide-react"
```
Add:
```typescript
import { stripHtml } from "@/lib/utils"
```

Remove the local `function stripHtml` definition.

- [ ] **Step 2: Change filter logic (line 79)**

From:
```typescript
return favoriteNotes.filter(n => n.title.toLowerCase().includes(q))
```
To:
```typescript
return favoriteNotes.filter(n =>
  n.title.toLowerCase().includes(q) ||
  stripHtml(n.content).toLowerCase().includes(q)
)
```

- [ ] **Step 3: Pass query param when clicking a search result**

Find the click handler that navigates to the note and add the query param:
```typescript
function handleNoteClick(id: string) {
  const note = notes.find(n => n._id === id)
  if (note?.folderId && !expandedFolders.has(note.folderId)) {
    toggleFolder(note.folderId)
  }
  setActiveNoteId(id)
  router.push(filter ? `/?q=${encodeURIComponent(filter)}` : "/")
}
```

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/favorites/page.tsx
git commit -m "feat: extend favorites search to include note content and pass query param"
```

---

### Task 5: Update recent page — content search + pass query param

**Files:**
- Modify: `src/app/recent/page.tsx`

- [ ] **Step 1: Update imports**

Add:
```typescript
import { stripHtml } from "@/lib/utils"
```
Remove local `function stripHtml` definition.

- [ ] **Step 2: Change filter logic (line 82)**

From:
```typescript
return sortedNotes.filter(n => n.title.toLowerCase().includes(q))
```
To:
```typescript
return sortedNotes.filter(n =>
  n.title.toLowerCase().includes(q) ||
  stripHtml(n.content).toLowerCase().includes(q)
)
```

- [ ] **Step 3: Pass query param when clicking a search result**

Find the click handler that navigates to the note and add the query param:
```typescript
function handleNoteClick(id: string) {
  const note = notes.find(n => n._id === id)
  if (note?.folderId && !expandedFolders.has(note.folderId)) {
    toggleFolder(note.folderId)
  }
  setActiveNoteId(id)
  router.push(filter ? `/?q=${encodeURIComponent(filter)}` : "/")
}
```

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/recent/page.tsx
git commit -m "feat: extend recent search to include note content and pass query param"
```

---

### Task 6: Add search text highlighting in editor

**Files:**
- Modify: `src/components/MainArea.tsx`
- Test: `src/__tests__/main-area.test.tsx`

- [ ] **Step 1: Add URL search params reading and highlight effect**

In `src/components/MainArea.tsx`, add after the existing editor setup effect:

```typescript
// Search highlight effect
useEffect(() => {
  if (!editor || !activeNote) return

  const params = new URLSearchParams(window.location.search)
  const query = params.get("q")
  
  // Clear existing search highlights
  editor.chain().focus().unsetHighlight().run()

  if (!query || !query.trim()) return

  const lowerQuery = query.toLowerCase()
  const doc = editor.state.doc
  const markType = editor.schema.marks.highlight
  if (!markType) return

  const tr = editor.state.tr
  let hasMatches = false

  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      const text = node.text
      const lowerText = text.toLowerCase()
      let startIdx = 0
      while ((startIdx = lowerText.indexOf(lowerQuery, startIdx)) !== -1) {
        const from = pos + startIdx
        const to = from + lowerQuery.length
        tr.addMark(from, to, markType.create({ color: "#fef08a" }))
        startIdx += lowerQuery.length
        hasMatches = true
      }
    }
    return true
  })

  if (hasMatches) {
    editor.view.dispatch(tr)
  }
}, [editor, activeNote?._id])
```

Add `useEffect` to the React import if not already there.

- [ ] **Step 2: Update tests for the highlight behavior**

In `src/__tests__/main-area.test.tsx`, the editor mock needs to support the highlight chain. The existing mock has `toggleHighlight` and `unsetHighlight` already. The test just needs to verify the component renders without error when `?q=` is present. Add a basic test:

```typescript
it('renders with search query parameter', () => {
  // Mock window.location.search
  const originalLocation = window.location
  delete (window as any).location
  window.location = { ...originalLocation, search: '?q=test' }
  
  const mockNotes = { activeNote: mockNote, loading: false }
  ;(useNotes as ReturnType<typeof vi.fn>).mockReturnValue(mockNotes)
  
  render(<MainArea />)
  expect(screen.getByTestId('editor-content')).toBeDefined()
  
  window.location = originalLocation
})
```

- [ ] **Step 3: Run tests to verify**

Run: `npx vitest run src/__tests__/main-area.test.tsx`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/MainArea.tsx src/__tests__/main-area.test.tsx
git commit -m "feat: highlight searched text in editor using TipTap highlight extension"
```

---

### Task 7: Build and verify

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Compiles successfully with no errors.
