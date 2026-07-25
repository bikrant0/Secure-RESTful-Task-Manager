# Enterprise Task Manager

A full-stack task management application built with Django REST Framework and vanilla JavaScript. Built as a hands-on learning project to understand backend architecture, JWT authentication, and REST API design from the ground up.

---

## Features

**Authentication**
- Email-based registration and login (custom Django user model)
- JWT authentication via `djangorestframework-simplejwt`
- Access/refresh token pair issued on login, stored client-side

**Task Management**
- Create, view, update, and delete tasks
- Each task has a title, description, status (`To Do` / `In Progress` / `Done`), priority (`Low` / `Medium` / `High`), and an optional due date
- Tasks are private to the user who created them — enforced at the API level, not just hidden in the UI
- Notes can be attached to individual tasks

**Frontend**
- Single-page login/signup flow with real-time validation
- Task dashboard with create, status-cycling, and delete actions
- No mock or placeholder data — every visible action calls a real API endpoint

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django, Django REST Framework |
| Auth | `djangorestframework-simplejwt` (JWT) |
| Database | SQLite (local), PostgreSQL (production, via `dj-database-url`) |
| Frontend | HTML, CSS, vanilla JavaScript (`fetch` API, no framework) |
| Version control | Git / GitHub |

---

## API Endpoints

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/auth/register/` | Create a new account | No |
| POST | `/api/auth/login/` | Log in, returns access/refresh tokens | No |
| POST | `/api/auth/refresh/` | Exchange a refresh token for a new access token | No |
| GET | `/api/tasks/` | List the logged-in user's tasks (paginated, searchable) | Yes |
| POST | `/api/tasks/` | Create a new task | Yes |
| GET | `/api/tasks/<id>/` | Retrieve a single task | Yes |
| PATCH / PUT | `/api/tasks/<id>/` | Update a task | Yes |
| DELETE | `/api/tasks/<id>/` | Delete a task | Yes |
| POST | `/api/tasks/<task_id>/notes/` | Add a note to a task | Yes |

All authenticated endpoints require an `Authorization: Bearer <access_token>` header.

---

## Project Structure

```
enterprise_task_manager/
├── accounts/           # Custom user model, registration, auth serializers
├── tasks/               # Task & Note models, views, permissions
├── core/                 # Project settings, root URL configuration
├── frontend/             # Static HTML/CSS/JS (login, signup, dashboard)
├── requirements.txt
└── manage.py
```

---

## Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/bikrant0/enterprise-task-api-django.git
cd enterprise-task-api-django
```

**2. Set up a virtual environment**
```bash
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Configure environment variables**

Create a `.env` file in the project root (never committed — see `.gitignore`):
```
SECRET_KEY=your-secret-key-here
DEBUG=True
```
`DATABASE_URL` is optional locally — the project falls back to SQLite automatically if it's not set.

**5. Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

**6. Start the development server**
```bash
python manage.py runserver
```

**7. Open the app**

Visit `http://127.0.0.1:8000/` in your browser.

---

## What I Learned

This project was built as a deliberate learning exercise, not a copy-paste tutorial. Some of the concepts worked through along the way:

- Django's authentication internals — customizing `AUTH_USER_MODEL`, writing a custom `UserManager` to support email-based login
- The difference between DRF's authentication and permission phases, and how that affects `401` vs `403` responses
- JWT access/refresh token design and why short-lived access tokens matter
- Migration consistency issues and how to recover from them safely
- Debugging real JavaScript issues: variable scope, async/await, and how a single missing brace or comma can silently break unrelated code
- A subtle DOM bug where a hidden parent element hides all its children regardless of their own CSS class
- Git hygiene: handling an accidentally committed credential, and properly untracking files that shouldn't be version-controlled

---

## License

This project is open source and available under the MIT License.