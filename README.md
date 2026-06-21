# Delivery & Inventory Management System

A comprehensive full-stack application for managing deliveries, inventory, orders, suppliers, and logistics operations. Built with modern web technologies for real-time tracking and efficient supply chain management.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Key Components](#key-components)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This project is a complete delivery and inventory management solution designed for businesses that need to manage:
- Order creation and tracking
- Delivery scheduling and real-time monitoring
- Inventory management and stock control
- Driver and vehicle management
- Supplier management and purchase requisitions
- Return processing
- Analytics and reporting

The system provides both administrative dashboards for managers and user-friendly interfaces for customers and delivery personnel.

---

## ✨ Features

### Core Functionality
- **Order Management**: Create, view, edit, and track orders
- **Delivery Tracking**: Real-time GPS tracking with interactive maps
- **Inventory Management**: Stock monitoring, low-stock alerts, and inventory reports
- **Driver Management**: Manage drivers, assignments, and performance
- **Supplier Management**: Maintain supplier information and manage relationships
- **Return Processing**: Handle product returns and track return status
- **Purchase Requisitions**: Submit and approve purchase orders
- **Authentication**: Secure login with JWT token-based authentication

### Advanced Features
- **Real-time Map Integration**: Leaflet-based interactive maps for delivery tracking
- **Data Export**: Generate PDF reports and export data to CSV
- **Analytics Dashboard**: Visual charts and KPIs for business insights
- **Role-based Access Control**: Different dashboards for admins and users
- **Responsive Design**: Mobile-friendly interface for field operations

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + Bcrypt
- **Development**: Nodemon for hot reload
- **CORS**: Enabled for cross-origin requests

### Frontend
- **Library**: React 19.1
- **Routing**: React Router DOM 7.8
- **HTTP Client**: Axios
- **Charting**: Recharts 3.2
- **Mapping**: Leaflet 1.9 + React-Leaflet 5.0
- **Icons**: React Icons 5.5
- **Export/Import**: 
  - jsPDF + jsPDF-AutoTable (PDF generation)
  - Papa Parse (CSV parsing)
  - react-csv (CSV export)
- **Print Functionality**: react-to-print
- **File Operations**: file-saver
- **Styling**: CSS (custom styling)

---

## 📁 Project Structure

```
Project1/
├── BACKEND/                 # Node.js/Express backend
│   ├── app.js              # Main application entry point
│   ├── package.json
│   ├── Controllers/        # Business logic controllers
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── deliveryController.js
│   │   ├── inventoryController.js
│   │   ├── driverController.js
│   │   ├── supplierController.js
│   │   ├── returnController.js
│   │   └── ...
│   ├── Model/              # Database models
│   │   ├── User.js
│   │   ├── orderModel.js
│   │   ├── DeliverModel.js
│   │   ├── inventoryModel.js
│   │   ├── DriverModel.js
│   │   ├── supplierModel.js
│   │   ├── TrackingEventModel.js
│   │   └── ...
│   └── Route/              # API endpoints
│       ├── authRoutes.js
│       ├── orderRoute.js
│       ├── DeliverRoutes.js
│       ├── inventoryRoute.js
│       └── ...
│
└── frontend/               # React frontend
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── api.js          # API configuration
        ├── components/     # Reusable React components
        │   ├── Navbar.jsx
        │   ├── MapTracker.js
        │   ├── Delivery/
        │   ├── InventoryDashboard/
        │   ├── OrderSidebar.js
        │   └── ...
        ├── pages/          # Page components
        │   ├── AdminDashboard.js
        │   ├── OrderManagement.jsx
        │   ├── ClothingItemManagement.jsx
        │   ├── Login.js
        │   └── ...
        ├── context/        # React Context for state management
        │   ├── AuthContext.jsx
        │   └── CartContext.jsx
        ├── services/       # API service calls
        │   ├── authService.js
        │   ├── orderService.js
        │   ├── clothingItemService.js
        │   └── ...
        └── assets/         # Images, icons, static files
```

---

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (local or MongoDB Atlas cloud instance)
- A modern web browser (Chrome, Firefox, Safari, Edge)

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Project1
```

### 2. Backend Setup
```bash
cd BACKEND
npm install
```

**Configure Backend:**
- Create a `.env` file in the BACKEND directory (if needed)
- Add MongoDB connection URI: `MONGO_URI=mongodb://...`
- Add JWT secret: `JWT_SECRET=your-secret-key`
- Specify backend port (default: 5000)

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

**Verify Configuration:**
- Check that the `proxy` in `package.json` points to your backend: `"proxy": "http://localhost:5000"`

---

## ▶️ Running the Application

### Option 1: Run Both Simultaneously (Recommended for Development)

**Terminal 1 - Start Backend:**
```bash
cd BACKEND
npm start
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```
Frontend will open automatically at `http://localhost:3000`

### Option 2: Run Separately
```bash
# Backend only
cd BACKEND && npm start

# Frontend only
cd frontend && npm start
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build
```

This creates an optimized production build in the `build/` folder.

---

## 📡 API Documentation

### Authentication Endpoints
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/logout` - User logout

### Order Endpoints
- **GET** `/api/orders` - Fetch all orders
- **POST** `/api/orders` - Create new order
- **GET** `/api/orders/:id` - Get order details
- **PUT** `/api/orders/:id` - Update order
- **DELETE** `/api/orders/:id` - Delete order

### Delivery Endpoints
- **GET** `/api/delivery` - Fetch all deliveries
- **POST** `/api/delivery` - Create delivery
- **PUT** `/api/delivery/:id` - Update delivery status
- **GET** `/api/tracking/:id` - Get real-time tracking events

### Inventory Endpoints
- **GET** `/api/inventory` - Get all inventory items
- **POST** `/api/inventory` - Add inventory item
- **PUT** `/api/inventory/:id` - Update inventory
- **GET** `/api/inventory/low-stock` - Get low-stock items

### Driver Endpoints
- **GET** `/api/drivers` - Fetch all drivers
- **POST** `/api/drivers` - Add new driver
- **PUT** `/api/drivers/:id` - Update driver info

### Supplier Endpoints
- **GET** `/api/suppliers` - Get all suppliers
- **POST** `/api/suppliers` - Add supplier
- **PUT** `/api/suppliers/:id` - Update supplier

### Additional Endpoints
- **GET** `/api/requisitions` - Purchase requisitions
- **GET** `/api/returns` - Return requests

*For detailed endpoint specifications, refer to route files in `BACKEND/Route/`*

---

## 🔑 Key Components

### Frontend Components
- **Navbar**: Main navigation component
- **MapTracker**: Interactive map for delivery tracking with Leaflet
- **OrderSidebar**: Quick order access and filters
- **InventoryDashboard**: Dashboard showing inventory metrics and alerts
- **Delivery Dashboard**: Real-time delivery status and KPIs
- **ClothingItemManagement**: CRUD operations for clothing items
- **CreateOrderForm/EditOrderForm**: Order creation and editing
- **Login**: Authentication page

### Backend Models
- **User**: User accounts and authentication
- **Order**: Order information and status
- **DeliverModel**: Delivery details and routing
- **Inventory**: Stock levels and tracking
- **Driver**: Driver information and assignments
- **Supplier**: Supplier details
- **TrackingEvent**: Real-time GPS tracking events
- **Returns**: Return request management

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---


---

**Last Updated**: June 2026


