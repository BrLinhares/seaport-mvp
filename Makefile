# ============================================================
# SEAPORT MVP — Comandos de desenvolvimento
# ------------------------------------------------------------
# Uso: make <comando>
# Exemplo: make up | make logs | make restart-backend
# ============================================================

.PHONY: help up down restart build rebuild logs \
        logs-backend logs-frontend status \
        backend frontend install clean

# Comando padrão: mostra ajuda
help:
	@echo ""
	@echo "  SEAPORT MVP — Comandos disponíveis"
	@echo "  ====================================="
	@echo ""
	@echo "  Docker (recomendado):"
	@echo "    make up               Sobe todos os containers"
	@echo "    make down             Para e remove todos os containers"
	@echo "    make restart          Para e sobe novamente"
	@echo "    make build            Rebuilda as imagens e sobe"
	@echo "    make rebuild-backend  Rebuilda só o backend e reinicia"
	@echo "    make rebuild-frontend Rebuilda só o frontend e reinicia"
	@echo "    make status           Status dos containers"
	@echo "    make logs             Logs de todos os serviços (Ctrl+C para sair)"
	@echo "    make logs-backend     Logs só do backend"
	@echo "    make logs-frontend    Logs só do frontend"
	@echo ""
	@echo "  Desenvolvimento local (sem Docker):"
	@echo "    make backend          Inicia backend com perfil dev (H2)"
	@echo "    make frontend         Inicia frontend em modo dev (Vite)"
	@echo "    make install          Instala dependências do frontend"
	@echo ""
	@echo "  Utilitários:"
	@echo "    make clean            Remove containers, volumes e imagens do projeto"
	@echo "    make setup            Prepara novo ambiente (copia .env.example)"
	@echo ""

# ── Docker ──────────────────────────────────────────────────

up:
	docker compose up -d
	@echo ""
	@echo "  ✅ Seaport rodando!"
	@echo "     Frontend : http://localhost"
	@echo "     Backend  : http://localhost:8080/api"
	@echo "     MailHog  : http://localhost:8025"
	@echo "     Login    : admin@seaport.com.br / Seaport@2024"
	@echo ""

down:
	docker compose down

restart: down up

build:
	docker compose build
	docker compose up -d

rebuild-backend:
	docker compose build backend
	docker compose up -d --no-deps backend

rebuild-frontend:
	docker compose build frontend
	docker compose up -d --no-deps frontend

status:
	docker compose ps

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

clean:
	docker compose down -v --rmi local
	@echo "Containers, volumes e imagens locais removidos."

# ── Desenvolvimento local ────────────────────────────────────

backend:
	cd seaport-backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev

frontend:
	cd seaport-frontend && npm run dev

install:
	cd seaport-frontend && npm install

# ── Setup novo ambiente ──────────────────────────────────────

setup:
	@echo "Configurando novo ambiente..."
	@if [ ! -f seaport-backend/.env ]; then \
		cp seaport-backend/.env.example seaport-backend/.env; \
		echo "  ✅ seaport-backend/.env criado (ajuste os valores se necessário)"; \
	else \
		echo "  ⚠️  seaport-backend/.env já existe, não foi sobrescrito"; \
	fi
	@if [ ! -f seaport-frontend/.env ]; then \
		cp seaport-frontend/.env.example seaport-frontend/.env; \
		echo "  ✅ seaport-frontend/.env criado"; \
	else \
		echo "  ⚠️  seaport-frontend/.env já existe, não foi sobrescrito"; \
	fi
	@echo ""
	@echo "  Próximo passo: make up"
	@echo ""
