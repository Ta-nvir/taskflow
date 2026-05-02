# TaskFlow 🚀

A full-stack Project & Task Management web app with role-based access control (Admin/Member).

## Live Demo
- **Frontend:** [https://taskflow-frontend.up.railway.app](https://taskflow-frontend.up.railway.app)
- **Backend API:** [https://taskflow-backend.up.railway.app](https://taskflow-backend.up.railway.app)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, plain CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Railway |

## Features

- ✅ Authentication — Signup/Login with JWT
- ✅ Role-Based Access — Admin vs Member permissions
- ✅ Project Management — Create, edit, delete projects
- ✅ Team Management — Add/remove members per project
- ✅ Task System — Create tasks, assign to members, set priority & due dates
- ✅ Kanban Board — Visual task tracking (To Do / In Progress / Review / Done)
- ✅ Dashboard — Stats, overdue tasks, recent activity
- ✅ Admin Panel — Manage all users and roles

## Project Structure

```
taskflow/
├── backend/
│   ├── config/
│   │   ├── db.js          # MySQL connection pool
│   │   └── schema.sql     # Database schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js        # JWT + role middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── public/
    └── src/
        ├── components/    # Sidebar
        ├── context/       # AuthContext
        ├── pages/         # Dashboard, Projects, Tasks, Users, Auth
        ├── styles/        # global.css
        ├── api.js         # API service layer
        └── App.js
```

## Local Development Setup

### Prerequisites
- Node.js v18+
- MySQL 8.0+

### 1. Clone the repo
```bash
git clone https://github.com/Ta-nvir/taskflow.git
cd taskflow
```

### 2. Setup Database
```bash
mysql -u root -p < backend/config/schema.sql
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```

### 4. Frontend
```bash
cd frontend
# Create .env file:
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm install
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| POST | /api/projects/:id/members | Add member |
| DELETE | /api/projects/:id/members/:uid | Remove member |
| GET | /api/projects/:id/tasks | Get project tasks |
| POST | /api/projects/:id/tasks | Create task |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List tasks |
| GET | /api/tasks/dashboard | Dashboard stats |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| PUT | /api/users/:id/role | Update role |
| DELETE | /api/users/:id | Delete user |

## Deployment on Railway

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Railway deployment guide.

## Author

**Tanvir Yaligar** — [@Ta-nvir](https://github.com/Ta-nvir)
