# Vignan Hostel Management System

> **"A Smarter Way to Manage Campus Living."**

A production-quality, enterprise-grade university hostel management platform built for Vignan University.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- MongoDB Atlas account
- npm v9+

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET

# 3. Seed the database with demo data
npm run seed

# 4. Start the server
npm start
# or for development with auto-reload:
npm run dev
```

The application will be available at **http://localhost:5000**

---

## 📋 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@vignan.ac.in | Admin@123 |
| Administrator | admin@vignan.ac.in | Admin@123 |
| Warden (Boys) | warden.boys@vignan.ac.in | Warden@123 |
| Warden (Girls) | warden.girls@vignan.ac.in | Warden@123 |
| Student | arjun.sharma@student.vignan.ac.in | Student@123 |
| Student | priya.reddy@student.vignan.ac.in | Student@123 |

---

## 🏗️ Architecture

```
vignan-hostel-management/
├── public/              # Frontend (HTML, CSS, JS)
│   ├── index.html       # Landing page
│   ├── login.html       # Authentication
│   ├── admin-dashboard.html
│   ├── student-dashboard.html
│   ├── warden-dashboard.html
│   ├── css/
│   │   ├── design-system.css   # Design tokens & components
│   │   └── pages.css           # Page-specific styles
│   └── js/
│       ├── api.js        # Fetch API client
│       ├── auth.js       # Authentication helpers
│       ├── utils.js      # Shared utilities
│       ├── dashboard-admin.js
│       ├── dashboard-student.js
│       └── dashboard-warden.js
└── server/              # Backend (Node.js / Express)
    ├── config/          # Database connection
    ├── models/          # Mongoose schemas (15 collections)
    ├── routes/          # Express routers
    ├── controllers/     # Business logic
    ├── middleware/       # Auth, validation
    └── services/        # Seed script
```

## 🎨 Design System

- **No gradients** — Solid institutional colours only
- **No rounded corners** — Sharp rectangular geometry throughout
- **Colour palette**: Midnight Navy (#101D32), Institutional Blue (#173F70), Crimson accent (#B32635)
- **Typography**: Plus Jakarta Sans / Inter
- **Icons**: Lucide Icons (CDN)

## 🔒 Security

- JWT authentication (7-day expiry)
- bcrypt password hashing (salt factor 12)
- Role-based access control (super_admin / admin / warden / student)
- Helmet.js security headers
- Input validation on all routes
- MongoDB credentials never exposed to client

## 📊 Database

MongoDB Atlas with 15 collections:
users, students, hostels, blocks, rooms, allocations, outpasses, complaints, fees, payments, announcements, notifications, messMenus, staff, activityLogs
