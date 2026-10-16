# BASAH SERVICE LIMITED — Vehicle Income & Expense Management System

> Modern commercial fleet income, fuel, and expense management system replacing the legacy Excel-based reporting workflow (`KDY REPORTT.xlsx`).

---

## 1. Overview & Architecture

This application represents **Phase 1: Frontend-First Implementation** for **BASAH SERVICE LIMITED**. It is architected to eliminate paper and spreadsheet bottlenecks, enforce automated financial validation on data entry, and prepare a modular service layer ready for clean integration with a future **Node.js + Express.js REST API** and **MySQL database**.

### Primary Vehicle
- **KDY 926B** (Mercedes-Benz Actros 3340 Prime Mover / 30T Semi-Trailer) featured as the primary operational unit from `KDY REPORTT.xlsx`.
- Multi-vehicle support demonstrated with additional fleet units (`KBZ 481M`, `KCD 312T`, `KDA 874J`).

---

## 2. Financial Calculation Rules

All figures are governed by standard fleet logistics calculation rules implemented in `src/utils/calculations.js`:

```text
Gross Amount    = Offload Quantity × Offload Rate
Total Expenses  = Fuel Expense + Other Expenses
Net Income      = Gross Amount − Total Expenses
```

- **Currency**: Kenyan Shillings (`KSh`) formatted to two decimal places.
- **Fuel**: Diesel consumption tracked in Litres (`L`).
- **Deficit / Negative Handling**: Net income accurately reflects operational deficits (negative numbers highlighted in red) when expenses exceed trip revenue.
- **Floating-point Protection**: Uses `Math.round((val + Number.EPSILON) * 100) / 100` to prevent IEEE 754 precision artifacts.
- **Mileage Column Policy**: Maintained as an operational odometer distance (KM). Per company instructions, pending management confirmation before classifying as an expense item.

---

## 3. Technology Stack

- **Framework**: React.js with JavaScript (ESNext)
- **Bundler & Tooling**: Vite 8
- **Styling**: Bootstrap 5 + custom modern fleet dashboard styles
- **Icons**: Lucide React
- **Charts & Visualizations**: Chart.js with `react-chartjs-2`
- **Routing**: React Router DOM (v7)
- **API Service Layer**: Axios with client interceptors (switchable to Node/Express in Phase 2)

---

## 4. Getting Started

### Installation

```bash
npm install
```

### Development Server

Start the Vite development server on port 3000:

```bash
npm run dev
```

### Production Build

Verify the production build:

```bash
npm run build
```

---

## 5. Demo Credentials (Frontend Phase)

For demonstration purposes, authentication is simulated in local storage with credentials:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Full administrative authority |
| **Fleet Manager** | `manager` | `manager123` | Operational & vehicle dispatch |

*(Note: In Phase 2, production JWT authentication will be integrated with backend bcrypt hashing and MySQL tables).*

---

## 6. Application Pages & Features

1. **Sign In (`/login`)**: Client-side validation, show/hide password, quick demo credential buttons.
2. **Dashboard (`/`)**: 6 summary KPI cards, Income vs Expenses bar chart, Net Income trendline, Expense doughnut, vehicle filter, and recent trip reports.
3. **Reports & Ledgers (`/reports`)**: Unified reporting navigation combining:
   - **Daily Offloading Reports**: Real-time formula recalculation, search, vehicle filter, date range, column sorting, pagination, and CSV export.
   - **Monthly Financial Statements**: Monthly financial statement, working days count, daily net profit averages, letterhead print layout, and printable balance sheet.
4. **Vehicle Registry (`/vehicles`)**: Fleet units, plate numbers, capacities, drivers, active/maintenance statuses, and delete controls.
5. **Import & Export (`/import-export`)**: Drag-and-drop Excel file upload simulation, column header mapping, duplicate detection, and Excel template download.
6. **User Management (`/users`)**: Staff roles, account activations/deactivations, and permissions overview.
7. **Settings (`/settings`)**: Currency options, date formats, mileage ledger policies, and factory demo data restoration.
