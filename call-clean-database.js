// Script to call the database cleanup API
const userAddress = '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1';

async function cleanDatabase() {
  try {
    console.log('🧹 Calling database cleanup API...');
    console.log(`📝 User address: ${userAddress}`);
    
    const response = await fetch('https://buy.brics.ninja/api/clean-database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress: userAddress
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Database cleanup successful!');
      console.log('📊 Results:');
      console.log(`   Old total: ${result.data.oldTotal} USDT`);
      console.log(`   New total: ${result.data.newTotal} USDT`);
      console.log(`   BRICS balance: ${result.data.bricsBalance} BRICS`);
      console.log(`   Difference: ${result.data.difference} USDT`);
      console.log(`   Deposits updated: ${result.data.depositsUpdated}`);
    } else {
      console.log('❌ Database cleanup failed:');
      console.log(`   Error: ${result.message}`);
      if (result.error) {
        console.log(`   Details: ${result.error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error calling cleanup API:', error);
  }
}

// Run the cleanup
cleanDatabase();
