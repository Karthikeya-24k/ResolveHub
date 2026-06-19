# ResolveHub — Complaint & Issue Tracking System

A full-stack complaint management system built with **Spring Boot** (backend) and **React + Tailwind CSS** (frontend). Supports role-based access control, JWT authentication, issue lifecycle management, and a polished dual-theme UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 4.0.5, Java 21 |
| Security | Spring Security + JWT (jjwt 0.11.5) |
| Database | MySQL 8+ (JPA / Hibernate) |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| HTTP Client | Axios |
| Routing | React Router DOM 7 |

---

## Project Structure

```
ComplainSystem/
├── Backend/                          # Spring Boot application
│   └── src/main/java/com/example/ComplainSystem/
│       ├── config/
│       │   ├── AdminSeeder.java      # Seeds default MAIN ADMIN on startup
│       │   └── SecurityConfig.java   # CORS, JWT filter, route permissions
│       ├── controller/
│       │   ├── UserController.java   # POST /users/register, /login  PUT /{id}/role  GET /users
│       │   ├── IssueController.java  # CRUD + assign + status + filter + assignable
│       │   └── CommentController.java# POST /comments  GET /comments/issue/{id}
│       ├── dto/
│       │   ├── request/
│       │   │   ├── UserRequest.java
│       │   │   ├── LoginRequest.java
│       │   │   ├── RoleUpdateRequest.java
│       │   │   ├── IssueRequest.java
│       │   │   ├── AssignRequest.java
│       │   │   ├── StatusUpdateRequest.java
│       │   │   └── CommentRequest.java
│       │   └── response/
│       │       ├── ApiResponse.java  # Generic wrapper { status, data }
│       │       ├── UserResponse.java # id, name, email, role, seededAdmin
│       │       ├── IssueResponse.java# id, title, description, status, priority, assignedTo, createdBy, comments
│       │       ├── CommentResponse.java
│       │       └── ErrorResponse.java
│       ├── entity/
│       │   ├── User.java             # id, name, email, password, role, seededAdmin
│       │   ├── IssuesEntity.java     # id, title, description, status, priority, createdBy, assignedTo, assignedBy
│       │   ├── Comment.java          # id, message, user, issue
│       │   └── Status.java           # Enum: OPEN → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
│       ├── exception/
│       │   └── GlobalExceptionHandler.java  # Unified error responses
│       ├── repository/
│       │   ├── UserRepo.java         # findByEmail
│       │   ├── IssueRepo.java        # findByStatus, findByPriority, findAssignableIssues (OPEN + unassigned)
│       │   └── CommentRepository.java# findByIssue_Id
│       ├── services/
│       │   ├── UserService.java      # register, login (JWT), updateRole (seededAdmin guard)
│       │   ├── IssueService.java     # createIssue, getAllIssues (role-scoped), assignIssue (guards), updateStatus, filterIssues
│       │   └── CommentService.java   # addComment, getCommentsByIssue
│       └── util/
│           ├── JwtUtil.java          # generateToken (email + role + seededAdmin), extract*, isTokenValid
│           └── JwtFilter.java        # Per-request JWT validation filter
│
└── Frontend/                         # React + Vite application
    └── src/
        ├── assets/                   # Static images (hero.png, svgs)
        ├── components/
        │   ├── AlertMessage.jsx      # Error / success / warning banners (dark-mode aware)
        │   ├── Badge.jsx             # Status & priority pills with dark: variants
        │   ├── Button.jsx            # Reusable button (unused — pages use inline buttons)
        │   ├── Card.jsx              # Reusable card wrapper
        │   ├── Input.jsx             # Reusable input with icon support
        │   ├── Layout.jsx            # Sidebar + Navbar + main content shell
        │   ├── Navbar.jsx            # Search bar (live, debounced via SearchContext), dark mode toggle, user info
        │   ├── ProtectedRoute.jsx    # JWT auth guard + optional role check
        │   └── Sidebar.jsx           # Role-scoped nav links, logo, role footer
        ├── context/
        │   └── SearchContext.jsx     # Global search query state shared between Navbar and pages
        ├── hooks/
        │   └── useDarkMode.js        # Persists dark/light preference in localStorage, applies .dark class
        ├── pages/
        │   ├── Login.jsx             # Email + password login, show/hide password toggle
        │   ├── Register.jsx          # User registration form
        │   ├── Dashboard.jsx         # Metric cards, recent issues, quick actions, CSV export, support modal
        │   ├── IssueList.jsx         # Paginated table, filter panel (status/priority), live search
        │   ├── IssueDetail.jsx       # Issue info, comment thread, add comment
        │   ├── CreateIssue.jsx       # Submit new complaint form
        │   ├── AssignIssue.jsx       # Admin: assign OPEN+unassigned issues to STAFF with priority
        │   ├── UpdateStatus.jsx      # Staff/Admin: move issues through status workflow
        │   └── ManageUsers.jsx       # Admin: view all users, change roles, seeded admin protected
        ├── services/
        │   ├── api.js                # Axios instance + all API call functions
        │   └── auth.js               # JWT helpers: save/get/remove token, decode, getRole, getEmail, getSeededAdmin
        ├── App.jsx                   # Route definitions wrapped in SearchProvider
        ├── index.css                 # Design tokens (CSS variables light/dark), .field, .login-field, .label-muted, .locked-badge
        └── main.jsx                  # React DOM entry point
```

---

## Roles & Permissions

| Action | USER | STAFF | ADMIN | MAIN ADMIN |
|---|:---:|:---:|:---:|:---:|
| Register / Login | ✅ | ✅ | ✅ | ✅ |
| Create issue | ✅ | — | ✅ | ✅ |
| View own issues | ✅ | — | ✅ | ✅ |
| View assigned issues | — | ✅ | ✅ | ✅ |
| View all issues | — | — | ✅ | ✅ |
| Update issue status | — | ✅ | ✅ | ✅ |
| Assign issues to staff | — | — | ✅ | ✅ |
| Manage user roles | — | — | ✅* | ✅ |
| Promote/demote ADMIN | — | — | ❌ | ✅ |
| Modify MAIN ADMIN | ❌ | ❌ | ❌ | ❌ |

*Normal ADMIN cannot modify other ADMIN accounts — only MAIN ADMIN can.

---

## Issue Status Workflow

```
OPEN → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
```

- Transitions are strictly enforced in `IssueService.isValidTransition()`
- Only OPEN + unassigned issues appear in the assignment dropdown (`GET /issues/assignable`)
- CLOSED issues cannot be reassigned

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/users/register` | Public | Register new user |
| POST | `/users/login` | Public | Login, returns JWT |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | ADMIN | List all users |
| PUT | `/users/{id}/role` | ADMIN | Update user role |

### Issues
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/issues` | USER, ADMIN | Create issue |
| GET | `/issues` | All | Get issues (role-scoped) |
| GET | `/issues/{id}` | All | Get issue with comments |
| GET | `/issues/all` | All | Get all issues unfiltered |
| GET | `/issues/assignable` | ADMIN | OPEN + unassigned issues only |
| GET | `/issues/filter` | All | Filter by status / priority / staffId |
| POST | `/issues/assign` | ADMIN | Assign issue to staff |
| PUT | `/issues/status` | STAFF, ADMIN | Update issue status |

### Comments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/comments` | All | Add comment to issue |
| GET | `/comments/issue/{id}` | All | Get comments for issue |

---

## Setup & Running

### Prerequisites
- Java 21
- Maven 3.9+
- MySQL 8+
- Node.js 20+

### Backend

1. Create the database:
```sql
CREATE DATABASE complainsystem;
```

2. Update `Backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/complainsystem
spring.datasource.username=<your_mysql_user>
spring.datasource.password=<your_mysql_password>
jwt.secret=<your_hex_encoded_256bit_secret>
jwt.expiration=86400000
```

3. Run:
```bash
cd Backend
./mvnw spring-boot:run
```

The default MAIN ADMIN is seeded automatically on first startup.

> **Important:** Set a strong admin password via the `DB_PASSWORD` environment variable before first run. Change the default credentials immediately after first login.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. Backend expected at `http://localhost:8080`.

---

## Key Features

### Authentication & Security
- JWT tokens with `role` and `seededAdmin` claims
- Token stored in `localStorage`, decoded client-side for role/permission checks
- `ProtectedRoute` component guards all authenticated pages with optional role enforcement
- Auto-redirect to `/login` on 401 responses (Axios interceptor)

### Search
- Global search bar in Navbar connected via `SearchContext`
- 300ms debounce on input
- Filters by: issue ID, title, status, priority, createdBy, assignedTo
- Works on both Dashboard and IssueList simultaneously

### Dark Mode
- Toggled via Navbar button, persisted in `localStorage`
- Implemented via `.dark` class on `<html>` element
- All colors use CSS custom properties (`--bg`, `--surface`, `--input-bg`, etc.) defined in `index.css` for both `:root` and `.dark`
- Standard Tailwind `dark:` variants used for Badge, AlertMessage, and metric card colors

### Export
- Dashboard "Export Report" button downloads all loaded issues as a `.csv` file
- Columns: ID, Title, Status, Priority, Created By, Assigned To
- Filename includes current date: `issues-report-YYYY-MM-DD.csv`

### MAIN ADMIN Protection
- Seeded admin has `seededAdmin = true` in DB and JWT
- Backend `UserService.updateRole()` throws if target user is seeded admin
- Frontend `ManageUsers` locks the row and shows "Main Admin" badge
- Normal admins cannot modify other admin accounts

---

## Design System

The UI uses a token-based CSS variable system defined in `index.css`:

```
--bg              Page background
--surface         Card / panel background
--surface-raised  Slightly elevated surface (inputs, hover states)
--surface-border  Border color
--text-primary    Main text
--text-secondary  Secondary text
--text-muted      Labels, captions
--text-faint      Placeholder, disabled
--input-bg        Input background
--input-border    Input border
--input-focus     Input focus ring color
--shadow          Default shadow
--shadow-card     Card-specific layered shadow
```

Reusable CSS classes: `.field`, `.login-field`, `.label-muted`, `.locked-badge`, `.icon-chevron`, `.ambient-shadow`, `.primary-gradient`, `.card`

---

## Environment Notes

- CORS is configured in `SecurityConfig.java` — update allowed origins for production
- `spring.jpa.hibernate.ddl-auto=update` — safe for development, use `validate` in production
- JWT secret in `application.properties` should be moved to environment variables before deployment
