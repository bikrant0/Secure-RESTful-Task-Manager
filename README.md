# Secure RESTful Task Management System

An enterprise-grade, decoupled task management application built with \*\*Django REST Framework\*\* (Backend) and \*\*Vanilla JavaScript/HTML/CSS\*\* (Frontend). This project demonstrates production-ready patterns including JWT authentication, strict tenant isolation, relational database design, and advanced frontend performance optimizations.

!\[Python\]([https://img.shields.io/badge/Python-3.10+-blue.svg](https://img.shields.io/badge/Python-3.10+-blue.svg) )

!\[Django\]([https://img.shields.io/badge/Django-4.x-092E20.svg](https://img.shields.io/badge/Django-4.x-092E20.svg) )

!\[DRF\]([https://img.shields.io/badge/DRF-3.14-red.svg](https://img.shields.io/badge/DRF-3.14-red.svg) )

!\[License\]([https://img.shields.io/badge/License-MIT-green.svg](https://img.shields.io/badge/License-MIT-green.svg) )

---

## Key Features

### Enterprise Security & Architecture

\- \*\*JWT Authentication\*\*: Stateless, secure login/registration using `djangorestframework-simplejwt`.

\- \*\*Strict Tenant Isolation\*\*: Overridden `get_queryset()` ensures users can  *only*  access, modify, or delete their own tasks.

\- \*\*IDOR Prevention\*\*: Custom `IsOwner` permission classes and `get_object_or_404` checks prevent unauthorized cross-user data manipulation.

\- \*\*Role-Based Access\*\*: Custom User model supporting `SENIOR` and `JUNIOR` roles for task assignment workflows.

### Advanced Frontend Engineering

\- \*\*Zero-Dependency UI\*\*: Premium, responsive design built entirely from scratch with Vanilla CSS (no Bootstrap or Tailwind).

\- \*\*Custom `authFetch` Wrapper\*\*: Centralized API client that automatically injects Bearer tokens and handles `401 Unauthorized` session expirations globally.

\- \*\*Debounced Auto-Save\*\*: Enterprise-grade task notes feature using a JavaScript debouncer. Waits 1 second after typing stops before firing a `POST` request, preventing API spam and database overload.

\- \*\*Dynamic DOM Rendering\*\*: Task cards and UI components are rendered dynamically from JSON payloads with conditional CSS styling based on status and priority.

\### Robust Backend Design

\- \*\*Relational Data\*\*: One-to-Many relationship between `Task` and `Note` models, allowing chronological collaboration feeds.

\- \*\*Optimized Pagination\*\*: Custom `TaskPagination` with a strict `max_page_size` to prevent database abuse.

\- \*\*Nested Serialization\*\*: Efficient data fetching where task details and their associated notes are returned in a single, optimized API response.

---

## Tech Stack

| Layer | Technologies |

| :--- | :--- |

| \*\*Backend\*\* | Python, Django, Django REST Framework, SQLite (Dev) / PostgreSQL (Prod) |

| \*\*Frontend\*\* | Vanilla JavaScript (ES6+), HTML5, CSS3 (Flexbox/Grid) |

| \*\*Authentication\*\* | JSON Web Tokens (JWT), Custom User Model |

| \*\*Tooling\*\* | Git, GitHub, Postman (API Testing) |

---

## Project Structure

\`\`\`text

enterprise\_task\_manager/

├── accounts/ # Custom User model, Auth views, and User listing API

├── tasks/ # Task and Note models, serializers, views, and permissions

├── frontend/ # Static assets (HTML, CSS, JS) served by Django

│ ├── index.html # Authentication page (Login/Signup)

│ ├── dashboard.html # Main application dashboard

│ ├── style.css # Auth page styling

│ ├── dashboard.css # Dashboard styling

│ ├── script.js # Auth page logic

│ └── dashboard.js # Dashboard logic (includes debouncer & authFetch)

├── enterprise\_task\_manager/ # Core Django project settings and root URLs

├── [manage.py](http://manage.py)

└── requirements.txt

---

## Getting Started

Follow these steps to set up the project locally.

### **1\. Clone the Repository**

    bash
    git clone https://github.com/bikrant0/enterprise-task-api-django.git
    cd enterprise-task-api-django

### **2\. Set Up Virtual Environment**

    bash
    # Windows
    python -m venv venv
    venv\Scripts\activate
    
    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

### **3\. Install Dependencies**

    bash
    pip install -r requirements.txt

### **4\. Configure Database & Run Migrations**

    bash
    python manage.py makemigrations
    python manage.py migrate

### **5\. Create a Superuser (Optional, for Admin Panel)**

    bash
    python manage.py createsuperuser

### **6\. Start the Development Server**

    bash
    python manage.py runserver

### **7\. Access the Application**

* **Frontend (Auth)**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

* **Frontend (Dashboard)**: [http://127.0.0.1:8000/dashboard/](http://127.0.0.1:8000/dashboard/)

* **API Root**: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

* **Django Admin**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

# API Endpoints Reference

### Authentication (`/api/accounts/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register/` | Create a new user account | ❌ |
| `POST` | `/login/` | Obtain JWT access & refresh tokens | ❌ |
| `POST` | `/refresh/` | Refresh an expired access token | |
| `GET` | `/users/` | List users (for task assignment dropdown) | ✅ |

#### Tasks (`/api/tasks/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | List all tasks (filtered by logged-in user) | ✅ |
| `POST` | `/` | Create a new task | ✅ |
| `GET` | `/<pk>/` | Retrieve specific task details | ✅ |
| `PATCH` | `/<pk>/` | Partially update a task (e.g., change status) | ✅ |
| `DELETE` | `/<pk>/` | Delete a task | ✅ |

#### Notes (`/api/tasks/<task_id>/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/notes/` | List all notes/comments for a specific task | ✅ |
| `POST` | `/notes/` | Create a new note (used by debounced auto-save) | ✅ |

---

## **Future Roadmap**

* **Cloud Deployment**: Deploy backend to [Render.com](http://Render.com)  and frontend to Vercel/Netlify.

* **Real-Time Updates**: Implement Django Channels (WebSockets) for live task assignment notifications.

* **Advanced Filtering**: Add frontend filtering by assignee, priority, and status.

* **Dark Mode**: Implement a CSS variable-based theme toggle.

---

## **License**

This project is open-source and available under the MIT License.

---

## **Author**

**Bikrant**
