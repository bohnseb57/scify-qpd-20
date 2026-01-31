
## Plan: Enable Process Deletion with Cascade Cleanup

### Problem Analysis
Currently, deleting a process fails when records exist due to foreign key constraints with `ON DELETE NO ACTION`. The dependency chain is:

```text
processes
    ├── process_fields (CASCADE - OK)
    ├── workflow_steps (CASCADE - but blocked by workflow_history)
    │       ├── process_records.current_step_id (NO ACTION - blocks)
    │       ├── workflow_history.from_step_id (NO ACTION - blocks)
    │       └── workflow_history.to_step_id (NO ACTION - blocks)
    ├── process_records (NO ACTION - blocks delete)
    │       ├── record_field_values (CASCADE - OK)
    │       ├── workflow_history.record_id (CASCADE - OK)
    │       └── record_links (CASCADE - OK)
    └── record_links.target_process_id (CASCADE - OK)
```

### Solution: Database Migration
Modify the foreign key constraints to use `ON DELETE CASCADE` or `ON DELETE SET NULL` where appropriate, allowing a clean cascade when a process is deleted.

---

### Technical Details

#### Database Migration Changes

**1. Update `process_records.process_id` constraint:**
```sql
ALTER TABLE process_records 
  DROP CONSTRAINT process_records_process_id_fkey;
ALTER TABLE process_records 
  ADD CONSTRAINT process_records_process_id_fkey 
  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE;
```

**2. Update `process_records.current_step_id` constraint:**
```sql
ALTER TABLE process_records 
  DROP CONSTRAINT process_records_current_step_id_fkey;
ALTER TABLE process_records 
  ADD CONSTRAINT process_records_current_step_id_fkey 
  FOREIGN KEY (current_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;
```

**3. Update `workflow_history.from_step_id` constraint:**
```sql
ALTER TABLE workflow_history 
  DROP CONSTRAINT workflow_history_from_step_id_fkey;
ALTER TABLE workflow_history 
  ADD CONSTRAINT workflow_history_from_step_id_fkey 
  FOREIGN KEY (from_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;
```

**4. Update `workflow_history.to_step_id` constraint:**
```sql
ALTER TABLE workflow_history 
  DROP CONSTRAINT workflow_history_to_step_id_fkey;
ALTER TABLE workflow_history 
  ADD CONSTRAINT workflow_history_to_step_id_fkey 
  FOREIGN KEY (to_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;
```

---

### Cascade Behavior After Changes

When a process is deleted:
1. **process_fields** - Deleted (CASCADE)
2. **workflow_steps** - Deleted (CASCADE)
3. **process_records** - Deleted (CASCADE)
   - **record_field_values** - Deleted (CASCADE from records)
   - **workflow_history** - Deleted (CASCADE from records, step references SET NULL first)
   - **record_links** (source) - Deleted (CASCADE from records)
4. **record_links** (target_process_id) - Deleted (CASCADE)

---

### UI Enhancement (Optional)

Update the delete confirmation dialog in `ProcessConfigurationList.tsx` to show how many records will be deleted:

```typescript
// Before delete, fetch count
const { count } = await supabase
  .from('process_records')
  .select('*', { count: 'exact', head: true })
  .eq('process_id', processId);

// Show in dialog:
// "This will permanently delete X records and all associated data."
```

---

### Summary of Changes

| File/Resource | Change |
|---------------|--------|
| Database Migration | Update 4 foreign key constraints to CASCADE/SET NULL |
| `ProcessConfigurationList.tsx` | (Optional) Show record count in delete confirmation |

### Impact
- Existing processes with records can be deleted without errors
- All related data (records, field values, workflow history, links) is cleaned up automatically
- No orphaned data remains in the database
