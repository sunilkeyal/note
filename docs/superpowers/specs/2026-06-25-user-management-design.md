# User Management Design

## Overview

Replace the dummy user management page with a fully functional admin panel. Admins can list, search, create, edit, disable, delete users, and reset passwords.

## User Model

Add `isActive` field to the existing `users` collection:

| Field | Type | Notes |
|-------|------|-------|
| `email` | string | Unique identifier, used for login |
| `displayName` | string | Display name |
| `passwordHash` | string | bcrypt hash |
| `role` | `"admin"` \| `"user"` | Access level |
| `isActive` | boolean | Default `true`. `false` = cannot log in |
| `createdAt` | Date | Auto-set |
| `updatedAt` | Date | Auto-set on update |

Existing users without `isActive` are treated as active.

## API Routes

All routes require admin session. All use existing `ApiResponse<T>` pattern.

### `GET /api/admin/users`
Query params: `search` (name/email), `page` (default 1), `limit` (default 20), `role`, `status` (active/disabled)

Response: `{ success: true, data: { users: User[], total: number, page: number, limit: number } }`

Returns users sorted by `createdAt` descending. `search` does case-insensitive regex match on `displayName` and `email`. Role/status filters are optional.

### `POST /api/admin/users`
Body: `{ email, displayName, role }`

Auto-generates a secure random password (12 chars, alphanumeric + special). Emails credentials to the user via Resend. Returns created user with `temporaryPassword` field (shown once, not stored) so admin can share it manually if email delivery fails.

### `GET /api/admin/users/[id]`
Returns single user document (without passwordHash). Returns 404 if not found.

### `PUT /api/admin/users/[id]`
Body: `{ displayName?, role?, isActive? }`

Updates user fields. Prevents disabling the last admin user. Returns updated user.

### `DELETE /api/admin/users/[id]`
Hard-deletes user and all their notes and folders from MongoDB. Prevents deleting the last admin user. Returns `{ success: true }`.

### `POST /api/admin/users/[id]/reset-password`
Generates new random password, updates hash in DB, emails new credentials to user. Returns `{ success: true, temporaryPassword: "..." }` (shown once) so admin can share it manually if email delivery fails.

## User Management Page

**File:** `src/app/admin/users/page.tsx` (client component `"use client"`)

**Sub-components:**

| File | Purpose |
|------|---------|
| `users-table.tsx` | Search bar, role/status filters, data table, pagination |
| `create-user-dialog.tsx` | Modal form: email, displayName, role; auto-generate password on submit |
| `edit-user-dialog.tsx` | Modal form: email (read-only), displayName, role |
| `delete-user-dialog.tsx` | Confirmation dialog with warning about data loss |
| `reset-password-dialog.tsx` | Confirmation dialog, shows result (new password sent via email) |

**Table columns:** Name, Email, Role (badge), Status (active/disabled badge + toggle), Created, Edit / Reset Password / Delete action buttons

**Pagination:** Page controls at bottom, page size selector (10/20/50)

**Search:** Debounced input filtering by name/email client-side after fetch, or server-side via API query param.

## Auth Changes

In `src/lib/auth.ts` `authorize` callback, after finding user: reject login if `user.isActive === false` with error message "Account has been disabled. Contact an administrator."

## Email Integration

Use existing Resend setup (`src/lib/email.ts`). Two email templates:

- **Welcome:** "An admin created your ZooNoteBar account. Email: `<email>`, Temporary password: `<password>`"
- **Password reset:** "Your ZooNoteBar password has been reset by an admin. New temporary password: `<password>`"

## Database Migration

Existing users without `isActive` field are handled gracefully — `findOne` queries include `{ $or: [{ isActive: { $exists: false } }, { isActive: true }] }` for active checks, or treat missing as active in code.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/admin/users/page.tsx` | Rewrite — client component |
| `src/app/admin/users/users-table.tsx` | Create |
| `src/app/admin/users/create-user-dialog.tsx` | Create |
| `src/app/admin/users/edit-user-dialog.tsx` | Create |
| `src/app/admin/users/delete-user-dialog.tsx` | Create |
| `src/app/admin/users/reset-password-dialog.tsx` | Create |
| `src/app/api/admin/users/route.ts` | Create — GET (list) + POST (create) |
| `src/app/api/admin/users/[id]/route.ts` | Create — GET + PUT + DELETE |
| `src/app/api/admin/users/[id]/reset-password/route.ts` | Create — POST |
| `src/lib/auth.ts` | Modify — check isActive on login |

## Edge Cases

- **Last admin guard:** Prevent disabling or deleting the last admin user. API returns 400 with error message.
- **Duplicate email:** POST creates returns 409 if email already exists.
- **Self-disable:** Admin can disable their own account (logout won't work after). Not explicitly blocked.
- **Missing isActive field:** Treated as active in login check.
- **Email sending failure:** User is created/password is reset, but error shown to admin. Temporary password is returned in API response so admin can share it manually.
