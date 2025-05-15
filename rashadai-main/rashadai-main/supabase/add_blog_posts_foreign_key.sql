-- Add foreign key relationship between blog_posts and profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_author_id_fkey'
  ) THEN
    ALTER TABLE blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES auth.users(id)
    ON DELETE SET NULL;
  END IF;
END
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON blog_posts(author_id);

-- Update RLS policies to allow proper access
DO $$
BEGIN
  -- Drop existing policies if they exist
  BEGIN
    DROP POLICY IF EXISTS blog_posts_select_policy ON blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist, continue
  END;

  -- Create new select policy
  CREATE POLICY blog_posts_select_policy ON blog_posts
    FOR SELECT USING (
      published = true OR
      auth.uid() = author_id OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN OTHERS THEN
  -- Handle errors
  RAISE NOTICE 'Error creating select policy: %', SQLERRM;
END
$$;

-- Insert policy
DO $$
BEGIN
  -- Drop existing policies if they exist
  BEGIN
    DROP POLICY IF EXISTS blog_posts_insert_policy ON blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist, continue
  END;

  -- Create new insert policy
  CREATE POLICY blog_posts_insert_policy ON blog_posts
    FOR INSERT WITH CHECK (
      auth.uid() = author_id OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN OTHERS THEN
  -- Handle errors
  RAISE NOTICE 'Error creating insert policy: %', SQLERRM;
END
$$;

-- Update policy
DO $$
BEGIN
  -- Drop existing policies if they exist
  BEGIN
    DROP POLICY IF EXISTS blog_posts_update_policy ON blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist, continue
  END;

  -- Create new update policy
  CREATE POLICY blog_posts_update_policy ON blog_posts
    FOR UPDATE USING (
      auth.uid() = author_id OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN OTHERS THEN
  -- Handle errors
  RAISE NOTICE 'Error creating update policy: %', SQLERRM;
END
$$;

-- Delete policy
DO $$
BEGIN
  -- Drop existing policies if they exist
  BEGIN
    DROP POLICY IF EXISTS blog_posts_delete_policy ON blog_posts;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist, continue
  END;

  -- Create new delete policy
  CREATE POLICY blog_posts_delete_policy ON blog_posts
    FOR DELETE USING (
      auth.uid() = author_id OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN OTHERS THEN
  -- Handle errors
  RAISE NOTICE 'Error creating delete policy: %', SQLERRM;
END
$$;
