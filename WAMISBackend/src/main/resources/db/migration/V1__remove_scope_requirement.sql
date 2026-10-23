-- Safe, data-preserving cleanup for the abandoned Scope workflow.
-- Existing scope_id values and the scopes table are retained for historical/reference safety.
-- After inspection has confirmed the affected columns exist, drop their NOT NULL constraints
-- so new Building/Others records can be written without a Scope association.
ALTER TABLE IF EXISTS buildings ALTER COLUMN scope_id DROP NOT NULL;
ALTER TABLE IF EXISTS others ALTER COLUMN scope_id DROP NOT NULL;

-- Building used to have a unique work_id. Multiple component rows in one work need to share it.
-- Remove only single-column unique constraints on work_id, retaining all rows and other constraints.
DO $$
DECLARE constraint_name text;
BEGIN
  IF to_regclass('buildings') IS NOT NULL THEN
    FOR constraint_name IN
      SELECT c.conname
      FROM pg_constraint c
      WHERE c.conrelid = 'buildings'::regclass
        AND c.contype = 'u'
        AND array_length(c.conkey, 1) = 1
        AND (SELECT a.attname FROM pg_attribute a
             WHERE a.attrelid = c.conrelid AND a.attnum = c.conkey[1]) = 'work_id'
    LOOP
      EXECUTE format('ALTER TABLE buildings DROP CONSTRAINT %I', constraint_name);
    END LOOP;
  END IF;
END $$;
