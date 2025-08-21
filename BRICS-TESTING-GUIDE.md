# 🔧 BRICS Wallet Flow Testing Guide

## 🎯 Overview
This guide provides comprehensive testing instructions for the BRICS Protocol wallet integration flow on the Vercel staging deployment.

## 🌐 Staging URL
**Primary Testing URL**: https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/

## 🔍 Required Environment Variables
Ensure these environment variables are set in Vercel:

```bash
VITE_TREASURY_ETHEREUM=0xe4f1c79c47fa2de285cd8fb6f6476495bd08538f
VITE_TREASURY_BASE=0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0
VITE_TREASURY_OPTIMISM=0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0
VITE_TREASURY_ARBITRUM=0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0
```

## 🧪 Test Scenarios

### 1. **Basic BRICS Flow Test**
**URL**: `https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/?action=connect_wallet&amount=100&user=0x1234567890123456789012345678901234567890&hash=abc123&chain=base`

**Expected Behavior**:
- ✅ Page loads without errors
- ✅ MetaMask connection is triggered
- ✅ Chain switches to Base (8453)
- ✅ USDT balance is checked
- ✅ Deposit amount is set to 100 USDT
- ✅ Treasury address is correctly resolved

### 2. **Chain Parameter Tests**
Test different chain parameters:

- **Base**: `&chain=base` → Chain ID 8453
- **Ethereum**: `&chain=ethereum` → Chain ID 1
- **Optimism**: `&chain=optimism` → Chain ID 10
- **Arbitrum**: `&chain=arbitrum` → Chain ID 42161
- **Sepolia**: `&chain=sepolia` → Chain ID 11155111
- **No chain**: (defaults to Base)

### 3. **Invalid URL Test**
**URL**: `https://your-app.vercel.app/?action=connect_wallet&amount=100&user=0x123&hash=abc&chain=base`

**Expected Behavior**:
- ❌ Flow should be blocked
- ❌ Error message: "Invalid application URL. Please use the correct staging or production URL."

### 4. **Insufficient Balance Test**
**URL**: `https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/?action=connect_wallet&amount=999999&user=0x123&hash=abc&chain=base`

**Expected Behavior**:
- ✅ MetaMask connects
- ✅ Chain switches to Base
- ❌ Error message: "Insufficient USDT balance. You have X USDT, need 999999 USDT on Base."

## 🔍 Console Logs to Monitor

### Required Logs (All Must Appear):
```javascript
�� BRICS Integration useEffect triggered
🔧 BRICS Flow Test - Starting comprehensive validation...
🔧 BRICS Integration - URL Parameters: { action, amount, user, hash, chain }
🔧 BRICS Integration - Environment: { mode, dev, isDevelopment }
🔧 BRICS Integration - URL Validation: { currentHostname, isStagingUrl, isLocalhost, isProduction }
🔧 switchToChain: Attempting to switch to chain ...
🔧 BRICS Integration - Checking USDT balance before deposit
🔧 Balance validation: { selectedChain, currentBalance, depositAmount, hasSufficientBalance, treasuryAddress }
🔧 Deposit completed successfully: { amount, chainId, treasuryAddress, txHash }
```

## 🛠️ Manual Testing Steps

### Step 1: Open Browser Console
1. Navigate to the staging URL
2. Open Developer Tools (F12)
3. Go to Console tab
4. Clear console logs

### Step 2: Test BRICS Flow
1. Add BRICS parameters to URL
2. Refresh page
3. Monitor console logs
4. Verify MetaMask connection
5. Check chain switching
6. Validate balance checks
7. Confirm deposit flow

### Step 3: Validate Results
1. Check all required logs appear
2. Verify treasury addresses are correct
3. Confirm chain switching works
4. Test balance validation
5. Validate error handling

## 🚨 Common Issues & Solutions

### Issue 1: Environment Variables Not Set
**Symptoms**: Treasury addresses show fallback values
**Solution**: Set VITE_TREASURY_* variables in Vercel

### Issue 2: MetaMask Not Detected
**Symptoms**: "MetaMask not detected" error
**Solution**: Install MetaMask extension

### Issue 3: Wrong Chain
**Symptoms**: "Please switch to Base network" error
**Solution**: Add Base network to MetaMask or approve chain switch

### Issue 4: Insufficient Balance
**Symptoms**: "Insufficient USDT balance" error
**Solution**: Add USDT to wallet on target chain

## �� Test Results Template

```markdown
## Test Results - [Date]

### Environment
- ✅ Staging URL: https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/
- ✅ Environment Variables: All set
- ✅ MetaMask: Connected
- ✅ Base Network: Available

### Test Cases
1. ✅ Basic BRICS Flow
2. ✅ Chain Parameter Tests
3. ✅ Invalid URL Blocking
4. ✅ Insufficient Balance Handling

### Console Logs
- ✅ All required logs present
- ✅ Environment variables correct
- ✅ Treasury addresses resolved
- ✅ Chain switching functional

### Status
- ✅ PASS / ❌ FAIL
```

## 🔗 Quick Test URLs

### Valid Test URLs:
```
https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/?action=connect_wallet&amount=50&user=0x1234567890123456789012345678901234567890&hash=test123&chain=base

https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/?action=connect_wallet&amount=25&user=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd&hash=dev456&chain=ethereum

https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/?action=connect_wallet&amount=75&user=0x9876543210987654321098765432109876543210&hash=staging789&chain=optimism
```

## 🎯 Success Criteria

The BRICS wallet flow is considered successful when:

1. ✅ **URL Validation**: Only staging/production URLs work
2. ✅ **Parameter Parsing**: All URL parameters are correctly parsed
3. ✅ **MetaMask Integration**: Wallet connects automatically
4. ✅ **Chain Switching**: Automatically switches to target chain
5. ✅ **Balance Validation**: Checks USDT balance before deposit
6. ✅ **Treasury Resolution**: Uses correct treasury address for chain
7. ✅ **Error Handling**: Graceful error messages for all failure cases
8. ✅ **Logging**: Comprehensive console logging for debugging
9. ✅ **Environment Detection**: Correctly identifies development/staging/production
10. ✅ **HMAC Validation**: Bypasses in development, validates in production
