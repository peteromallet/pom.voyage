ALTER TABLE feedback ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Update RLS: public reads should exclude private feedback
DROP POLICY IF EXISTS "Public read feedback" ON feedback;
CREATE POLICY "Public read non-private feedback"
  ON feedback FOR SELECT
  USING (is_private = false);
