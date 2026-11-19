# SwiftLog — Delivery Management Platform

> **B2B web platform** for managing the full lifecycle of delivery operations — from supplier request creation, through admin validation and driver assignment, to final delivery confirmation — with complete status tracking and history.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features by Role](#features-by-role)
- [Delivery State Machine](#delivery-state-machine)
- [Permissions Matrix](#permissions-matrix)
- [Project Structure](#project-structure)
- [Getting Started (Local Dev)](#getting-started-local-dev)
- [Running Tests](#running-tests)
- [Production Deployment](#production-deployment)
- [Documentation](#documentation)

---

## Overview

A logistics company transports packages between **suppliers (Point A)** and **end customers (Point B)**. Before this platform, delivery requests, driver assignments, and status tracking were handled manually — causing inefficiency and poor visibility.

**SwiftLog** digitizes the entire delivery workflow for three user roles:

| Role | Who | What they do |
|---|---|---|
| **Admin** | The logistics company | Manages all accounts, validates deliveries, assigns drivers, monitors operations |
| **Fournisseur** (Supplier) | Professional client | Creates delivery requests, tracks their own packages |
| **Livreur** (Driver) | Field delivery agent | Views assigned missions, updates status from mobile in the field |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17 · Spring Boot 4.1.1 · Spring Security + JWT |
| **Database** | MySQL 8 · Flyway migrations · JPA / Hibernate |
| **Frontend** | React 18 · TypeScript · Vite · Lucide Icons |
| **API Docs** | springdoc-openapi (Swagger UI at `/swagger-ui.html`) |
| **Testing** | JUnit 5 · Mockito · 28 unit tests (pure, no DB required) |
| **Deployment** | systemd service · Nginx reverse proxy · Let's Encrypt SSL |
| **Containerization** | Docker · Docker Compose (optional) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / Mobile                      │
│            React + TypeScript (Vite build)              │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS  (Nginx reverse proxy)
┌──────────────────────────▼──────────────────────────────┐
│              Spring Boot REST API  (:8080)               │
│   ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│   │ Controllers │→ │  Services   │→ │ Repositories  │  │
│   └─────────────┘  └─────────────┘  └───────┬───────┘  │
│          Spring Security + JWT Auth          │          │
└──────────────────────────────────────────────┼──────────┘
                                               │ JPA
┌──────────────────────────────────────────────▼──────────┐
│                     MySQL 8 Database                     │
│  users · fournisseurs · livreurs · livraisons           │
│  livraison_statuts_historique · notifications           │
└─────────────────────────────────────────────────────────┘
```

**Key design principles:**
- **Layered architecture**: Controller → Service → Repository (no business logic in controllers)
- **Stateless JWT auth**: tokens validated on every request via a filter chain
- **Role-based access**: `@PreAuthorize` annotations + data-level ownership enforcement (a supplier cannot see another supplier's deliveries)
- **Schema migrations**: Flyway manages all DDL changes — `ddl-auto=validate` in production
- **Externalized secrets**: all credentials and keys come from environment variables (never hardcoded)

---

## Features by Role

### Admin
- Full dashboard with delivery counts by status, latest requests, unassigned/failed alerts
- **Supplier management**: create, search, activate/deactivate, view their deliveries
- **Driver management**: create, search, activate/deactivate, track availability
- **Delivery pipeline**: validate pending requests, assign an available driver, monitor progress
- **History & search**: filter by reference, supplier, driver, client, city, status, date range
- Internal notification feed

### Fournisseur (Supplier)
- Create delivery requests (auto-generated reference `LIV-YYYY-NNNNN`)
- Fill pickup details (Point A) and destination details (Point B) with delivery instructions
- Real-time status tracking with a visual timeline of every status change
- Private data: cannot access any other supplier's deliveries

### Livreur (Driver) — Mobile-Optimized
- Mission list showing only their assigned deliveries
- One-tap status updates directly from the field:
  - Confirm package pickup → `COLIS_RÉCUPÉRÉ`
  - Start delivery → `EN_LIVRAISON`
  - Confirm delivery → `LIVRÉE`
  - Report failure (with mandatory reason) → `ÉCHEC_LIVRAISON`
- Notifications when new missions are assigned

---

## Delivery State Machine

Every delivery follows a strict, server-enforced state machine. Invalid transitions are rejected with HTTP 409.

```
EN_ATTENTE
    │
    ▼  (Admin validates)
VALIDÉE
    │
    ▼  (Admin assigns driver)
AFFECTÉE
    │
    ▼  (Driver confirms pickup)
COLIS_RÉCUPÉRÉ
    │
    ▼  (Driver starts delivery)
EN_LIVRAISON
    │
    ├──▶  LIVRÉE          (success)
    │
    └──▶  ÉCHEC_LIVRAISON (failure — reason required)
```

Every transition is timestamped and stored in `livraison_statuts_historique`.

---

## Permissions Matrix

| Feature | Admin | Fournisseur | Livreur |
|---|:---:|:---:|:---:|
| Admin dashboard & stats | ✅ | — | — |
| Manage suppliers | ✅ | — | — |
| Manage drivers | ✅ | — | — |
| Create delivery request | — | ✅ | — |
| View **all** deliveries | ✅ | — | — |
| View **own** deliveries | — | ✅ | ✅ |
| Validate delivery | ✅ | — | — |
| Assign driver | ✅ | — | — |
| Update delivery status | — | — | ✅ |
| Full history & search | ✅ | Own data | Own data |
| Manage user accounts | ✅ | — | — |

---

## Project Structure

```
delivery_system/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/project/backend/
│   │   ├── config/                 # Security, CORS, OpenAPI config
│   │   ├── controller/             # REST endpoints
│   │   ├── dto/                    # Request & response DTOs
│   │   ├── entity/                 # JPA entities
│   │   ├── mapper/                 # Entity ↔ DTO mappers
│   │   ├── repository/             # Spring Data JPA repositories
│   │   └── service/                # Business logic
│   ├── src/main/resources/
│   │   ├── db/migration/           # Flyway SQL migrations (V1–V4)
│   │   ├── application.properties  # Dev config (env var defaults)
│   │   └── application-prod.properties  # Prod config (no defaults)
│   └── src/test/                   # 28 unit tests (Mockito, no DB)
│
├── frontend/                       # React + TypeScript app
│   ├── src/
│   │   ├── api/                    # API client functions
│   │   ├── components/             # Reusable UI components
│   │   ├── context/                # Auth context (JWT)
│   │   └── pages/                  # Role-based page views
│   └── dist/                       # Production build output
│
├── deploy/                         # Deployment infrastructure
│   ├── docker-compose.yml          # 3-service compose (db/backend/frontend)
│   ├── env/livraison.env.template  # Secret variables template
│   ├── nginx/livraison.conf        # Nginx config (HTTPS, proxy, SPA)
│   ├── scripts/backup-db.sh        # Automated mysqldump + rotation
│   └── systemd/                    # livraison-backend.service + backup.timer
│
├── docs/
│   ├── INSTALLATION.md             # Step-by-step server installation guide
│   └── GUIDE_UTILISATEUR.md        # User guide for all 3 roles (French)
│
├── backend/Dockerfile
├── frontend/Dockerfile
└── .gitignore
```

---

## Getting Started (Local Dev)

### Prerequisites

- Java 17+
- Maven 3.9+
- MySQL 8 (running locally)
- Node.js 20+

### 1. Clone the repository

```bash
git clone <repo-url> delivery_system
cd delivery_system
```

### 2. Configure the database

```sql
CREATE DATABASE livraisonProject CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'livraison_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON livraisonProject.* TO 'livraison_user'@'localhost';
```

### 3. Start the backend

The default `application.properties` reads from environment variables with dev fallbacks — no additional config needed for local dev.

```bash
cd backend
mvn spring-boot:run
```

Flyway will automatically run all migrations on first startup. The API is available at `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/swagger-ui.html`

**Default admin account (created by migration V2):**
- Email: `admin@livraison.com`
- Password: `Admin#Prod2026!SecureKey99` *(change immediately in production)*

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Running Tests

28 pure unit tests using Mockito (no database required):

```bash
cd backend
mvn test
```

Test coverage includes:
- **State machine transitions**: every valid and invalid status change (`LivraisonStatusServiceTest` — 12 tests)
- **Access control / data isolation**: supplier/driver ownership enforcement (`LivraisonAccessControlTest` — 7 tests)
- **Authentication**: disabled accounts, bad credentials, JWT generation (`AuthAndAccountTest` — 4 tests)
- **Input validation**: `@Size(min=8)` on all password DTOs (`PasswordValidationTest` — 5 tests)

---

## Production Deployment

See [`docs/INSTALLATION.md`](docs/INSTALLATION.md) for the full step-by-step guide.

**Quick summary (systemd / native):**

```bash
# 1. Build the JAR
cd backend && mvn clean package -DskipTests

# 2. Build the frontend
cd frontend && npm ci && npm run build

# 3. Configure secrets
sudo cp deploy/env/livraison.env.template /etc/livraison/livraison.env
sudo nano /etc/livraison/livraison.env   # fill in real values

# 4. Install and start services
sudo cp deploy/systemd/livraison-backend.service /etc/systemd/system/
sudo systemctl enable --now livraison-backend

# 5. Configure Nginx + SSL
sudo cp deploy/nginx/livraison.conf /etc/nginx/sites-available/
sudo certbot --nginx -d yourdomain.com

# 6. Enable daily backups
sudo systemctl enable --now livraison-backup.timer
```

**Docker Compose alternative:**

```bash
cd deploy
cp env/livraison.env.template env/livraison.env
# edit env/livraison.env with real values
docker compose up -d --build
```

### Required Environment Variables

| Variable | Description |
|---|---|
| `DB_URL` | JDBC connection string |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | Random string ≥ 64 characters (`openssl rand -base64 64`) |
| `CORS_ALLOWED_ORIGINS` | Frontend origin (e.g. `https://yourdomain.com`) |
| `SPRING_PROFILES_ACTIVE` | Set to `prod` in production |

---

## Documentation

| Document | Description |
|---|---|
| [`docs/INSTALLATION.md`](docs/INSTALLATION.md) | Full server installation guide (native + Docker), SSL, backups, troubleshooting |
| [`docs/GUIDE_UTILISATEUR.md`](docs/GUIDE_UTILISATEUR.md) | User guide for all 3 roles — Admin, Fournisseur, Livreur (French) |
| `http://localhost:8080/swagger-ui.html` | Interactive API documentation (Swagger UI) |

---

## Security Notes

- Passwords are hashed with **BCrypt** — never stored in plain text
- JWT tokens are validated on every API request
- Each user role is enforced at both the API level (`@PreAuthorize`) and the data level (ownership checks in service layer)
- All secrets are loaded from **environment variables** — nothing sensitive is committed to the repository
- Production uses `ddl-auto=validate` — schema changes only through Flyway migrations

---

*15 days of free corrections post-delivery.*
