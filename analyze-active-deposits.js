// Analyze active deposits to understand the balance mismatch
const userAddress = '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1';

async function analyzeActiveDeposits() {
  try {
    console.log('🔍 Analyzing active deposits...');
    console.log(`📝 User address: ${userAddress}`);
    
    // Get current deposits
    const depositsResponse = await fetch(`https://buy.brics.ninja/api/deposits/${userAddress}`);
    const depositsData = await depositsResponse.json();
    
    if (!depositsData.success) {
      console.log('❌ Failed to get deposits:', depositsData.message);
      return;
    }
    
    const deposits = depositsData.deposits;
    console.log(`📊 Total deposits found: ${deposits.length}`);
    
    // Find active deposits (currentBalance > 0)
    const activeDeposits = deposits.filter(d => d.currentBalance > 0);
    console.log(`💰 Active deposits (currentBalance > 0): ${activeDeposits.length}`);
    
    if (activeDeposits.length === 0) {
      console.log('✅ No active deposits found - all deposits are redeemed');
      return;
    }
    
    // Show active deposits
    console.log('\n📋 Active Deposits:');
    activeDeposits.forEach((deposit, index) => {
      console.log(`${index + 1}. Amount: ${deposit.amount} USDT, Current Balance: ${deposit.currentBalance} USDT`);
      console.log(`   TX Hash: ${deposit.txHash}`);
      console.log(`   Date: ${new Date(deposit.timestamp).toLocaleString()}`);
      console.log('');
    });
    
    // Calculate totals
    const totalDeposited = activeDeposits.reduce((sum, d) => sum + d.amount, 0);
    const totalCurrentBalance = activeDeposits.reduce((sum, d) => sum + d.currentBalance, 0);
    
    console.log('📊 Summary:');
    console.log(`💰 Total deposited amount: ${totalDeposited} USDT`);
    console.log(`💳 Total current balance: ${totalCurrentBalance} USDT`);
    console.log(`📉 Difference (redeemed): ${totalDeposited - totalCurrentBalance} USDT`);
    
    // Check what the BRICS balance should be
    console.log('\n🎯 BRICS Balance Analysis:');
    console.log(`📊 Current active balance: ${totalCurrentBalance} USDT`);
    console.log(`🪙 Expected BRICS balance: ${totalCurrentBalance} BRICS (1:1 ratio)`);
    console.log(`⚠️  If BRICS balance is 0.01, there's a mismatch of ${totalCurrentBalance - 0.01} USDT`);
    
    // Show the fix needed
    if (Math.abs(totalCurrentBalance - 0.01) > 0.001) {
      console.log('\n🔧 Fix Required:');
      console.log(`🎯 Target balance: 0.01 USDT`);
      console.log(`📊 Current total: ${totalCurrentBalance} USDT`);
      console.log(`📉 Need to reduce by: ${totalCurrentBalance - 0.01} USDT`);
      
      // Suggest which deposits to adjust
      console.log('\n💡 Suggested Fix:');
      console.log('1. Set the first active deposit to 0.01 USDT');
      console.log('2. Set all other active deposits to 0 USDT');
      console.log('3. This will match the BRICS balance of 0.01');
      
      // Show which deposits would be affected
      console.log('\n📝 Deposits to be modified:');
      activeDeposits.forEach((deposit, index) => {
        const newBalance = index === 0 ? 0.01 : 0;
        console.log(`${index + 1}. ${deposit.txHash.substring(0, 10)}... → ${deposit.currentBalance} → ${newBalance} USDT`);
      });
    } else {
      console.log('\n✅ No fix needed - balances are already in sync!');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing deposits:', error);
  }
}

// Run the analysis
analyzeActiveDeposits();
