# 🏫 TU Student Support Portal (TU-SSP)

This project is a centralized university portal built for managing **student dues** across departments and hostels at **Telangana University**. It is intended for internal use by administrators, with a focus on scalability, security, and simplicity.

---

## 🧠 Tech Stack

- **Backend**: Django 5.0.2 + Django REST Framework
- **Database**: PostgreSQL
- **Frontend**: React + ShadCN + Tailwind CSS _(coming soon)_

---

## 🗂️ Project Structure

```
tu-ssp/
├── backend/          # Django backend (Dues Management)
├── frontend/         # React + ShadCN UI (Upcoming)
├── README.md
```

---

## ⚙️ Prerequisites

### For Both Windows and macOS:

- Python 3.10 or higher
- Git
- PostgreSQL 12 or higher
- pip (Python package manager)

### Additional for Windows:

- [Git for Windows](https://gitforwindows.org/)
- [PostgreSQL for Windows](https://www.postgresql.org/download/windows/)
- [Python for Windows](https://www.python.org/downloads/windows/)

### Additional for macOS:

- [Homebrew](https://brew.sh/) (recommended for package management)
- Xcode Command Line Tools (install via `xcode-select --install`)

---

## 🚀 Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/infinitethoughts7/tu-ssp.git
cd tu-ssp
```

### 2. Database Setup

#### Windows:

1. Install PostgreSQL from [official website](https://www.postgresql.org/download/windows/)
2. During installation, note down the password you set for the postgres user
3. Open pgAdmin 4 (installed with PostgreSQL)
4. Create a new database named `tussp_db`

#### macOS:

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb tussp_db
```

### 3. Backend Setup

#### Windows:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
```

#### macOS:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

### 4. Environment Configuration

Edit the `.env` file in the backend directory with your database credentials:

```env
DB_NAME=tussp_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### 5. Database Migrations

```bash
# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### 6. Run the Development Server

```bash
# Start the development server
python manage.py runserver
```

The server will start at `http://127.0.0.1:8000/`

---

## 🔧 Troubleshooting

### Common Issues

1. **PostgreSQL Connection Error**

   - Ensure PostgreSQL service is running
   - Verify database credentials in `.env` file
   - Check if the database exists

2. **Python Virtual Environment Issues**

   - Make sure you're using Python 3.10 or higher
   - Try recreating the virtual environment
   - Ensure you've activated the virtual environment

3. **Dependencies Installation Issues**
   - Try upgrading pip: `pip install --upgrade pip`
   - For Windows, you might need Microsoft Visual C++ Build Tools
   - For macOS, ensure Xcode Command Line Tools are installed

### Getting Help

If you encounter any issues not covered here:

1. Check the Django documentation: [https://docs.djangoproject.com/](https://docs.djangoproject.com/)
2. Open an issue on the GitHub repository
3. Contact the development team

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

