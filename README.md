# TestNodeApi - Node.js RESTful API with Authentication and Authorization

## Description

**TestNodeApi** is a simple RESTful API built with Node.js and Express.js. It provides endpoints for managing users, projects, tasks, and user-project associations. The API includes authentication and authorization using JSON Web Tokens (JWT), ensuring that users can only access and manipulate their own data.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT authentication and authorization
- CRUD operations for users, projects, and tasks
- Assign users to projects
- Access control: users see only their own projects and tasks
- Logout functionality with token invalidation

## Technologies Used

- **Node.js** and **Express.js** for server-side logic
- **PostgreSQL** for the database
- **pg** library for database interaction
- **bcrypt** for password hashing
- **jsonwebtoken** for JWT authentication
- **dotenv** for environment variable management

## Prerequisites

- **Node.js** and **npm** installed on your machine
- **PostgreSQL** database set up
- **Git** installed (optional, for cloning the repository)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/TestNodeApi.git
cd TestNodeApi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up the PostgreSQL Database

- **Create a new PostgreSQL database**.

- **Run the following SQL scripts** to create the necessary tables:

  ```sql
  -- Create users table
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
  );

  -- Create projects table
  CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id)
  );

  -- Create tasks table
  CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    project_id INTEGER REFERENCES projects(id)
  );

  -- Create user_projects table
  CREATE TABLE user_projects (
    user_id INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    PRIMARY KEY (user_id, project_id)
  );

  -- Create token_blacklist table (if implementing token invalidation)
  CREATE TABLE token_blacklist (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
  );
  ```

### 4. Configure Environment Variables

- **Create a `.env` file** in the root directory of the project.

- **Add the following environment variables**:

  ```
  PORT=5000
  DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
  JWT_SECRET=your_jwt_secret_key
  ```

  - Replace `username`, `password`, and `your_database_name` with your PostgreSQL credentials and database name.
  - Replace `your_jwt_secret_key` with a strong, random string.

### 5. Start the Server

```bash
node index.js
```

- The server should start and listen on the specified port (default is **5000**).
- You should see `Server running on port 5000` in the console.


## API Endpoints

### Authentication
- **Register**: `POST /api/users/register`
- **Login**: `POST /api/users/login`
- **Logout**: `GET /api/users/logout`

### Projects
- **Create Project**: `POST /api/projects`
- **Get User's Projects**: `GET /api/projects`
- **Update Project**: `PUT /api/projects/:id`
- **Delete Project**: `DELETE /api/projects/:id`

### Tasks
- **Create Task**: `POST /api/tasks`
- **Get User's Tasks**: `GET /api/tasks`
- **Update Task**: `PUT /api/tasks/:id`
- **Delete Task**: `DELETE /api/tasks/:id`

