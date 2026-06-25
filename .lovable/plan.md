# Folder selection filters the chart

## What

In the workspace view, let the user toggle folders by clicking their name in the left-pane folder tree. The savings chart (top of the right pane) then shows only data from items inside the selected folders. With nothing selected, the chart behaves as today (shows everything).

## UX

- Click a folder name → toggles it in/out of the selection. Multiple folders can be selected.
- Selected folders get a clear visual state (accent background + bold name), matching the existing item-selected styling.
- Selecting a parent implicitly includes its subfolders' items — no need to also click children.
- A small "Clear filter (N)" chip appears in the chart header when ≥1 folder is selected; clicking it resets the selection.
- The folder chevron (expand/collapse), action icons (+, rename, delete, visibility, add subfolder) and drag handle behavior are unchanged. Clicking the chevron does not toggle selection; clicking the name does.
- The left-pane item list is **not** filtered — only the chart is. (Matches the user request: "filter the graph".)

## Technical notes

Files touched:
- `src/routes/_authenticated.app.$tenantId.tsx`
  - Add `selectedFolderIds: Set<string>` state on the workspace component.
  - Pass `selectedFolderIds`, `onToggleFolder(id)`, `onClearFolders()` into `FolderTreePane`.
  - In `FolderTreePane`'s `renderFolder`, wrap the folder name in a `<button onClick={() => onToggleFolder(folder.id)}>` and apply `bg-accent font-semibold` when selected. Keep the chevron button separate.
  - Pass `selectedFolderIds` to `<SavingsChart tenantId={...} selectedFolderIds={...} onClearFolders={...} />`.
- `src/components/SavingsChart.tsx`
  - New optional props `selectedFolderIds?: Set<string>`, `onClearFolders?: () => void`.
  - Build an "effective folder set" by expanding each selected id with all descendants using the folders list. Folders are already available via items query? No — fetch via `listFolders` server fn (already used in route). Pass `folders` down too, or derive descendants in the route and pass the expanded set. Simpler: pass `folders` array into chart (already loaded in parent) and expand there.
  - Filter `entries` to those whose `itemId`'s folder is in the effective set; build itemId→folderId map from `items` query already loaded in the chart. If the effective set is empty/undefined, no filtering.
  - Render a small "Clear (N)" button in the header when filter is active.
- i18n: add `workspace.clearFolderFilter` to `en.json` and `fi.json`.

No server, schema, or API changes. No changes to drag-and-drop, visibility, or chart math beyond pre-filtering the entries list.

## Out of scope

- Persisting the selection across reloads.
- Filtering the item list in the left pane.
- Selecting individual items to filter the chart.
