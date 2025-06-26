#!/bin/bash
set -e

# Navigate to the admin dashboard directory
cd "$(dirname "$0")"

# Ensure .env.production exists with correct values
if [ ! -f .env.production ]; then
  echo "REACT_APP_API_URL=https://globeflight.co.ke/api" > .env.production
  echo "REACT_APP_TINYMCE_API_KEY=n6nmqtos4c4w9toulzor0y8qgkfd5e9lvyxvlrr5u66dczfr" >> .env.production
  echo ".env.production created with default values."
else
  echo ".env.production already exists."
fi

echo "Installing dependencies..."
npm install

echo "Building admin dashboard for production..."
npm run build

echo "Zipping build output..."
cd build
zip -r ../admin-dashboard-build.zip ./*
cd ..

echo "Build and packaging complete. Upload admin-dashboard-build.zip to your cPanel admin directory." 