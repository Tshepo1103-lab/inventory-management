# Imbizo Shisanyama — Inventory Management System

Enterprise-grade proof-of-concept inventory platform for **Imbizo Shisanyama**, digitizing stock receiving, manager approvals, inventory tracking, and reporting.

![Imbizo Brand](frontend/public/logo-full.png)

## Features

- **Dashboard** — inventory value, low stock alerts, pending approvals, charts
- **Inventory Management** — SKUs, categories, units, thresholds, search & pagination
- **Supplier Management** — contacts, delivery history metrics
- **Stock Receiving** — delivery capture, verification, invoice upload, manager approval workflow
- **Stock Movements** — incoming, outgoing, wastage, damaged, transfers, adjustments
- **Reports** — inventory, low stock, valuation, deliveries, wastage (export JSON)
- **Notifications** — low stock, pending approvals, rejections
- **RBAC** — Admin, Store Manager, Receiver, Kitchen Manager, Auditor
- **Dark/Light mode** — gold & black Imbizo brand theme

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn-style UI, TanStack Query, Zustand, Zod, Recharts |
| Backend | ASP.NET Core (.NET 10), Clean Architecture, EF Core, SQL Server, JWT, FluentValidation, AutoMapper, Serilog |
| Database | SQL Server 2022 |

## Quick Start

### 1. Start SQL Server

```bash
docker compose up -d
```

Wait until the container is healthy (~30s).

### 2. Run the API

```bash
cd backend
dotnet run --project src/Imbizo.Inventory.API
```

API: http://localhost:5271  
Swagger: http://localhost:5271/swagger

Database is migrated and seeded automatically on startup.

### 3. Run the Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@imbizo.co.za | Admin@123 |
| Store Manager | manager@imbizo.co.za | Manager@123 |
| Receiver | receiver@imbizo.co.za | Receiver@123 |
| Kitchen Manager | kitchen@imbizo.co.za | Kitchen@123 |
| Auditor | auditor@imbizo.co.za | Auditor@123 |

## Project Structure

```
inventory-management/
├── backend/
│   └── src/
│       ├── Imbizo.Inventory.Domain/        # Entities, enums
│       ├── Imbizo.Inventory.Application/   # Services, DTOs, validators
│       ├── Imbizo.Inventory.Infrastructure/# EF Core, JWT, seeding
│       └── Imbizo.Inventory.API/           # Controllers, middleware
├── frontend/
│   └── src/
│       ├── app/          # Next.js App Router pages
│       ├── components/   # UI & layout
│       ├── lib/          # API client, types
│       └── stores/       # Zustand auth store
└── docker-compose.yml
```

## API Endpoints (v1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | JWT login |
| GET | `/api/v1/dashboard` | Dashboard metrics |
| GET/POST | `/api/v1/inventory` | Inventory CRUD |
| GET/POST | `/api/v1/suppliers` | Suppliers |
| GET/POST | `/api/v1/deliveries` | Stock receiving |
| POST | `/api/v1/deliveries/{id}/approve` | Manager approval |
| GET/POST | `/api/v1/stockmovements` | Stock movements |
| GET | `/api/v1/reports/*` | Reports |
| GET | `/api/v1/notifications` | User notifications |

## Environment Variables

### Backend (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=ImbizoInventory;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "ImbizoShisanyamaSuperSecretKey2026Minimum32Chars!",
    "Issuer": "ImbizoInventory",
    "Audience": "ImbizoInventoryClient"
  }
}
```

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5271/api/v1
```

## Stock Receiving Workflow

1. Delivery arrives → Receiver records delivery with items & signature
2. Submission enters **Pending** status
3. Store Manager / Admin reviews and **Approves**, **Partially Approves**, or **Rejects**
4. Approved quantities automatically update inventory and create stock movement audit records

## License

Proof of concept — Imbizo Shisanyama © 2026
