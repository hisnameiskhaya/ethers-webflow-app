// Script to call the fix-deposits API
const userAddress = '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1';
const targetBalance = 0.01; // Your current BRICS balance

async function fixDeposits() {
  try {
    console.log('🔧 Calling fix-deposits API...');
    console.log(`📝 User address: ${userAddress}`);
    console.log(`🎯 Target balance: ${targetBalance} USDT`);
    
    const response = await fetch('https://buy.brics.ninja/api/fix-deposits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress: userAddress,
        targetBalance: targetBalance
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Deposits fixed successfully!');
      console.log('📊 Results:');
      console.log(`   Old total: ${result.data.oldTotal} USDT`);
      console.log(`   New total: ${result.data.newTotal} USDT`);
      console.log(`   Target balance: ${result.data.targetBalance} USDT`);
      console.log(`   Difference: ${result.data.difference} USDT`);
      console.log(`   Deposits updated: ${result.data.depositsUpdated}`);
      
      if (result.data.changes && result.data.changes.length > 0) {
        console.log('\n📋 Changes made:');
        result.data.changes.forEach((change, index) => {
          console.log(`   ${index + 1}. ${change.oldBalance} → ${change.newBalance} USDT`);
        });
      }
      
      console.log('\n🎉 Database is now in sync with your BRICS balance!');
      console.log('✅ MetaMask import popup should no longer appear on refresh.');
      
    } else {
      console.log('❌ Failed to fix deposits:');
      console.log(`   Error: ${result.message}`);
      if (result.error) {
        console.log(`   Details: ${result.error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error calling fix API:', error);
  }
}

// Run the fix
fixDeposits();
