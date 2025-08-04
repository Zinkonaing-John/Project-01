CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE
);