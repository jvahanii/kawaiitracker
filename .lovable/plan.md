# Workspace data export & import

Give admins and superusers a way to download everything in a workspace as a single file, and load such a file back in later.

## Export

- New **Export data** button in the workspace top bar (visible to admins and superusers only).
- Downloads a `.json` file named e.g. `tracker-<workspace>-<date>.json` containing:
  - folder tree (names, nesting, order)
  - entries (title, status, notes, amount, order, folder)
  - monthly values per entry (planned and actual)
  - tasks per entry (title, done, order)
  - the savings goal(s)
- Excluded on purpose: member accounts, assignments, per-folder visibility, and the change history. The file is content only, so it can be imported into any workspace safely.
- The file carries a format version and the source workspace name so imports can be validated.

## Import

- **Import data** button next to Export, same permissions.
- Admin picks a file, then a confirmation dialog shows what the file contains (counts of folders, entries, tasks) and asks how to import:
  - **Replace everything** — deletes the workspace's current folders, entries, monthly values, tasks and goals, then loads the file.
  - **Add alongside** — keeps existing content and adds the file's folders and entries as new ones.
  - Replace requires an extra explicit confirmation because it is destructive.
- Invalid or wrong-version files are rejected with a clear message; nothing is changed.
- On success the workspace refreshes and a confirmation toast shows how much was imported.
- The import is recorded in the change history.

## Technical notes

- Two new server functions in `src/lib/api/backup.functions.ts`, both behind `requireSupabaseAuth`:
  - `exportWorkspace({ tenantId })` — verifies the caller is admin of that tenant or a superuser (`has_role`), then reads `folders`, `items`, `item_entries`, `item_tasks`, `savings_goals` scoped to the tenant and returns a versioned JSON DTO. IDs are replaced with local reference keys so the file is portable.
  - `importWorkspace({ tenantId, mode: "replace" | "append", payload })` — same permission check, Zod-validates the payload (with size caps), then in `replace` mode deletes tenant-scoped rows in dependency order (tasks → entries → item_assignees → items → folder_visibility → folders → savings_goals) before inserting. Inserts folders parent-first, remapping reference keys to new UUIDs, then items, then entries and tasks. Writes an `audit_log` row.
- All work goes through the RLS-scoped `context.supabase` client; no service-role usage.
- UI lives in `src/routes/_authenticated.app.$tenantId.tsx`: a small toolbar group plus an import dialog (shadcn `Dialog` + `AlertDialog` for the destructive confirm), a hidden file input, and query invalidation of `items`/`folders`/`entries`/`goal` on success.
- New i18n keys in `src/lib/locales/en.json` and `fi.json`.
- No schema migration needed.
