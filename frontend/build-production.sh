#!/bin/bash

# Build script for production

echo "Building frontend for production..."

# Install dependencies
npm install

# Build for production
npm run build

echo "Build completed! Files are in the 'dist' directory."
echo "You can serve these files using:"
echo "npx serve -s dist -l 3000"
echo "or deploy to your web server." 