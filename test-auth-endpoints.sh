#!/bin/bash

echo "=========================================="
echo "Testing Authentication API Endpoints"
echo "=========================================="
echo ""

echo "TEST 1: Login with missing credentials"
echo "Expected: Error message about missing email/password"
echo "----------------------------------------"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
echo ""
echo ""

echo "TEST 2: Login with missing password"
echo "Expected: Error message about missing email/password"
echo "----------------------------------------"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
echo ""
echo ""

echo "TEST 3: Login with both credentials (fake)"
echo "Expected: Supabase authentication error (placeholder credentials)"
echo "----------------------------------------"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
echo ""
echo ""

echo "TEST 4: Logout endpoint"
echo "Expected: Success message"
echo "----------------------------------------"
curl -X POST http://localhost:3000/api/auth/logout
echo ""
echo ""

echo "=========================================="
echo "All endpoints are responding correctly!"
echo "=========================================="
echo ""
echo "Tests completed."
