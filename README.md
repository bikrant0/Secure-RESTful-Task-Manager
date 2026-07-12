# Enterprise Task Manager (Full-Stack SPA)

A modern, fully decoupled Full-Stack web application built to manage tasks efficiently. This project demonstrates enterprise-level backend architecture using **Django REST Framework (DRF)** and a responsive, vanilla JavaScript **Single Page Application (SPA)** on the frontend.

## Architecture Overview

This project is built with a strict separation of concerns. The backend acts strictly as an API, serving JSON data and managing secure authentication, while the frontend is a standalone SPA that communicates with the backend via the `fetch` API.

### Tech Stack
* **Backend:** Python, Django, Django REST Framework (DRF)
* **Authentication:** JSON Web Tokens (JWT) via `djangorestframework-simplejwt`
* **Database:** SQLite / PostgreSQL 
* **Frontend:** HTML5, CSS3, Vanilla JavaScript, Bootstrap 5
* **Security:** Cryptographic Password Hashing, CORS Management

---

## Core Features

### Security & Authentication
* **Custom User Model:** Implemented a scalable `CustomUser` model overriding Django's default.
* **JWT Authentication:** Stateless, secure API authentication using Access and Refresh tokens.
* **Secure Registration:** API endpoint for new user registration utilizing built-in cryptographic password hashing (`set_password`).
* **CORS Policy:** Configured Cross-Origin Resource Sharing to allow seamless communication between the frontend client and backend API.

### Task Management API
* **Full CRUD Operations:** Create, Read, Update, and Delete tasks.
* **User Isolation:** API strictly returns and manipulates tasks belonging *only* to the currently authenticated user.
* **Status Tracking:** Tasks are tracked via states (TODO, IN_PROGRESS, DONE).

### Frontend SPA (Single Page Application)
* **Modern UI/UX:** Responsive, split-screen SaaS-style authentication page.
* **Dynamic DOM Manipulation:** Seamlessly transitions between Authentication and Dashboard views without page reloads.
* **API Integration:** Asynchronous JavaScript handling HTTP GET/POST requests and JWT token attachment in authorization headers.

---
## Local Setup & Installation

1. **Clone the repository and set up your virtual environment:**

   ```bash
          git clone [https://github.com/yourusername/enterprise-task-manager.git](https://github.com/yourusername/enterprise-task-manager.git) 
          cd django-url-shortener

2. **Create and activate a virtual environment**

        python -m venv venv

        # On Windows:
        venv\Scripts\activate
        
        # On Mac/Linux:
        source venv/bin/activate
        

3. **Install dependencies**

       pip install -r requirements.txt

4. **Database Migrations**

   Apply the initial migrations for the CustomUser and Tasks tables:

        python manage.py makemigrations
        python manage.py migrate

5. **Start the Server**

    Run the local development server:

        python manage.py runserver
---
## Project Structure

```text
enterprise_task_manager/
│
├── core/                   # Main Django configuration & global URL routing
├── accounts/               # Authentication app (CustomUser, Auth APIs, Serializers)
├── tasks/                  # Core business logic (Task APIs, Models, Views)
├── frontend/              # Frontend UI assets (index.html SPA)
├── manage.py               # Django execution script
└── README.md               # Project documentation




Run the local development server:
python manage.py runserver
