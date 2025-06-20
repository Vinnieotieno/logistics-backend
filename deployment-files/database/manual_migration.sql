-- 1. Drop all foreign keys referencing staff
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_created_by_fkey;
ALTER TABLE blogs DROP CONSTRAINT IF EXISTS blogs_author_id_fkey;
ALTER TABLE blog_likes DROP CONSTRAINT IF EXISTS blog_likes_user_id_fkey;
ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_created_by_fkey;
ALTER TABLE tracking_updates DROP CONSTRAINT IF EXISTS tracking_updates_updated_by_fkey;
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_created_by_fkey;
ALTER TABLE legal_pages DROP CONSTRAINT IF EXISTS legal_pages_updated_by_fkey;
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_created_by_fkey;

-- 2. Drop the staff table if it exists
DROP TABLE IF EXISTS staff CASCADE;

-- 3. Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Re-create foreign keys to users
ALTER TABLE services ADD CONSTRAINT services_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE blogs ADD CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id);
ALTER TABLE blog_likes ADD CONSTRAINT blog_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE shipments ADD CONSTRAINT shipments_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE tracking_updates ADD CONSTRAINT tracking_updates_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE jobs ADD CONSTRAINT jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE legal_pages ADD CONSTRAINT legal_pages_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE resources ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
