# Authentication and Authorization API

## Overview

This project provides a backend API for user authentication and organization management using Node.js, Express, and PostgreSQL. The API supports user registration, login, and various authentication and authorization operations.

## Features

- User registration with default organization creation
- User login with JWT token generation
- JWT token verification
- Protected routes for user-specific organization access
- Comprehensive test suite using Jest and Supertest

## Technologies Used

- Node.js
- Express
- PostgreSQL
- JWT (JSON Web Tokens)
- Jest (Testing)
- Supertest (HTTP assertions)

## Project Structure

```plaintext
.
├── app.js
├── config.js
├── db.js
├── controllers
│   └── authController.js
├── routes
│   └── auth.js
│   └── api.js
├── tests
│   └── auth.spec.js
├── .env
├── package.json
└── README.md
