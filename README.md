# Seaport MVP

Sistema de gestão portuária — Spring Boot + React.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Java 21 · Spring Boot 3.3 · Spring Security 6 · JWT |
| Frontend | React 18 · Vite · React Router · Zustand |
| Banco | PostgreSQL 16 (Docker/prod) · H2 em arquivo (dev local) |
| Email | MailHog (dev) · SMTP/SendGrid (prod) |
| Infra | Docker Compose |

---

## ⚡ Início rápido (nova máquina)

### Pré-requisitos

| Ferramenta | Para quê | Download |
|-----------|---------|---------|
| **Git** | clonar / versionar | https://git-scm.com |
| **Docker Desktop** | rodar tudo com um comando | https://docker.com/products/docker-desktop |

> Java e Node.js são opcionais — só necessários para dev local sem Docker.

### 1. Clonar o projeto

```bash
git clone https://github.com/BrLinhares/seaport-mvp.git
cd seaport-mvp
```

### 2. Subir com Docker

```bash
docker compose up -d
```

Ou usando o Makefile:

```bash
make up
```

### 3. Acessar

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost |
| **Backend API** | http://localhost:8080/api |
| **MailHog** (emails de dev) | http://localhost:8025 |

**Login padrão:** `admin@seaport.com.br` / `Seaport@2024`

---

## 🔄 Fluxo de trabalho (dia a dia)

### Ao começar (sempre puxar antes de editar)

```bash
git pull
```

### Ao terminar (salvar e enviar)

```bash
git add .
git commit -m "feat: descrição do que foi feito"
git push
```

### Após alterar código Java ou JSX com Docker

```bash
make rebuild-backend    # só backend
make rebuild-frontend   # só frontend
make build              # ambos
```

---

## 🛠️ Comandos disponíveis (`make`)

```
make up                 Sobe todos os containers
make down               Para tudo
make restart            Para e sobe novamente
make build              Rebuilda imagens e sobe
make rebuild-backend    Rebuilda só o backend
make rebuild-frontend   Rebuilda só o frontend
make status             Status dos containers
make logs               Logs em tempo real (Ctrl+C para sair)
make logs-backend       Logs só do backend
make clean              Remove containers + volumes + imagens locais
```

---

## 💻 Desenvolvimento local (sem Docker)

Útil para hot-reload automático sem precisar rebuildar imagens.

### Pré-requisitos adicionais

| Ferramenta | Versão | Download |
|-----------|--------|---------|
| Java JDK | 21+ | https://adoptium.net |
| Maven | 3.9+ | https://maven.apache.org |
| Node.js | 20+ | https://nodejs.org |

### Backend (perfil dev — banco H2, sem PostgreSQL)

```bash
cd seaport-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

API disponível em `http://localhost:8080`

### Frontend (hot-reload com Vite)

```bash
cd seaport-frontend
npm install       # primeira vez
npm run dev
```

Frontend disponível em `http://localhost:5173`
O proxy `/api` já aponta para `localhost:8080` automaticamente.

> Para receber emails em dev, suba o MailHog: `docker compose up -d mailhog`

---

## 🗂️ Estrutura do projeto

```
seaport/
├── Makefile                    ← comandos de dev
├── docker-compose.yml          ← orquestração Docker
├── seaport-backend/
│   ├── Dockerfile
│   ├── pom.xml
│   ├── .env.example            ← copie para .env se quiser sobrescrever
│   └── src/main/
│       ├── java/com/seaport/
│       │   ├── controller/     ← endpoints REST
│       │   ├── service/        ← regras de negócio
│       │   ├── entity/         ← entidades JPA
│       │   ├── dto/            ← objetos de transferência
│       │   ├── security/       ← JWT + Spring Security
│       │   └── config/         ← configurações
│       └── resources/
│           ├── application.properties          ← config base
│           ├── application-dev.properties      ← H2 local
│           └── application-prod.properties     ← PostgreSQL/Azure
└── seaport-frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.js
    └── src/
        ├── api/                ← chamadas HTTP (axios)
        ├── components/         ← componentes reutilizáveis
        ├── pages/              ← telas por módulo
        ├── store/              ← estado global (Zustand)
        └── styles/             ← CSS global
```

---

## 🔐 Variáveis de ambiente

Todas as variáveis têm valores padrão para dev — não precisa de `.env` para começar.

Para personalizar, copie o exemplo:

```bash
cp seaport-backend/.env.example seaport-backend/.env
```

Veja `seaport-backend/.env.example` para a lista completa.

### Docker Compose — overrides de variáveis

As variáveis do Docker estão em `docker-compose.yml`. Para customizar sem alterar o arquivo:

```bash
# Crie um docker-compose.override.yml (já está no .gitignore)
# Exemplo:
services:
  backend:
    environment:
      JWT_SECRET: minha-chave-local
```

---

## 🚀 Perfis Spring Boot

| Perfil | Banco | Uso |
|--------|-------|-----|
| `dev` | H2 em arquivo (`./data/seaportdb`) | desenvolvimento local |
| `prod` | PostgreSQL | Docker / Azure |

O perfil é controlado por `SPRING_PROFILES_ACTIVE` (padrão: `dev`).

---

## 📦 Módulos implementados

- **Autenticação** — login JWT, refresh token, reset de senha por email
- **Usuários** — gerenciamento com roles (GERENTE, TRIPULAÇÃO, DIRETORIA)
- **Embarcações** — cadastro completo com compartimentagem e tanques
- **Tripulantes** — dados, documentos e escala
- **Procedimentos** — manual operacional com upload de PDF por role
- **Registros Operacionais** — criação e aprovação por role
- **Requisições** — material e serviço com geração de PDF
- **Manobras** — registro e aprovação
- **Sondagens de Tanque** — medições com aprovação
