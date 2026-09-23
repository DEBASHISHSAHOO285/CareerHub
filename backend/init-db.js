const db = require("./database");

/* ================================
   STUDENTS TABLE
================================ */

db.exec(`
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    college TEXT,
    course TEXT,
    branch TEXT,
    cgpa REAL,
    skills TEXT,
    resume TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_type TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_type TEXT NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_type TEXT NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);


/* ================================
   COMPANIES TABLE
================================ */

db.exec(`
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    description TEXT,
    location TEXT,
    logo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);


/* ================================
   JOBS TABLE
================================ */

db.exec(`
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    salary TEXT,
    job_type TEXT,
    skills TEXT,
    deadline TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id)
        REFERENCES companies(id)
);
`);


/* ================================
   APPLICATIONS TABLE
================================ */

db.exec(`
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(id),

    FOREIGN KEY (job_id)
        REFERENCES jobs(id),

    UNIQUE(student_id, job_id)
);
`);


/* ================================
   SAVED JOBS TABLE
================================ */

db.exec(`
CREATE TABLE IF NOT EXISTS saved_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(id),

    FOREIGN KEY (job_id)
        REFERENCES jobs(id),

    UNIQUE(student_id, job_id)
);
`);


/* ================================
   INTERVIEWS TABLE
================================ */

db.exec(`
CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    interview_date TEXT NOT NULL,
    interview_time TEXT NOT NULL,
    mode TEXT,
    meeting_link TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (application_id)
        REFERENCES applications(id)
);
`);

console.log("All database tables created successfully.");

db.close();