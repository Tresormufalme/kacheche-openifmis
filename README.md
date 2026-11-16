# Kacheche OpenIFMIS

**A Financial Management System Prototype**

Kacheche is an OpenIFMIS-inspired financial management platform designed to support the management, monitoring, and auditing of public financial operations.

The project was developed as part of a practical learning and application development initiative.

## Technology Stack

### Backend
- Java 25
- Spring Boot 4
- Spring Data JPA
- Hibernate Envers
- Spring Security
- Maven
- PostgreSQL

### Frontend
- Angular
- TypeScript
- Angular Material
- SCSS
- RxJS

## Main Features

- Dashboard with financial indicators.
- Department management.
- Budget management.
- Expense management.
- Expense approval and rejection workflows.
- Financial execution monitoring.
- Audit trails using Hibernate Envers.
- Role-based access control.
- REST API integration between Angular and Spring Boot.

## Demo Credentials

The following accounts are provided for testing the prototype:

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `Admin@123` |
| Accountant | `comptable` | `Comptable@123` |

**Important:** These are demonstration credentials only. They must not be used in a production environment. Change them before any real-world deployment.

### Role Permissions

- **ADMIN:** Full administrative access, including audit trail consultation, department and budget management, and expense approval or rejection.
- **COMPTABLE:** Access to financial data and expense management, without administrative audit access or approval privileges.

## Architecture

The application follows a frontend/backend architecture:

- `kacheche-frontend`: Angular application.
- `kacheche-backend`: Spring Boot REST API.
- `PostgreSQL`: Relational database.

## Learning Objectives

This project provides practical experience with:

- Java and object-oriented programming.
- Java Generics.
- Spring Boot application development.
- Spring Data JPA and Hibernate.
- Database relationships and persistence.
- Hibernate Envers and audit trail management.
- REST API development and integration.
- Angular and TypeScript.
- Application security and role-based authorization.

## Running the Project

### Backend

Open the `kacheche-backend` directory and configure the PostgreSQL database connection using your local environment variables.

Run:

```bash
mvn spring-boot:run
```

The API is available at:

`http://localhost:8080`

### Frontend

Open the `kacheche-frontend` directory and install dependencies:

```bash
npm install
```

Start Angular:

```bash
ng serve
```

The frontend is available at:

`http://localhost:4200`

## Project Status

Kacheche is a working prototype under active development. Additional features, testing, and production-readiness improvements may be introduced in subsequent iterations.

## Author

**Trésor Mufalme**

Software Developer | Java & Spring Boot | Angular | TypeScript