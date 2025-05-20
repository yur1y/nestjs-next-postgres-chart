# Dashboard

## Prerequisites

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-recommended-blue)](https://pnpm.io)
[![Docker](https://img.shields.io/badge/docker-required-blue)](https://www.docker.com/)

## Getting Started

1. **Clone and Setup:**
```bash
git clone https://github.com/yur1y/nestjs-next-postgres-chart.git test-vessel && cd test-vessel
```

2. **Environment Files:**
```bash
# Root .env
echo 'NODEJS_DOCKER_IMAGE=node:18-alpine
DATABASE_URL="postgresql://user:password@postgres:5432/test?schema=public"' > .env

# Client .env.local
echo 'NEXT_PUBLIC_API_URL=http://localhost:3000' > client/.env.local
```

3. **Docker Commands:**
```bash
# Start services
docker compose up --build          # Interactive mode
docker compose up --build -d       # Detached mode
docker compose up --build service  # Single service

# Stop services
docker compose down                # Stop only
docker compose down -v             # Stop and remove volumes
docker compose down --rmi all -v   # Full cleanup
```

## Services

| Service  | Port | Description |
|----------|------|-------------|
| Backend  | 3000 | NestJS API  |
| Frontend | 3001 | Next.js UI  |
| Database | 5432 | PostgreSQL  |
| Cache    | 6379 | Redis      |

## Development

```bash
# Individual services
docker compose up test-vessel  # Backend
docker compose up client       # Frontend
docker compose up postgres     # Database

# Troubleshooting
docker ps                      # List containers
docker compose logs -f         # View logs
docker compose build service   # Rebuild service
docker compose restart service # Restart service
```

> **Note**: Replace `service` with actual service name from docker-compose.yml

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)