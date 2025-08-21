#!/bin/bash

# 🔧 Test API Script for ethers-webflow-app
# This script tests the deposit API endpoints

echo "🔧 Testing ethers-webflow-app API endpoints..."

# Base URL - update this for your environment
BASE_URL="https://buybrics.vercel.app"
# For staging: BASE_URL="https://staging-fixes-buybrics.vercel.app"
# For local: BASE_URL="http://localhost:4000"

echo "🔧 Using base URL: $BASE_URL"

# Test 1: Health check
echo ""
echo "🔧 Test 1: Health check"
curl -X GET "$BASE_URL/api/health" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n"

# Test 2: Get deposits for a test wallet
echo ""
echo "🔧 Test 2: Get deposits for test wallet"
TEST_WALLET="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
curl -X GET "$BASE_URL/api/deposits/$TEST_WALLET" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n"

# Test 3: Create a test deposit (this will fail validation but test the endpoint)
echo ""
echo "🔧 Test 3: Test deposit endpoint (should fail validation)"
curl -X POST "$BASE_URL/api/deposits" \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "amount": 100.5,
    "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "chainId": 8453
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n"

# Test 4: Test with invalid data (should show validation errors)
echo ""
echo "🔧 Test 4: Test with invalid data (validation test)"
curl -X POST "$BASE_URL/api/deposits" \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "",
    "amount": -1,
    "txHash": "",
    "chainId": "invalid"
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n"

echo ""
echo "🔧 API tests completed!"
echo "🔧 Check the responses above for any errors."
echo "🔧 Look for '🔧' prefixed logs in your backend console."
