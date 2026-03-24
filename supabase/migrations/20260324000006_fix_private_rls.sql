-- Drop the old permissive policy that allows reading everything
DROP POLICY IF EXISTS "Public can read feedback" ON feedback;
DROP POLICY IF EXISTS "Public read feedback" ON feedback;
DROP POLICY IF EXISTS "Public read non-private feedback" ON feedback;

-- Create the correct policy: only non-private entries are readable
CREATE POLICY "Public read non-private feedback"
  ON feedback FOR SELECT
  USING (is_private = false);
