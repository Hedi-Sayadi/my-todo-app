# Docker Setup for TodoFlow

This directory contains Docker configuration files for building and running the TodoFlow application with all its components.

## Files

- **`backend/Dockerfile`** — Multi-stage build for the Spring Boot backend
- **`frontend/Dockerfile`** — Multi-stage build for the React/Vite frontend
- **`docker-compose.yml`** — Orchestrates all services (PostgreSQL, pgAdmin, backend, frontend)

## Prerequisites

- Docker installed and running
- Docker Compose installed (usually included with Docker Desktop)

## Quick Start

### Build and Run All Services

```bash
docker-compose up --build
```

This will:
1. Start PostgreSQL database on port 5432
2. Start pgAdmin on port 5050
3. Build and start the backend on port 8080
4. Build and start the frontend on port 3000

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **pgAdmin**: http://localhost:5050 (admin.todo@uni-passau.de / PgAdmin@2026)
- **Database**: localhost:5432 (todo_user / TodoApp@2026)

## Service Details

### PostgreSQL Database
- **Container Name**: todo-postgres
- **Port**: 5432
- **Database**: todo_app
- **User**: todo_user
- **Password**: TodoApp@2026

### pgAdmin
- **Container Name**: todo-pgadmin
- **Port**: 5050
- **Email**: admin.todo@uni-passau.de
- **Password**: PgAdmin@2026

### Backend (Spring Boot)
- **Container Name**: todo-backend
- **Port**: 8080
- **Base URL**: http://localhost:8080/api

### Frontend (React/Vite)
- **Container Name**: todo-frontend
- **Port**: 3000
- **Build Tool**: Vite

## Common Commands

### Start services in the background
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### View logs for a specific service
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (clean slate)
```bash
docker-compose down -v
```

### Rebuild a specific service
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

## Environment Variables

The services use environment variables defined in `docker-compose.yml`. To override them, create a `.env` file in the root directory:

```env
POSTGRES_DB=todo_app
POSTGRES_USER=todo_user
POSTGRES_PASSWORD=TodoApp@2026
PGADMIN_DEFAULT_EMAIL=admin.todo@uni-passau.de
PGADMIN_DEFAULT_PASSWORD=PgAdmin@2026
VITE_API_BASE_URL=http://localhost:8080/api
SPRING_MAIL_HOST=mailpit
SPRING_MAIL_PORT=1025
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=false
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=false
APP_REMINDERS_EMAIL_FROM=reminders@todo.local
```

To send reminders to a real Gmail inbox, set these values instead:

```env
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=sayadihedi145@gmail.com
SPRING_MAIL_PASSWORD=your-gmail-app-password
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
APP_REMINDERS_EMAIL_FROM=sayadihedi145@gmail.com
```

Alternatively, use SendGrid SMTP (recommended if you don't want to use your Gmail account directly):

```env
# Create an API key in SendGrid and copy the key value here
SPRING_MAIL_HOST=smtp.sendgrid.net
SPRING_MAIL_PORT=587
# Use username 'apikey' and the API key as the password
SPRING_MAIL_USERNAME=apikey
SPRING_MAIL_PASSWORD=SG.xxxxx
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
APP_REMINDERS_EMAIL_FROM=reminders@yourdomain.com
```

Notes:
- SendGrid allows you to create an API key instead of sharing your personal password.
- After adding the values to your `.env`, restart the stack:

```bash
docker compose up --build -d
```

To verify delivery, create a new reminder while logged in and click **Send email**, then check your email inbox (or SendGrid's activity logs).


## Troubleshooting

### Port already in use
If a port is already in use, you can map to a different port by editing `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Maps container port 3000 to host port 3001
```

### Database connection issues
Ensure the database health check passes before the backend starts. Check logs:
```bash
docker-compose logs postgres
```

### Build failures
- For backend: Ensure `mvnw` has execute permissions
- For frontend: Check `package.json` for correct dependencies

### Clean rebuild
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Development

For local development without Docker:
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && mvn spring-boot:run`

## Production Considerations

These Dockerfiles are configured for development. For production:
1. Use Nginx instead of `serve` for the frontend
2. Use a multi-stage build with a smaller base image for the backend
3. Implement proper logging and monitoring
4. Use secrets management for sensitive credentials
5. Consider using Docker Compose overrides for different environments

Example production frontend Dockerfile:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
