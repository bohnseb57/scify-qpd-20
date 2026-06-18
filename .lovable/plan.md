## Goal

Add structural **parent → child process** relationships so a process like "Audit" can declare "Findings" as a subprocess, with a Findings tab on each Audit record, inline create that auto-links back to the parent, and a status rollup (counts by status) on the parent.

Constraints from your answers:
- A child process has **exactly one** parent process (1:1 declaration).
- Children appear as a **tab with a list + inline create** on the parent record.
- Lifecycle is **loose with status rollup only** — no gating, no cascade closure.

## Data model changes

Add one nullable column on `processes`:

- `parent_process_id uuid REFERENCES public.processes(id) ON DELETE SET NULL`
- Index on `parent_process_id`.

That's enough for "one parent only". No new table needed for the declaration.

For the actual parent-record ↔ child-record link, **reuse the existing `record_links` table** with a new `link_type` value: `'child_of'` (target = parent record, source = child record). This keeps one linking mechanism instead of two.

On parent process deletion: `parent_process_id` becomes NULL on the children (they remain standalone processes). Existing `record_links` rows are unaffected unless the records themselves are deleted (already handled by current cascade).

## Backend behavior

- When creating a record for a process that has `parent_process_id` set, **require** a `parent_record_id` (passed via URL param or selector) and write a `record_links` row (`source=child record`, `target=parent record`, `link_type='child_of'`, `target_process_id=parent process`).
- Reads for the parent tab: query `record_links` where `target_record_id = <parent record>` and `link_type='child_of'`, join `process_records` for status/title.

## UI changes

**1. Process configuration (`ProcessConfiguration` page)**
   - New "Parent process" dropdown in process settings. Lists all other processes. Optional. Saving sets `parent_process_id`.
   - Helper text: "Records of this process will appear as children of the selected parent's records."

**2. Manage Processes list**
   - Show a small "↳ child of {Parent}" badge under processes that have a parent, so the hierarchy is visible.

**3. Sidebar (`AppSidebar`)**
   - Group children under their parent visually (indent + chevron). Parent processes that have children become collapsible. Top-level list stays flat for parentless processes.

**4. Record creation flow**
   - If the process has a `parent_process_id`:
     - If launched from a parent record's "+ Add Finding" button, parent record id is in the URL — pre-fill and lock.
     - If launched standalone (e.g., from sidebar), show a required "Parent {ParentProcessName} record" selector in step 1 before normal fields.

**5. Record Details page (parent side)**
   - For each child process declared with this process as parent, render a new tab labeled with the child process name (e.g., "Findings").
   - Tab contents: table of child records (title, status, owner, created_at), with an "Add {ChildProcessName}" button that routes to the child's create flow with `?parent_record_id=<id>` so the link is auto-written on save.
   - Above the table: a **status rollup strip** — counts grouped by `process_records.status` (e.g., Open 4 · In Review 2 · Closed 7) using the child process's status set. No gating on parent close.

**6. Record Details page (child side)**
   - Existing "Linked records" section already surfaces relationships; add a "Parent: {ParentProcessName} → {parent record title}" line at the top of the record header when a `child_of` link exists, with a back-link to the parent record.

## Out of scope (explicit, per your answers)

- No auto-creation of children when a parent record is created.
- No gating: parent can be closed/completed regardless of child statuses.
- No cascade-close or cascade-delete from parent to child records.
- No multi-parent reuse (a process declares at most one parent).
- No nesting beyond one level in this iteration (a child can technically declare its own parent in the DB, but UI for grandchildren is not built here — easy follow-up if needed).

## Technical details

Files expected to change:
- New migration: add `parent_process_id` column + index on `processes`.
- `src/pages/ProcessConfiguration.tsx` — parent-process selector.
- `src/pages/ProcessConfigurationList.tsx` (Manage Processes) — child-of badge.
- `src/components/AppSidebar.tsx` — grouped/indented rendering for parent→child processes.
- `src/components/ProcessWizard.tsx` and `src/components/GuidedRecordCreation.tsx` — parent-record selector / pre-fill from `?parent_record_id`.
- `src/pages/CreateProcess.tsx` (and wherever record-create is finalized) — write the `record_links` row on save when a parent record is bound.
- `src/pages/RecordDetails.tsx` — new "Children" tabs per declared child process, status rollup strip, "Add {Child}" button, parent back-link header.
- `src/components/LinkedRecordsSection.tsx` — minor: filter out `child_of` rows since they're shown in their dedicated tab/header.
- Types regenerate after migration; downstream type fixes only.

No edge-function changes. No new tables. RLS on `processes` and `record_links` already covers the new column/link rows.
