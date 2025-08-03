
-- Add a new column to unique_experiences table for the line above the name
ALTER TABLE unique_experiences ADD COLUMN title_line text;

-- Create visa_free_destinations table
CREATE TABLE visa_free_destinations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line text NOT NULL,
  name text NOT NULL,
  image text NOT NULL,
  price text NOT NULL,
  position integer DEFAULT 0,
  status text DEFAULT 'published',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
