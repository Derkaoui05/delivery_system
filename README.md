1. **Overview**

**Product name:** Livraison Manager (working title)

**Type:** B2B web platform — internal tool for a delivery logistics company

**Stack:** Spring Boot (REST API) + React (frontend) + MySQL

**Team:** 2 developers (backend/frontend split)

**Budget:** 12 000 DH

**Timeline:** ~3-4 weeks (2-dev parallel execution)

**Problem statement**

The client company transports packages between suppliers (Point A) and end customers (Point B) but does not sell products itself. Delivery requests, driver assignment, and status tracking are currently manual, causing inefficiency and poor visibility into delivery operations.

**Goal**

Digitize the full delivery lifecycle — from request creation by a supplier, through admin validation and driver assignment, to final delivery confirmation — with full status tracking and history.

**Out of scope (V1)**

Real-time GPS, native mobile app, online payment/wallet, automated commission system, route optimization, advanced Maps integration, SMS/WhatsApp API, AI features, marketplace, inventory management, full accounting.

1. **Users & Roles**

| **Role** | **Description** | **Key needs** |
| --- | --- | --- |
| **Admin** | Represents the delivery company | Full oversight: manage suppliers/drivers, validate & assign deliveries, track statuses, view stats |
| **Fournisseur** (Supplier) | Professional client handing off packages | Create delivery requests, track their own deliveries, view history |
| **Livreur** (Driver) | Picks up and delivers packages | View assigned missions, update delivery status, report failures |
1. **Functional Requirements**

**3.1 Authentication & Account Management**

- Secure login/logout, password hashing, password reset flow
- Role-based access control (Admin / Fournisseur / Livreur)
- Admin can create, edit, activate/deactivate Fournisseur and Livreur accounts

**3.2 Supplier Management (Admin)**

- CRUD: name/company, contact name, phone, email, address, city, account status, creation date
- Search, filter, activate/deactivate, view supplier's deliveries

**3.3 Driver Management (Admin)**

- CRUD: name, phone, email, address, city, status, **availability** (Disponible/Indisponible), registration date
- Search, view driver's deliveries and history
- Availability flag determines assignment eligibility

**3.4 Delivery Request Creation (Fournisseur)**

- Package info: reference (auto-generated, unique), description, quantity, approx. weight, special instructions
- Point A (pickup): supplier name, address, city, phone, additional info
- Point B (destination): client name, phone, address, city, delivery instructions
- Desired pickup/delivery dates, comments

**3.5 Delivery Lifecycle (Status State Machine)**

EN_ATTENTE → VALIDÉE → AFFECTÉE → COLIS_RÉCUPÉRÉ → EN_LIVRAISON → LIVRÉE

↓

ÉCHEC_LIVRAISON

- Failure reasons: client absent, incorrect address, unreachable client, refused package, access problem, other
- Every status change timestamped

**3.6 Assignment (Admin)**

- Review request → validate → select an available driver → assign
- System records: assigned driver, assignment date, admin who performed it

**3.7 Driver Workspace**

- Dashboard: # to deliver, in progress, completed, failed
- Mission list: reference, supplier, Point A address, client, Point B address, phone, status, date
- Actions per status: Confirm pickup → COLIS_RÉCUPÉRÉ; Start delivery → EN_LIVRAISON; Confirm delivery → LIVRÉE; Declare failure → ÉCHEC_LIVRAISON

**3.8 Supplier Workspace**

- Dashboard: total requests, pending, in progress, completed, failed
- Create/view deliveries, search by reference, filter by status, view details/history
- Data isolation: cannot access other suppliers' data

**3.9 Delivery Tracking (Detail Page)**

- Visual progress timeline per delivery, with timestamps for each status change

**3.10 History**

- Admin: searchable by reference, supplier, driver, client, city, status, period
- Fournisseur/Livreur: limited to their own history

**3.11 Admin Dashboard**

- Stats: total deliveries, by status, # suppliers, # drivers
- Quick lists: latest requests, unassigned deliveries, recently completed, failed deliveries

**3.12 Search & Filters**

- Search by reference, supplier, driver, client, phone
- Filters: status, city, date, supplier, driver

**3.13 Internal Notifications**

- Triggers: new request, request validated, driver assigned, package picked up, delivery completed/failed

**3.14 Security**

- Spring Security + JWT authentication, role-based authorization (@PreAuthorize)
- Hashed passwords, input validation, API protection, operation logging, DB backups

**3.15 Responsive UI**

- Desktop, tablet, mobile — Livreur interface optimized for mobile/field use
1. **Permissions Matrix**

| **Feature** | **Admin** | **Fournisseur** | **Livreur** |
| --- | --- | --- | --- |
| Dashboard | ✓ | ✓ | ✓ |
| Manage suppliers | ✓ | – | – |
| Manage drivers | ✓ | – | – |
| Create delivery | – | ✓ | – |
| View all deliveries | ✓ | – | – |
| View own deliveries | – | ✓ | ✓ |
| Assign driver | ✓ | – | – |
| Update status | – | – | ✓ |
| History | Full | Own data | Own data |
| Manage users | ✓ | – | – |
1. **Technical Architecture**

**Backend (Spring Boot)**

- Layered architecture: Controller → Service → Repository
- Spring Security + JWT for auth
- Entities: User, Fournisseur, Livreur, Client, Livraison, LivraisonStatusHistory, Notification
- springdoc-openapi for auto-generated API docs/contract (shared reference for frontend dev)

**Frontend (React)**

- Three role-based interfaces (Admin/Fournisseur/Livreur) consuming the REST API
- Responsive design, mobile-first for Livreur

**Database:** MySQL

**Deployment:** Client-provided VPS, domain + SSL configured by dev team; automated backups

1. **Data Model (High-Level)**

Users

├── Admins

├── Fournisseurs

└── Livreurs

Fournisseur

└── Livraisons

├── Point A (pickup)

├── Point B (destination)

├── Client

├── Livreur (assigned)

└── LivraisonStatusHistory

Main tables: users, fournisseurs, livreurs, clients, livraisons, livraison_statuts_historique, notifications

1. **Deliverables**
- Functional web app (Spring Boot API + React frontend + MySQL)
- Admin, Fournisseur, and Livreur interfaces
- Authentication system
- Installation + basic user documentation
- Deployment to client server, domain/SSL config
- Core functional tests
1. **Timeline (2-dev parallel)**

| **Week** | **Focus** |
| --- | --- |
| 1 | API contract (OpenAPI spec) agreed; Dev A starts entities/auth/security; Dev B scaffolds React app against mocked API |
| 2 | Core CRUD (suppliers/drivers) + delivery request creation + status state machine |
| 3 | Assignment flow, driver/supplier workspaces, admin dashboard, notifications |
| 4 | Integration, testing, history/search polish, deployment, docs |
1. **Success Criteria**
- Supplier can create a request and track it end-to-end without manual intervention
- Admin can validate and assign a delivery in under 2 minutes
- Driver can update delivery status from a mobile device in the field
- Full status history is queryable and accurate
- Data isolation between suppliers is enforced