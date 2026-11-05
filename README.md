# Todo Management Platform

Full-stack task management application built with React and Spring Boot. It helps users organize tasks with categories, priorities, statuses, reminders, recurring tasks, and secure authentication.

## Features

- User registration and JWT authentication
- Create, edit, complete, and delete tasks
- Kanban-style task board
- Task priorities and status tracking
- Categories for organizing work
- Reminders with snooze support
- Recurring task configuration
- Responsive dashboard and navigation
- REST API backed by PostgreSQL

## Technology stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- `@dnd-kit` for drag and drop
- Vitest and Playwright for testing

### Backend

- Java 17
- Spring Boot
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Maven

### Infrastructure

- Docker Compose
- Nginx for frontend serving

## Project structure

```text
.
├── todo-app/
│   ├── frontend/       React application
│   ├── backend/        Spring Boot API
│   ├── prototype/      UI prototypes
│   └── docker-compose.yml
├── .github/workflows/  Continuous integration
└── README.md
```

## Run with Docker Compose

From the `todo-app` directory:

```bash
docker compose up --build
```

Open the application at <http://localhost:3000>.

Available services:

| Service | Port | Purpose |
| --- | --- | --- |
| Frontend | 3000 | React web application |
| Backend | 8080 | Spring Boot REST API |
| PostgreSQL | 5432 | Application database |
| pgAdmin | 5050 | Database administration |

Stop the services with:

```bash
docker compose down
```

## Run the frontend locally

```bash
cd todo-app/frontend
npm install
npm run dev
```

Useful commands:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Run the backend locally

Start PostgreSQL, configure the database connection, then run:

```bash
cd todo-app/backend
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd spring-boot:run`.

Run the backend test suite:

```bash
./mvnw test
```

## API areas

- `/api/auth`: registration, login, profile, password, and authentication
- `/api/tasks`: task creation, updates, status, and task queries
- `/api/categories`: task category management
- `/api/reminders`: reminder creation, updates, and snoozing
- `/api/health`: service health check
