# 🏫 TU Student Support Portal (TU-SSP)

This project is a centralized university portal built for managing **student dues** across departments and hostels at **Telangana University**. It is intended for internal use by administrators, with a focus on scalability, security, and simplicity.

---

## 🧠 Tech Stack

- **Backend**: Django (LTS) + Django REST Framework (DRF)
- **Database**: PostgreSQL
- **Frontend**: React + ShadCN + Tailwind CSS *(coming soon)*

---

## 🗂️ Project Structure

tu-ssp/ ├── backend/ # Django backend (Dues Management) ├── frontend/ # React + ShadCN UI (Upcoming) ├── README.md
---

## ⚙️ Backend Setup (Django)

### ✅ Prerequisites

- Python 3.10+
- PostgreSQL installed and running
- Git

### 🚀 Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/infinitethoughts7/tu-ssp.git
cd tu-ssp/backend

# 2. Create & activate virtual environment
python -m venv .tu-venv
source .tu-venv/bin/activate         # For Linux/macOS
# OR
.tu-venv\Scripts\activate            # For Windows

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Create your local .env file from template
cp .env.example .env
# Then update the .env file with your DB credentials and secret key

# 5. Apply migrations
python manage.py migrate

# 6. Run the development server
python manage.py runserver

