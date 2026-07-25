## 🖥️ Screenshots

> Screenshots coming soon — will be added from a dedicated demo environment with sample data.

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use the provided Docker setup)

### Installation

```bash
# Clone the repository
git clone https://github.com/BrLinhares/seaport-mvp.git
cd seaport-mvp

# Start backend + database with Docker
docker-compose up -d

# Install frontend dependencies
cd frontend
npm install
npm run dev
```

The API will be available at `http://localhost:8080` and the frontend at `http://localhost:5173`.

## 🧪 Testing

```bash
./mvnw test
```

## 📌 Roadmap

- [ ] Public demo environment with seeded sample data
- [ ] [Próxima feature planejada]
- [ ] [Outra melhoria futura]

## 👤 Author

**Brunno Linhares Macena Silva**
[LinkedIn](https://www.linkedin.com/in/brunno-linhares/) · [GitHub](https://github.com/BrLinhares)

---

*This project was built independently, based on real operational challenges observed while working in maritime logistics coordination.*
