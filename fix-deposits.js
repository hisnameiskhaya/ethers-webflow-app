// Script to fix deposits to match current BRICS balance
const userAddress = '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1';
const targetBRICSBalance = 0.01; // Your current BRICS balance

async function fixDeposits() {
  try {
    console.log('🔧 Fixing deposits to match BRICS balance...');
    console.log(`📝 User address: ${userAddress}`);
    console.log(`🎯 Target BRICS balance: ${targetBRICSBalance} BRICS`);
    
    // Get current deposits
    const response = await fetch(`https://buy.brics.ninja/api/deposits/${userAddress}`);
    const data = await response.json();
    
    if (!data.success) {
      console.log('❌ Failed to get deposits:', data.message);
      return;
    }
    
    const deposits = data.deposits;
    console.log(`📊 Found ${deposits.length} deposits`);
    
    // Find deposits that still have balance (not redeemed)
    const activeDeposits = deposits.filter(d => d.currentBalance > 0);
    console.log(`💰 Active deposits (not redeemed): ${activeDeposits.length}`);
    
    if (activeDeposits.length === 0) {
      console.log('✅ All deposits are already redeemed (currentBalance = 0)');
      console.log('🎉 No fix needed - database is already correct!');
      return;
    }
    
    // Show current active deposits
    console.log('\n📋 Current active deposits:');
    activeDeposits.forEach((deposit, index) => {
      console.log(`${index + 1}. Amount: ${deposit.amount} USDT, Current Balance: ${deposit.currentBalance} USDT`);
    });
    
    const totalActiveBalance = activeDeposits.reduce((sum, d) => sum + d.currentBalance, 0);
    console.log(`\n💰 Total active balance: ${totalActiveBalance} USDT`);
    console.log(`🪙 Target BRICS balance: ${targetBRICSBalance} BRICS`);
    console.log(`📊 Difference: ${totalActiveBalance - targetBRICSBalance} USDT`);
    
    // Create a simple fix by setting the first active deposit to the target balance
    // and setting all others to 0
    console.log('\n🔧 Applying fix...');
    
    const fixData = {
      userAddress: userAddress,
      targetBalance: targetBRICSBalance,
      deposits: activeDeposits.map((deposit, index) => ({
        id: deposit._id,
        newBalance: index === 0 ? targetBRICSBalance : 0
      }))
    };
    
    console.log('📤 Sending fix request...');
    console.log('⚠️  This will set the first deposit to 0.01 and all others to 0');
    
    // For now, let's just show what would be done
    console.log('\n🎯 Proposed changes:');
    activeDeposits.forEach((deposit, index) => {
      const newBalance = index === 0 ? targetBRICSBalance : 0;
      console.log(`   Deposit ${index + 1}: ${deposit.currentBalance} → ${newBalance} USDT`);
    });
    
    console.log('\n✅ Fix plan ready!');
    console.log('📝 To apply this fix, you would need to:');
    console.log('   1. Update the first active deposit to 0.01 USDT');
    console.log('   2. Set all other active deposits to 0 USDT');
    console.log('   3. This would make total deposits = 0.01 USDT = BRICS balance');
    
  } catch (error) {
    console.error('❌ Error fixing deposits:', error);
  }
}

// Run the fix
fixDeposits();
