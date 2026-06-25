<div align="center">

<img src="https://img.shields.io/badge/ResolveHub-Smart%20Complaint%20Management-4f46e5?style=for-the-badge&logo=shield&logoColor=white" alt="ResolveHub" />

# ResolveHub

**A production-ready, multi-tenant SaaS complaint management platform**  
Built for organizations that need a structured, transparent, and efficient way to track, assign, and resolve complaints.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-resolvehub--liard.vercel.app-4f46e5?style=flat-square&logo=vercel&logoColor=white)](https://resolvehub-liard.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%204-6db33f?style=flat-square&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Database](https://img.shields.io/badge/Database-TiDB%20Cloud-red?style=flat-square&logo=mysql&logoColor=white)](https://tidbcloud.com/)
[![Deployed on Render](https://img.shields.io/badge/API-Render-46e3b7?style=flat-square&logo=render&logoColor=white)](https://render.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Default Accounts](#-default-accounts)
- [API Overview](#-api-overview)
- [Deployment](#-deployment)

---

## 🔍 Overview

ResolveHub is a full-stack SaaS platform that allows multiple organizations to manage internal complaints end-to-end — from submission to resolution. It supports a **4-tier role system** (Super Admin, Admin, Staff, User), a **public complaint portal** with anonymous submissions, real-time **in-app notifications**, transactional **email alerts**, and a complete **organization onboarding workflow**.

Designed for colleges, companies, clinics, and societies — any organization that needs a structured helpdesk.

---

## 🌐 Live Demo

> **[https://resolvehub-liard.vercel.app/](https://resolvehub-liard.vercel.app/)**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@resolvehub.com` | *(contact maintainer)* |
| Admin | `admin@mail.com` | *(contact maintainer)* |

---

## ✨ Features

### 🏢 Multi-Tenant Organization Management
- Organizations apply for access via a public onboarding form
- Super Admin reviews, approves, or rejects applications with optional reason
- On approval — organization, admin account, and credentials are auto-provisioned
- Each organization is fully isolated with its own slug, API key, and data scope

### 👥 Role-Based Access Control
| Role | Capabilities |
|------|-------------|
| **SUPER_ADMIN** | Manage all organizations, review applications, audit issues, manage admins |
| **ADMIN** | Manage users/staff, assign issues, view all org issues, org settings |
| **STAFF** | View assigned issues, update status, add comments |
| **USER** | Create issues, track own issues, add replies |

### 📝 Complaint Lifecycle
- Full status pipeline: `OPEN → UNDER REVIEW → ASSIGNED → IN PROGRESS → RESOLVED → CLOSED`
- Validated status transitions — no skipping steps
- Priority levels: Low, Medium, High
- Resolution notes saved as comments
- Ticket numbers auto-generated (e.g. `RH-1001`)
- Created date and time recorded for every complaint

### 🌐 Public Portal (No Login Required)
- Each organization gets a public portal at `/org/:slug`
- Anonymous complaint submission with optional email for tracking
- Magic tracking link sent via email — no account needed
- Token-based public replies and status tracking
- One-time reopen window (48 hours) with reason field
- Anonymous identity fully protected — admin never sees the email

### 🔔 Real-Time Notifications
- In-app bell icon with unread count badge
- Notifications for: new complaints, status changes, comments, reopens
- Admin notified on all activity in their organization
- Mark all as read with one click

### 📧 Transactional Email System (Brevo API)
- Complaint created confirmation
- Magic tracking link for public submissions
- Status update emails with resolution notes
- Reopen notification to admin
- Organization approval/rejection emails with credentials
- Welcome email for managed users with login credentials
- Reopen button suppressed after first use

### 🔐 Security
- JWT authentication with role and name claims
- BCrypt password hashing
- Stateless session management
- Role-based endpoint protection
- CORS configurable per environment
- Anonymous submissions never expose real email to admins

### 📊 Super Admin Dashboard
- Platform-wide stats
- Organization audit drill-down (L1 → org list, L2 → org issues, L3 → escalated)
- Manage all admins
- Review pending org applications with approve/reject modal

### 🎨 UI/UX
- Dark / Light theme toggle
- Fully responsive — optimized for 320px to desktop
- Mobile sidebar drawer with hamburger menu
- Premium card-based layouts
- Real-time search with debounce
- CSV export for issue reports

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool |
| Tailwind CSS | 4.x | Styling |
| React Router | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 4.0.5 | Application framework |
| Spring Security | 7.x | Authentication & authorization |
| Spring Data JPA | 4.x | ORM / database access |
| Hibernate | 7.x | JPA implementation |
| JJWT | 0.11.5 | JWT token handling |
| Lombok | Latest | Boilerplate reduction |
| Brevo Java SDK | 7.0.0 | Transactional emails |
| Java | 21 | Runtime |

### Infrastructure
| Service | Purpose |
|---------|---------|
| TiDB Cloud Serverless | MySQL-compatible cloud database |
| Render | Backend hosting (Java web service) |
| Vercel | Frontend hosting |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                              │
│   Browser / Mobile                                           │
│   React + Vite + Tailwind CSS                                │
│   Hosted on Vercel                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTPS / REST API
                            │  JWT Bearer Token
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        API LAYER                             │
│                                                              │
│   Spring Boot 4  ·  Java 21                                  │
│   Spring Security  ·  JWT Filter  ·  Role-Based Guards       │
│   Hosted on Render                                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Controllers │  │   Services   │  │   Repositories   │  │
│  │              │  │              │  │   (Spring Data)  │  │
│  │ /users       │  │ IssueService │  │   IssueRepo      │  │
│  │ /issues      │  │ UserService  │  │   UserRepo       │  │
│  │ /comments    │  │ EmailService │  │   CommentRepo    │  │
│  │ /public/**   │  │ NotifService │  │   OrgRepo        │  │
│  │ /applications│  │ OrgAppService│  │   NotifRepo      │  │
│  │ /organizations│  └──────────────┘  └──────────────────┘  │
│  └──────────────┘                                            │
└───────────────┬──────────────────────────┬──────────────────┘
                │                          │
                ▼                          ▼
┌──────────────────────┐      ┌──────────────────────────────┐
│   TiDB Cloud         │      │   Brevo Email API            │
│   MySQL-compatible   │      │                              │
│   Serverless DB      │      │  Transactional emails        │
│                      │      │  (confirmations, alerts,     │
│  Tables:             │      │   credentials, tracking)     │
│  · issues            │      └──────────────────────────────┘
│  · users             │
│  · organizations     │
│  · org_applications  │
│  · comments          │
│  · notifications     │
└──────────────────────┘
```

### Request Flow
```
User Action  →  React Component  →  api.js (Axios)
    →  JWT Interceptor (attach token)
    →  Spring Boot Controller
    →  Spring Security (validate JWT + role)
    →  Service Layer (business logic)
    →  Repository (JPA / TiDB)
    →  JSON Response  →  Frontend State Update
```

### Role Hierarchy
```
SUPER_ADMIN  ──▶  manages  ──▶  Organizations
                                    │
                                    └──▶  ADMIN  ──▶  manages  ──▶  STAFF
                                                                       │
                                                                       └──▶  USER
```

---

## 📁 Project Structure

```
ComplainSystem/
├── Backend/                          # Spring Boot application
│   ├── src/main/java/com/example/ComplainSystem/
│   │   ├── config/                   # Security, seeder, properties
│   │   │   ├── AdminSeeder.java      # Seeds default accounts & org
│   │   │   ├── SecurityConfig.java   # JWT filter chain + CORS
│   │   │   └── AppProperties.java
│   │   ├── controller/               # REST endpoints
│   │   │   ├── IssueController.java
│   │   │   ├── UserController.java
│   │   │   ├── PublicPortalController.java
│   │   │   ├── OrgApplicationController.java
│   │   │   └── NotificationController.java
│   │   ├── services/                 # Business logic
│   │   │   ├── IssueService.java
│   │   │   ├── EmailService.java     # Brevo API integration
│   │   │   └── NotificationService.java
│   │   ├── entity/                   # JPA entities
│   │   │   ├── IssuesEntity.java
│   │   │   ├── User.java
│   │   │   ├── Organization.java
│   │   │   ├── OrgApplication.java
│   │   │   ├── Comment.java
│   │   │   └── Notification.java
│   │   ├── dto/                      # Request/Response DTOs
│   │   └── util/                     # JWT utilities
│   ├── application.properties        # Env-based config
│   └── render.yaml                   # Render deployment config
│
└── Frontend/                         # React application
    ├── src/
    │   ├── components/               # Reusable components
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Layout.jsx
    │   ├── pages/                    # Route pages
    │   │   ├── Dashboard.jsx
    │   │   ├── IssueList.jsx
    │   │   ├── IssueDetail.jsx
    │   │   ├── AssignIssue.jsx
    │   │   ├── PublicPortal.jsx
    │   │   ├── TrackComplaint.jsx
    │   │   ├── Applications.jsx
    │   │   └── SuperAdminDashboard.jsx
    │   ├── services/
    │   │   ├── api.js                # Axios instance + all API calls
    │   │   └── auth.js               # JWT decode helpers
    │   └── App.jsx                   # Route definitions
    ├── .env                          # Local env (VITE_API_URL)
    ├── .env.production               # Production env
    └── vercel.json                   # SPA routing fix
```

---

## 📸 Screenshots

> Visit the live demo at **[https://resolvehub-liard.vercel.app/](https://resolvehub-liard.vercel.app/)** to see the full experience.

| Page | Description |
|------|-------------|
| **Landing Page** | Organization onboarding with SaaS-style workflow sections |
| **Dashboard** | Metric cards, recent issues, quick actions, activity feed |
| **Issue List** | Filterable table with status badges, priority, raised date |
| **Issue Detail** | Full complaint view with comments, sidebar details |
| **Public Portal** | `/org/:slug` — no login required, anonymous toggle |
| **Track Complaint** | Magic link page with progress timeline, chat bubbles, reopen |
| **Applications** | Super Admin reviews org applications with approve/reject modal |
| **Manage Users** | Admin creates/removes staff and users with role switcher |

---

## 🚀 Getting Started

### Prerequisites

- **Java 21**
- **Node.js 18+**
- **Maven** (or use the included `mvnw` wrapper)
- A **TiDB Cloud** account (free tier available at [tidbcloud.com](https://tidbcloud.com))
- A **Brevo** account for email (free tier at [brevo.com](https://brevo.com))

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ComplainSystem.git
cd ComplainSystem
```

---

### 2. Backend setup

```bash
cd Backend
```

Create `src/main/resources/application-local.properties` (this file is gitignored):

```properties
# Database — TiDB Cloud
spring.datasource.url=jdbc:mysql://<your-tidb-host>:4000/resolvehub?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3&zeroDateTimeBehavior=CONVERT_TO_NULL
spring.datasource.username=<your-tidb-username>
spring.datasource.password=<your-tidb-password>

spring.jpa.show-sql=true

# JWT
jwt.secret=<your-64-char-hex-secret>

# Brevo API
brevo.api-key=<your-brevo-api-key>

# Sender
mail.from=<your-verified-sender-email>

# App
app.base-url=http://localhost:5173
app.allowed-origins=http://localhost:5173
```

Run the backend:

```bash
./mvnw spring-boot:run
```

The API starts at `http://localhost:8080`. On first run, the `AdminSeeder` automatically:
- Creates the SUPER_ADMIN account
- Creates a default organization (`ResolveHub Demo Org`)
- Creates a default ADMIN account
- Migrates any existing data to the default org

---

### 3. Frontend setup

```bash
cd Frontend
npm install
```

The `.env` file already contains:
```env
VITE_API_URL=http://localhost:8080
```

Start the dev server:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🔧 Environment Variables

### Backend (Render / local)

| Variable | Description |
|----------|-------------|
| `DB_URL` | Full JDBC URL including TiDB SSL params and `zeroDateTimeBehavior=CONVERT_TO_NULL` |
| `DB_USERNAME` | TiDB username |
| `DB_PASSWORD` | TiDB password |
| `JWT_SECRET` | 64-character hex string for signing JWTs |
| `BREVO_API_KEY` | Brevo transactional email API key |
| `MAIL_FROM` | Verified sender email address |
| `MAIL_FROM_NAME` | Display name (default: `ResolveHub`) |
| `APP_BASE_URL` | Frontend URL e.g. `https://resolvehub-liard.vercel.app` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `PORT` | Server port (default: `8080`) |

### Frontend (Vercel / local)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 👤 Default Accounts

These accounts are seeded automatically on first startup:

| Role | Email | Notes |
|------|-------|-------|
| `SUPER_ADMIN` | `superadmin@resolvehub.com` | Platform-wide administration |
| `ADMIN` | `admin@mail.com` | Manages ResolveHub Demo Org |

> ⚠️ **Change the default passwords immediately** after first login via `/profile/change-password`.

---

## 📡 API Overview

### Public Endpoints (no auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/login` | Login and receive JWT |
| `POST` | `/applications/submit` | Submit org onboarding application |
| `GET` | `/public/org/:slug` | Get public org portal info |
| `POST` | `/public/org/:slug/complaints` | Submit public complaint |
| `GET` | `/public/track/:ticket?token=` | Track complaint status |
| `POST` | `/public/track/:ticket/reply?token=` | Public reply |
| `POST` | `/public/track/:ticket/reopen?token=` | Reopen resolved complaint |

### Protected Endpoints (JWT required)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/issues` | ALL | Get issues (scoped by role) |
| `POST` | `/issues` | USER, ADMIN | Create issue |
| `POST` | `/issues/assign` | ADMIN | Assign issue to staff |
| `PUT` | `/issues/status` | STAFF, ADMIN | Update issue status |
| `GET` | `/users` | ADMIN | List managed users |
| `POST` | `/users/managed` | ADMIN | Create managed user |
| `GET` | `/notifications` | ALL | Get notifications |
| `GET` | `/applications` | SUPER_ADMIN | List org applications |
| `POST` | `/applications/:id/approve` | SUPER_ADMIN | Approve application |
| `POST` | `/applications/:id/reject` | SUPER_ADMIN | Reject with optional reason |
| `GET` | `/organizations` | SUPER_ADMIN, ADMIN | List organizations |

---

## 🚢 Deployment

### Backend → Render

1. Push `Backend/` to GitHub
2. Create a new **Web Service** on Render
3. Set **Root Directory** to `Backend`
4. Render auto-detects `render.yaml` — build/start commands pre-filled:
   - Build: `./mvnw clean package -DskipTests`
   - Start: `java -jar target/ResolveHub-0.0.1-SNAPSHOT.jar`
5. Add all [environment variables](#-environment-variables) in the Render dashboard
6. Deploy

### Frontend → Vercel

1. Push `Frontend/` to GitHub
2. Create a new **Project** on Vercel
3. Set **Root Directory** to `Frontend`
4. Framework preset: **Vite**
5. Add `VITE_API_URL` pointing to your Render backend URL
6. Deploy — `vercel.json` handles React Router client-side routing automatically

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Built with ❤️ using **Spring Boot** · **React** · **TiDB Cloud** · **Brevo**

**[Live Demo →](https://resolvehub-liard.vercel.app/)**

</div>
