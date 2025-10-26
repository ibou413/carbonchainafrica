# 🌍 CarbonChain-Africa Backend

This directory contains the Django REST Framework backend for the CarbonChain-Africa application. It serves as the central data management layer, handling user authentication, project submissions, and marketplace listings, while integrating with Hedera blockchain events.

## 📋 Table of Contents

- [📜 Overview](#overview)
- [🛠️ Technology Stack](#technology-stack)
- [🚀 Setup and Installation](#setup-and-installation)
- [🗄️ Database Models](#database-models)
- [🔗 API Endpoints](#api-endpoints)
- [🔐 Permissions and Roles](#permissions-and-roles)

## 📜 Overview

The backend is responsible for:
- 👤 Managing user accounts and roles (Seller, Verifier, Buyer).
- 📂 Storing and managing carbon project data (status, metadata CIDs).
- 💰 Handling carbon credit ownership and listing information.
- 🔄 Providing RESTful API endpoints for the frontend to interact with.
- ⛓️ Recording the outcomes of on-chain Hedera transactions (e.g., NFT minting, marketplace sales).

## 🛠️ Technology Stack

- **Framework**: Django, Django REST Framework
- **Language**: Python 3.10+
- **Database**: PostgreSQL (recommended for production), SQLite (for development)
- **Authentication**: JWT (JSON Web Tokens) via `djangorestframework_simplejwt`
- **Dependencies**: See `requirements.txt` for a full list.

## 🚀 Setup and Installation

Follow these steps to get the backend up and running:

1.  **Navigate to the backend directory:**
    ```bash
    cd CarbonChain-Africa/backend
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv env
    # On Windows:
    env\Scripts\activate
    # On macOS/Linux:
    source env/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables:**
    Create a `.env` file in the `backend` directory (you can use `.env.example` as a template). At a minimum, you'll need to configure:
    - `SECRET_KEY`: A strong Django secret key.
    - `DEBUG`: `True` for development, `False` for production.
    - `DATABASE_URL`: Your database connection string (e.g., `sqlite:///db.sqlite3` for SQLite, or `postgres://user:password@host:port/dbname`).

5.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Create a superuser (optional, for Django Admin):**
    ```bash
    python manage.py createsuperuser
    ```
    

7.  **Start the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will be accessible at `http://127.0.0.1:8000/api/`.

    You can then access the Django admin interface as a superuser at `http://127.0.0.1:8000/admin/`.

## 🗄️ Database Models

The core models are defined in `api/models.py`:

-   **`Project`**: Represents a carbon credit project submitted by a `Seller`. Includes fields for owner, verifier, status (PENDING, APPROVED, REJECTED), tonnage, vintage, and IPFS CIDs for metadata, image, and documents.
-   **`CarbonCredit`**: Represents a tokenized carbon credit (NFT) on Hedera. Linked to a `Project` and an `owner`, storing the Hedera Token ID and serial number. Statuses include MINTED, LISTED, SOLD.
-   **`Listing`**: Represents an active or inactive listing of a `CarbonCredit` on the marketplace. Includes price, seller, and status (active, claimed).
-   **`UserProfile`**: Extends Django's built-in `User` model to add a `role` (e.g., SELLER, VERIFIER, BUYER).

## 🔗 API Endpoints

Key API endpoints are defined in `api/urls.py` and implemented in `api/views.py`:

-   `/api/users/register/`: User registration.
-   `/api/users/login/`: User login, returns JWT tokens.
-   `/api/projects/`: List approved projects (GET), create new project (POST - Seller only).
-   `/api/projects/my-projects/`: List projects owned by the authenticated user (Seller only).
-   `/api/projects/pending-review/`: List projects awaiting verification (Verifier only).
-   `/api/projects/verifier-dashboard/`: Dashboard for verifiers showing pending and verified projects.
-   `/api/projects/<int:pk>/`: Retrieve details of a specific project.
-   `/api/projects/<int:pk>/review/`: Approve or reject a project (Verifier only).
-   `/api/listings/`: List active marketplace listings (GET), create new listing (POST - Seller only).
-   `/api/listings/my-listings/`: List all listings by the authenticated user (Seller only).
-   `/api/nfts/my-nfts/`: List carbon credit NFTs owned by the authenticated user.
-   `/api/nfts/<int:pk>/`: Retrieve details of a specific carbon credit NFT.
-   `/api/listings/<int:pk>/buy/`: Purchase a listed carbon credit (Buyer only).
-   `/api/listings/<int:pk>/claim/`: Claim proceeds from a sold listing (Seller only).
-   `/api/listings/<int:pk>/withdraw/`: Withdraw an unsold listing (Seller only).

## 🔐 Permissions and Roles

The backend implements role-based access control:
-   **SELLER**: Can create projects, list their NFTs, and claim proceeds.
-   **VERIFIER**: Can review and approve/reject projects.
-   **BUYER**: Can purchase NFTs from the marketplace.

Permissions are enforced using Django REST Framework's custom permission classes (`api/permissions.py`).
