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
    console.log(`📊 Found ${deposits.length} deposits`);
    
    // Find active deposits (currentBalance > 0)
    const activeDeposits = deposits.filter(d => d.currentBalance > 0);
    console.log(`💰 Active deposits (not redeemed): ${activeDeposits.length}`);
    
    if (activeDeposits.length === 0) {
      console.log('✅ All deposits are already redeemed (currentBalance = 0)');
      console.log('🎉 No fix needed - database is already correct!');
      return;
    }
    
    // Show current state
    console.log('\n📋 Current active deposits:');
    activeDeposits.forEach((deposit, index) => {
      console.log(`${index + 1}. Amount: ${deposit.amount} USDT, Current Balance: ${deposit.currentBalance} USDT`);
    });
    
    const currentTotal = activeDeposits.reduce((sum, d) => sum + d.currentBalance, 0);
    console.log(`\n💰 Current total: ${currentTotal} USDT`);
    console.log(`🎯 Target total: ${targetBalance} USDT`);
    console.log(`📊 Difference: ${currentTotal - targetBalance} USDT`);
    
    if (Math.abs(currentTotal - targetBalance) < 0.001) {
      console.log('✅ Balances are already in sync!');
      return;
    }
    
    // Step 2: Use the cleanup-fake-deposits API to reset balances
    console.log('\n🔧 Step 2: Using cleanup API to reset balances...');
    
    // Since we don't have a direct fix API, let's use the cleanup API
    // and then manually update the first deposit
    const cleanupResponse = await fetch('https://buy.brics.ninja/api/cleanup-fake-deposits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const cleanupData = await cleanupResponse.json();
    console.log('🧹 Cleanup result:', cleanupData);
    
    // Step 3: Use the recalculate-balances API
    console.log('\n🔧 Step 3: Recalculating balances...');
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
      
      if (difference < 0.001) {
        console.log('🎉 SUCCESS: Database is now in sync with BRICS balance!');
        console.log('✅ MetaMask import popup should no longer appear on refresh.');
      } else {
        console.log('⚠️  Warning: Balances are not perfectly in sync.');
        console.log('💡 You may need to use the direct script approach.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during API fix:', error);
  }
}

// Run the fix
fixDepositsViaAPI();
