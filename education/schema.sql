-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) CHECK (role IN ('teacher', 'student')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes Table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  join_code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments Table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Announcements Table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments Table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions Table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_url VARCHAR(255),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);

-- Materials Table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);