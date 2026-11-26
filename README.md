# WorkNest – Collaborative Project & Task Management Platform

WorkNest is a full-stack project and task management platform designed to help individuals and teams organize projects, manage tasks, track progress, and collaborate through a centralized workspace.

The application provides user authentication, project management, task tracking, team management, and account settings through an interactive web interface backed by RESTful APIs.

---

## Features

### 1. User Authentication
- User registration and login.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- Protected backend API routes.
- Role-based authorization.
- Refresh-token session management.

### 2. Dashboard
- Centralized workspace overview.
- Project statistics.
- Task statistics.
- Recent projects.
- Upcoming tasks.
- Navigation between application modules.

### 3. Project Management
- Create new projects.
- View projects.
- Delete projects.
- Manage project descriptions.
- Track project status.
- Project ownership validation.

**Project statuses:**
- Active
- Completed
- On Hold

### 4. Task Management
- Create, view, update, and delete tasks.
- Manage task descriptions.
- Set task priorities.
- Set due dates.
- Update task status.
- Search, filter, and sort tasks.

**Task statuses:**
- To Do
- In Progress
- Review
- Completed

**Task priorities:**
- Low
- Medium
- High

### 5. Team Management
- Create teams.
- View team details.
- Update team information.
- Add team members.
- Update member roles.
- Remove team members.
- Delete teams.

### 6. Account Settings
- View user profile information.
- Update name and email.
- Change account password.
- View account role and status.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React.js |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Programming Language | JavaScript, TypeScript (frontend) |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcryptjs |
| Validation | Zod |
| Security | Helmet, express-rate-limit |
| API Testing | Postman |
| Version Control | Git, GitHub |

---

## Application Architecture

WorkNest follows a client-server architecture.

```text
             USER
               |
               v
      NEXT.JS FRONTEND
       React + Tailwind
               |
               | HTTP / REST API
               | JSON + JWT
               v
       EXPRESS BACKEND
          Node.js
               |
       -----------------
       |       |       |
     Routes Controllers Middleware
               |
               v
         MONGOOSE ODM
               |
               v
         MONGODB ATLAS
               |
       -----------------
       |       |       |
     Users  Projects  Tasks
               |
             Teams
               |
            Sessions
```

### How it works

1. Users interact with the Next.js frontend.
2. The frontend sends HTTP requests to the Express backend.
3. Express routes direct requests to the appropriate controllers.
4. Middleware handles authentication, authorization, and request processing.
5. Mongoose interacts with MongoDB Atlas.
6. The backend returns JSON responses to the frontend.
7. The frontend displays the updated information.

---

## Project Structure

```text
WorkNest/
|
|-- backend/
|   |
|   |-- src/
|   |   |
|   |   |-- config/
|   |   |-- middleware/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- projects/
|   |   |   |-- tasks/
|   |   |   |-- teams/
|   |   |   |-- sessions/
|   |   |
|   |   |-- routes/
|   |   |-- utils/
|   |   |-- app.js
|   |   |-- server.js
|   |
|   |-- .env.example
|   |-- package.json
|
|-- frontend/
|   |
|   |-- app/
|   |   |-- dashboard/
|   |   |   |-- page.tsx
|   |   |   |-- projects/
|   |   |   |-- tasks/
|   |   |   |-- teams/
|   |   |   |-- settings/
|   |   |
|   |   |-- register/
|   |   |-- page.tsx
|   |   |-- layout.tsx
|   |
|   |-- lib/
|   |   |-- projects.ts
|   |   |-- tasks.ts
|   |   |-- settings.ts
|   |
|   |-- package.json
|
|-- .gitignore
|-- README.md
```

*The structure above is a high-level overview; individual files may vary as the project evolves.*

---

## Installation and Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git
- MongoDB Atlas account
- Visual Studio Code (recommended)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

Navigate into the project:

```bash
cd YOUR-REPOSITORY
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory.

Configure the environment variables using the keys and format expected by the backend `.env.example` and application configuration.

Typical configuration includes:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
```

Also configure the JWT secret and any other authentication settings required by your backend.

Start the backend development server:

```bash
npm run dev
```

Backend server:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file if your frontend configuration requires it.

Configure the API base URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start the frontend development server:

```bash
npm run dev
```

Frontend application:

```text
http://localhost:3000
```

---

## API Endpoints

The backend exposes RESTful APIs under:

```text
/api/v1
```

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Get current user profile |
| PATCH | `/auth/me` | Update user profile |
| PATCH | `/auth/change-password` | Change account password |
| GET | `/auth/admin-test` | Test admin authorization |

### Project APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects` | Create a project |
| GET | `/projects` | Get user's projects |
| DELETE | `/projects/:projectId` | Delete a project |

### Task APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/tasks` | Create a task |
| GET | `/tasks` | Get user's tasks |
| GET | `/tasks/:taskId` | Get task details |
| PATCH | `/tasks/:taskId` | Update a task |
| DELETE | `/tasks/:taskId` | Delete a task |

### Team APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/teams` | Create a team |
| GET | `/teams` | Get teams |
| GET | `/teams/:teamId` | Get team details |
| PATCH | `/teams/:teamId` | Update team |
| POST | `/teams/:teamId/members` | Add team member |
| PATCH | `/teams/:teamId/members/:userId/role` | Update member role |
| DELETE | `/teams/:teamId/members/:userId` | Remove team member |
| DELETE | `/teams/:teamId` | Delete team |

**Note:** Protected endpoints require authentication. The API route list reflects the implemented routes; a refresh-token endpoint and a dedicated logout endpoint are not included in this list.

---

## Security Implementation

WorkNest incorporates several backend security practices:

- Password hashing using bcryptjs.
- JWT-based authentication.
- Protected API routes using authentication middleware.
- Role-based access control.
- Ownership-based resource authorization.
- Request validation using Zod.
- HTTP security headers using Helmet.
- Login rate limiting.
- Refresh-token hashing and database-backed sessions.
- Environment variables for sensitive configuration.

---

## Database Collections

MongoDB stores the application's information in separate collections.

| Collection | Purpose |
|---|---|
| Users | User accounts and profile information |
| Sessions | Refresh-token session records |
| Projects | Project information and ownership |
| Tasks | Task information and project relationships |
| Teams | Team details and membership information |

---

## Development Tools

- Visual Studio Code – Code editor.
- Postman – API development and testing.
- MongoDB Atlas – Cloud database.
- Git – Version control.
- GitHub – Source code hosting.

---

## Future Enhancements

Potential improvements for future versions:

- Automatic access-token refresh and secure logout.
- Automated backend and frontend testing.
- Production deployment.
- Real-time collaboration.
- Task comments and activity history.
- File attachments.
- Email notifications.
- Advanced project analytics.
- Pagination and performance optimization.

---

## Learning Outcomes

This project provided practical experience in:

- Full-stack web application development.
- REST API design and integration.
- Authentication and authorization.
- MongoDB database design.
- Backend architecture and middleware.
- Frontend-backend communication.
- Request validation and application security.
- Git and GitHub version control.

---

