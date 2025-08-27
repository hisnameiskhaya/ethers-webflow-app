// Fix deposits using the working API endpoints
const userAddress = '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1';
const targetBalance = 0.01;

async function fixDepositsViaAPI() {
  try {
    console.log('🔧 Fixing deposits via API...');
    console.log(`📝 User address: ${userAddress}`);
    console.log(`🎯 Target balance: ${targetBalance} USDT`);
    
    // Step 1: Get current deposits
    console.log('\n📊 Step 1: Getting current deposits...');
    const depositsResponse = await fetch(`https://buy.brics.ninja/api/deposits/${userAddress}`);
    const depositsData = await depositsResponse.json();
    
    if (!depositsData.success) {
      console.log('❌ Failed to get deposits:', depositsData.message);
      return;
    }
    
    const deposits = depositsData.deposits;
    console.log(`📊 Found ${deposits.length} total deposits`);
    
    // Find active deposits (currentBalance > 0)
    const activeDeposits = deposits.filter(d => d.currentBalance > 0);
    console.log(`💰 Active deposits (currentBalance > 0): ${activeDeposits.length}`);
    
    if (activeDeposits.length === 0) {
      console.log('✅ All deposits are already redeemed (currentBalance = 0)');
      console.log('🎉 No fix needed - database is already correct!');
      return;
    }
    
    // Show current state
    console.log('\n📋 Current active deposits:');
    activeDeposits.forEach((deposit, index) => {
      console.log(`${index + 1}. Amount: ${deposit.amount} USDT, Current Balance: ${deposit.currentBalance} USDT`);
      console.log(`   TX Hash: ${deposit.txHash}`);
    });
    
    const currentTotal = activeDeposits.reduce((sum, d) => sum + d.currentBalance, 0);
    console.log(`\n💰 Current total: ${currentTotal} USDT`);
    console.log(`🎯 Target total: ${targetBalance} USDT`);
    console.log(`📊 Difference: ${currentTotal - targetBalance} USDT`);
    
    if (Math.abs(currentTotal - targetBalance) < 0.001) {
      console.log('✅ Balances are already in sync!');
      return;
    }
    
    // Step 2: Use the existing cleanup APIs to reset balances
    console.log('\n🔧 Step 2: Using cleanup APIs to reset balances...');
    
    // Try the cleanup-fake-deposits API
    console.log('🧹 Trying cleanup-fake-deposits API...');
    try {
      const cleanupResponse = await fetch('https://buy.brics.ninja/api/cleanup-fake-deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const cleanupData = await cleanupResponse.json();
      console.log('🧹 Cleanup result:', cleanupData);
    } catch (error) {
      console.log('⚠️  Cleanup API failed:', error.message);
    }
    
    // Try the recalculate-balances API
    console.log('\n📊 Trying recalculate-balances API...');
    try {
      const recalcResponse = await fetch('https://buy.brics.ninja/api/recalculate-balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: userAddress
        })
      });
      
      const recalcData = await recalcResponse.json();
      console.log('📊 Recalculation result:', recalcData);
    } catch (error) {
      console.log('⚠️  Recalculation API failed:', error.message);
    }
    
    // Step 3: Try to use the fix-deposits API if it exists
    console.log('\n🔧 Step 3: Trying fix-deposits API...');
    try {
      const fixResponse = await fetch('https://buy.brics.ninja/api/fix-deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: userAddress,
          targetBalance: targetBalance
        })
      });
      
      const fixData = await fixResponse.json();
      console.log('🔧 Fix result:', fixData);
    } catch (error) {
      console.log('⚠️  Fix API failed:', error.message);
    }
    
    // Step 4: Verify the fix
    console.log('\n🔍 Step 4: Verifying the fix...');
    const verifyResponse = await fetch(`https://buy.brics.ninja/api/deposits/${userAddress}`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      const updatedDeposits = verifyData.deposits;
      const updatedActiveDeposits = updatedDeposits.filter(d => d.currentBalance > 0);
      const newTotal = updatedActiveDeposits.reduce((sum, d) => sum + d.currentBalance, 0);
      const difference = Math.abs(newTotal - targetBalance);
      
      console.log(`\n✅ Fix verification:`);
      console.log(`💰 New total: ${newTotal} USDT`);
      console.log(`🎯 Target: ${targetBalance} USDT`);
      console.log(`📊 Difference: ${difference} USDT`);
      console.log(`📋 Active deposits: ${updatedActiveDeposits.length}`);
      
      if (difference < 0.001) {
        console.log('🎉 SUCCESS: Database is now in sync with BRICS balance!');
        console.log('✅ MetaMask import popup should no longer appear on refresh.');
      } else {
        console.log('⚠️  Warning: Balances are not perfectly in sync.');
        console.log('💡 You may need to use the direct script approach.');
        console.log('\n📝 Manual fix needed:');
        console.log('1. Set the first active deposit to 0.01 USDT');
        console.log('2. Set all other active deposits to 0 USDT');
        console.log('3. This will match the BRICS balance of 0.01');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during API fix:', error);
  }
}

// Run the fix
fixDepositsViaAPI();
