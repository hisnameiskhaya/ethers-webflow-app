# Database Fix Instructions

## Problem
The MetaMask import popup appears on every page refresh because the database shows 0.1 USDT in deposits but your BRICS balance is only 0.01 BRICS tokens.

## Solution
Run the simple fix script to sync the database with your actual BRICS balance.

## Quick Fix

### Option 1: Run the Simple Fix Script (Recommended)

1. **On the production server**, run:
```bash
node simple-fix.js
```

This script will:
- Connect to the production MongoDB
- Find your deposits (address: 0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1)
- Set the first active deposit to 0.01 USDT
- Set all other active deposits to 0 USDT
- Verify the fix

### Option 2: Use the Production Script

If you prefer the more detailed version:
```bash
node production-fix.js
```

### Option 3: Wait for API Endpoint

The API endpoint should be available soon at:
```
POST https://buy.brics.ninja/api/fix-deposits
```

## Expected Result

After running the fix:
- **Total deposits:** 0.01 USDT
- **BRICS balance:** 0.01 BRICS
- **MetaMask popup:** No longer appears on refresh
- **Smart import logic:** Works correctly

## Files Created

- `simple-fix.js` - Simple script to fix the database
- `production-fix.js` - Detailed script with more logging
- `api/fix-deposits.js` - API endpoint (deployed but not yet available)
- `call-fix-deposits.js` - Script to call the API endpoint

## Current Status

- **Active deposits:** 0.09999999999999996 USDT (10 deposits)
- **Your BRICS balance:** 0.01 BRICS
- **Problem:** Database thinks you're missing 0.09 USDT worth of BRICS

## Verification

After running the fix, you can verify it worked by:
1. Refreshing https://buy.brics.ninja
2. The MetaMask import popup should no longer appear
3. The smart import logic should work correctly
