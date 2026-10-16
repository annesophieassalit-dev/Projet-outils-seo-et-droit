-- Compteur de posts gratuits utilisés (3 max, lifetime, sans CB)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_posts_used INT NOT NULL DEFAULT 0;
