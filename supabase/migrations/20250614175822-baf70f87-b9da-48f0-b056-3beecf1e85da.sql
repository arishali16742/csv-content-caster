
-- Add new columns to the blog table
ALTER TABLE public.blog 
ADD COLUMN IF NOT EXISTS editor_name TEXT,
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS date_written DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT false;

-- Update existing records to have empty array for categories if null
UPDATE public.blog SET categories = ARRAY[]::TEXT[] WHERE categories IS NULL;
