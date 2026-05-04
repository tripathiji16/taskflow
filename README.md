# TaskFlow — Team Task Manager

A task management app with role-based access control (Admin/Member).

## Features
- **Authentication** — Signup/Login with JWT tokens
- **Projects** — Create, edit, manage team projects with color coding and status tracking
- **Tasks** — Kanban board with To Do / In Progress / In Review / Done columns
- **Team Management** — Add members by email, assign Admin or Member roles
- **Dashboard** — Overview of all your tasks, overdue items, and project stats
- **RBAC** — Admins can manage members and project settings; members can create/update tasks
- **My Tasks** — Personal task view with filtering by status

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL, Sequelize ORM, JWT auth, bcrypt
**Frontend:** React 18, React Router v6, Axios, react-hot-toast, date-fns

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | All members |
| POST | `/api/projects` | Authenticated |
| GET | `/api/projects/:id` | Members only |
| PATCH | `/api/projects/:id` | Admin only |
| DELETE | `/api/projects/:id` | Owner only |
| POST | `/api/projects/:id/members` | Admin only |
| DELETE | `/api/projects/:id/members/:userId` | Admin only |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/dashboard` | My tasks + stats |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/project/:projectId` | List project tasks |
| PATCH | `/api/tasks/project/:projectId/:taskId` | Update task |
| DELETE | `/api/tasks/project/:projectId/:taskId` | Delete task |

## Database Schema

```
Users: id, name, email, password (hashed), avatar, timestamps
Projects: id, name, description, status, color, dueDate, ownerId, timestamps  
ProjectMembers: id, projectId, userId, role (admin|member), timestamps
Tasks: id, title, description, status, priority, dueDate, projectId, assigneeId, creatorId, completedAt, timestamps
```
