DROP TABLE IF EXISTS accounts CASCADE;

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

INSERT INTO accounts (id, username, password) VALUES (1, 'user', '$2b$11$BJDYOCs7cq.PsXg.XACdW.v/hZ910o98jm3ywgsXvmEBuhxLwrMjG');
INSERT INTO accounts (id, username, password) VALUES (2, 'root', '$2b$11$5dEjvZTU1AhqiqHvTIq1fOPlRJLDr1RlZxU9mUQbd79ekysRHH3Oy');

SELECT * FROM accounts;