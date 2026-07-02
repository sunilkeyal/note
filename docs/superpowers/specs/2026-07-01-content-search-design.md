# Content Search

## Summary
Extend search to include note content across all search inputs (sidebar, home page, favorites page, recent page). On the home page, search replaces the sectioned layout with a unified results list.

## Changes

### 1. Shared utility — `src/lib/utils.ts`
- Add `stripHtml(html: string): string` — strips HTML tags and trims whitespace
- Remove the 3 duplicate definitions in `HomePage.tsx`, `favorites/page.tsx`, `recent/page.tsx`

### 2. Home page — `src/components/HomePage.tsx`
- Import `stripHtml` from `@/lib/utils`
- When `searchQuery` is non-empty, replace the Favorites + Recent Notes sections with a single flat list of matching notes
- Results show title (truncated) + content preview (truncated) + star toggle + relative time
- When search is cleared, sections reappear
- Remove local `stripHtml` definition

### 3. Sidebar — `src/components/NotesSidebar.tsx`
- Import `stripHtml` from `@/lib/utils`
- Change filter at line 289-291 from title-only to title + content:
  ```
  notes.filter((n) =>
    n.title.toLowerCase().includes(query) ||
    stripHtml(n.content).toLowerCase().includes(query)
  )
  ```

### 4. Favorites page — `src/app/favorites/page.tsx`
- Import `stripHtml` from `@/lib/utils`
- Change filter at line 79 from title-only to title + content
- Remove local `stripHtml` definition

### 5. Recent page — `src/app/recent/page.tsx`
- Import `stripHtml` from `@/lib/utils`
- Change filter at line 82 from title-only to title + content
- Remove local `stripHtml` definition

### 6. Text highlighting in editor — `src/components/MainArea.tsx`
- Read `q` query param from URL search params (e.g., `/?q=resource+allocation`)
- When `q` param is present and editor is loaded, traverse `editor.state.doc` to find all text nodes matching the query
- Apply `highlight` mark (`@tiptap/extension-highlight`, already configured with `multicolor: true`) to matching text ranges via a single ProseMirror transaction
- Use a soft yellow highlight color (`#fef08a`) for search matches, distinct from user-applied highlight colors
- Clear search highlights when:
  - User types or edits content
  - Query param changes
  - User navigates to a different note

### 7. Navigation from search results
When clicking a search result from any search input, navigate to `/?q=<searchterm>` with the note active:
- **Sidebar** (`NotesSidebar.tsx`): append `?q=` to the navigation when `search` state is non-empty
- **Home page** (`HomePage.tsx`): pass `?q=` when navigating from the unified search results view
- **Favorites page** (`favorites/page.tsx`): pass `?q=` when clicking a filtered result
- **Recent page** (`recent/page.tsx`): pass `?q=` when clicking a filtered result

### No other changes
- No API changes, no DB changes, no new types
- All filtering remains client-side (all notes already in memory)
