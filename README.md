# Seaport MVP

Sistema de gestão portuária — MVP com Spring Boot + React.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Java 21, Spring Boot 3.3, Spring Security 6, JWT |
| Frontend | React 18, Vite, React Router, Zustand |
| Banco | PostgreSQL 16 (prod/docker) · H2 (dev local) |
| Email | MailHog (dev) · SMTP (prod) |
| Infra | Docker Compose |

## Executar com Docker (recomendado)

```bash
docker compose up -d
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8080/api |
| MailHog UI | http://localhost:8025 |

**Login padrão:** `admin@seaport.com.br` / definido em `APP_ADMIN_PASSWORD`

## Executar em modo desenvolvimento

### Backend

```bash
cd seaport-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend

```bash
cd seaport-frontend
npm install
npm run dev
```

Frontend disponível em `http://localhost:5173` (proxy `/api` → `localhost:8080`).

## Variáveis de ambiente (Docker)

Configuradas no `docker-compose.yml`. Para produção (Azure), defina via App Service:

| Variável | Descrição |
|----------|-----------|
| `DB_HOST` | Host do PostgreSQL |
| `DB_NAME` | Nome do banco |
| `DB_USERNAME` / `DB_PASSWORD` | Credenciais do banco |
| `JWT_SECRET` | Chave JWT (mín. 32 chars) |
| `APP_ADMIN_PASSWORD` | Senha do admin master inicial |
| `MAIL_HOST` / `MAIL_PORT` | Configuração SMTP |

## Estrutura

```
seaport/
├── docker-compose.yml
├── seaport-backend/       # Spring Boot
│   ├── src/
│   └── Dockerfile
└── seaport-frontend/      # React + Vite
    ├── src/
    ├── nginx.conf
    └── Dockerfile
```
