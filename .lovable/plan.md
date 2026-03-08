

## Problem

The sidebar subscribes to Supabase realtime changes on the `processes` table, but the table was never added to the `supabase_realtime` publication. The subscription connects successfully but receives no events, so the sidebar never refreshes.

## Solution

**1. Database migration** — Add the `processes` table to the realtime publication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE processes;
```

This is a one-line migration. Once applied, the existing realtime subscription code in `AppSidebar.tsx` (lines 56-62) will start receiving INSERT, UPDATE, and DELETE events and call `loadProcesses()` accordingly.

**2. No frontend changes needed** — The subscription logic is already correctly implemented.

## Impact
- Sidebar will auto-refresh when processes are created, updated, or deleted
- No UI code changes required

