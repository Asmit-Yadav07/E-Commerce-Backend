# 🛒 E-Commerce Backend API

> 🚀 This project was built to strengthen my backend development skills and gain hands-on experience with real-world API development, authentication, database management, and scalable application architecture.

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Framework-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

### 🚀 A Production-Oriented E-Commerce Backend Built with Node.js, Express & MongoDB

</div>

---

## 📖 Overview

This project is a complete backend solution for an e-commerce platform, developed using **Node.js**, **Express.js**, and **MongoDB**.

It provides secure authentication, product management, cart operations, order processing, and role-based authorization while following a clean and scalable architecture.

---

## ✨ Features

### 🔐 Authentication & Security

- User Registration & Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Access Control (Admin/User)

### 📦 Product Management

- Create Products
- Update Products
- Delete Products
- Product Listing
- Product Search & Filtering
- Inventory Management

### 🛒 Cart System

- Add Products to Cart
- Update Quantity
- Remove Items
- View Cart

### 📋 Order Management

- Place Orders
- View Order History
- Order Status Tracking
- Admin Order Controls

### ⚡ Backend Best Practices

- MVC Architecture
- Centralized Error Handling
- Environment Variable Management
- Middleware-Based Authentication
- RESTful API Design

---

## 🛠 Tech Stack

| Technology | Purpose             |
| ---------- | ------------------- |
| Node.js    | Runtime Environment |
| Express.js | Backend Framework   |
| MongoDB    | Database            |
| Mongoose   | ODM                 |
| JWT        | Authentication      |
| bcrypt.js  | Password Hashing    |
| Postman    | API Testing         |

---

## 📂 Project Structure

## 📂 Project Structure

```bash
E-Commerce
│
├── public/                 # Static files
│
├── src/
│   ├── controllers/        # Business logic
│   ├── db/                 # Database connection
│   ├── middlewares/        # Custom middlewares
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── app.js              # Express app configuration
│   ├── constant.js         # Constants
│   └── index.js            # Entry point
│
├── .env                    # Environment variables
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 🚧 Challenges Faced

### 🔐 Implementing Authentication

Understanding JWT token generation, verification, and protecting routes with middleware took significant debugging and testing.

### 🗄️ MongoDB Schema Design

Designing schemas and relationships between users, products, carts, and orders while maintaining data consistency was challenging.

### ⚙️ Middleware Architecture

Creating reusable authentication and error-handling middleware required learning how Express request-response cycles work.

### 📁 Scalable Folder Structure

Organizing the project into controllers, routes, models, middlewares, and utilities helped me understand professional backend architecture.

### 🐞 Debugging API Requests

Troubleshooting issues with request headers, tokens, request bodies, and database queries improved my debugging skills.

### 🔄 Asynchronous Operations

Managing asynchronous database operations using async/await and handling errors properly was an important learning experience.

### 📦 Environment Configuration

Managing environment variables securely and configuring different development settings taught me backend deployment practices.
