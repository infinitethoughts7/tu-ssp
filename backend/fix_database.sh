#!/bin/bash

echo "🔧 Fixing database schema on EC2..."

# Activate virtual environment
source venv/bin/activate

# Set production settings
export DJANGO_SETTINGS_MODULE=ssp.settings_production

echo "📋 Checking migration status..."
python manage.py showmigrations

echo "🔄 Running pending migrations..."
python manage.py migrate

echo "✅ Database schema should now be fixed!"
echo "🔍 You can verify by checking the migration status again:"
echo "python manage.py showmigrations" 