# TU SSP Frontend

This is the frontend application for the TU SSP (Student Services Portal) system.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# or use the convenience script
./dev.sh
```

### Production Build

```bash
# Build for production
npm run build:prod
```

## 📁 Environment Configuration

- `.env.development` - Uses `http://localhost:8000/api` (for local development)
- `.env.production` - Uses `http://51.21.200.136/api` (for production)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for development
- `npm run build:prod` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

The application is automatically deployed via GitHub Actions when you push to the main branch. The CI/CD pipeline:

1. Builds the frontend with production environment
2. Deploys to EC2 server
3. Restarts backend services
4. Runs health checks

## 📝 Notes

- The frontend automatically handles token refresh
- Authentication is managed through JWT tokens
- API calls are automatically retried on token expiration
