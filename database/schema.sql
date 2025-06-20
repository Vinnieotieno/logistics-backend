-- Staff table with role-based access
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('superadmin', 'admin', 'staff')),
    department VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    department VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    overview TEXT,
    key_benefits TEXT[],
    service_coverage TEXT,
    how_to_book TEXT,
    image_url TEXT,
    gallery_urls TEXT[],
    is_published BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_by INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE services
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]';

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    content TEXT,
    featured_image TEXT,
    author_id INTEGER REFERENCES staff(id),
    category_id INTEGER REFERENCES blog_categories(id),
    read_time INTEGER DEFAULT 5,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags TEXT[],
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog comments
CREATE TABLE IF NOT EXISTS blog_comments (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog likes
CREATE TABLE IF NOT EXISTS blog_likes (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
    ip_address INET,
    user_id INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_id, ip_address)
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracking system
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    sender_phone VARCHAR(50),
    sender_address TEXT,
    receiver_name VARCHAR(255) NOT NULL,
    receiver_email VARCHAR(255),
    receiver_phone VARCHAR(50),
    receiver_address TEXT,
    package_description TEXT,
    weight DECIMAL(10,2),
    dimensions VARCHAR(100),
    cbm DECIMAL(10,4),
    declared_value DECIMAL(12,2),
    service_type VARCHAR(100),
    origin VARCHAR(255),
    destination VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    mode VARCHAR(50),
    created_by INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    package_name VARCHAR(255),
    number_of_packages INTEGER,
    is_dangerous_good BOOLEAN DEFAULT false,
    un_number VARCHAR(20)
);

-- Tracking updates
CREATE TABLE IF NOT EXISTS tracking_updates (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    updated_by INTEGER REFERENCES staff(id),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts/Inquiries
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255),
    location VARCHAR(255),
    job_type VARCHAR(50) CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    salary_range VARCHAR(100),
    benefits TEXT[],
    is_published BOOLEAN DEFAULT false,
    application_deadline DATE,
    created_by INTEGER REFERENCES staff(id),
    is_closed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job applications
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    cover_letter TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    company VARCHAR(255),
    content TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    is_published BOOLEAN DEFAULT false,
    improvement TEXT,
    consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legal pages
CREATE TABLE IF NOT EXISTS legal_pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    updated_by INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources/Downloads
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    category VARCHAR(100),
    is_published BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL CHECK (department IN (
        'managing_director', 
        'management', 
        'accounts', 
        'hr', 
        'sales', 
        'customer_service', 
        'it', 
        'marketing_communication', 
        'operations'
    )),
    message TEXT,
    avatar_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    social_linkedin VARCHAR(255),
    social_twitter VARCHAR(255),
    social_facebook VARCHAR(255),
    social_instagram VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Messages/Memos
CREATE TABLE IF NOT EXISTS team_messages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    department VARCHAR(100)[], -- Array of departments or null for all
    sender_id INTEGER REFERENCES staff(id),
    is_email_sent BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add attachments column to team_messages table if it does not exist
ALTER TABLE team_messages
ADD COLUMN IF NOT EXISTS attachments TEXT;

-- Message Read Status
CREATE TABLE IF NOT EXISTS message_reads (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES team_messages(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, staff_id)
);

-- Chat Rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'group' CHECK (type IN ('group', 'direct', 'department')),
    department VARCHAR(100),
    created_by INTEGER REFERENCES staff(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Room Members
CREATE TABLE IF NOT EXISTS chat_room_members (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    is_admin BOOLEAN DEFAULT false,
    UNIQUE(room_id, staff_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES staff(id),
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    file_url TEXT,
    file_name VARCHAR(255),
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    reply_to_id INTEGER REFERENCES chat_messages(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message Reactions
CREATE TABLE IF NOT EXISTS message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, staff_id, reaction)
);

-- Anonymous Surveys/Suggestions
CREATE TABLE IF NOT EXISTS employee_surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    anonymous_only BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES staff(id),
    closes_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Survey Responses
CREATE TABLE IF NOT EXISTS survey_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES employee_surveys(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    category VARCHAR(100),
    sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'neutral', 'negative', 'suggestion', 'complaint')),
    is_anonymous BOOLEAN DEFAULT true,
    -- Don't link to staff for anonymous responses
    staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Survey Templates
CREATE TABLE IF NOT EXISTS survey_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    created_by INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_team_members_department ON team_members(department);
CREATE INDEX idx_team_members_staff_id ON team_members(staff_id);
CREATE INDEX idx_team_messages_created_at ON team_messages(created_at DESC);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id, created_at);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);