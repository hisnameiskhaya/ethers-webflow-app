// Emergency fix script - directly connect to production database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const userAddress = '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1';
const targetBalance = 0.01;

async function emergencyFix() {
  try {
    console.log('🚨 EMERGENCY FIX: Direct database connection');
    console.log(`📝 User address: ${userAddress}`);
    console.log(`🎯 Target balance: ${targetBalance} USDT`);
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Define schema
    const depositSchema = new mongoose.Schema({
      date: { type: Date, required: true, index: true },
      userAddress: { type: String, required: true, lowercase: true, index: true },
      amount: { type: Number, required: true, min: 0 },
      currentBalance: { type: Number, required: true, min: 0, default: 0 },
      tokenType: { type: String, enum: ['USDT', 'MockUSDT'], default: 'USDT' },
      txHash: { type: String, required: true, unique: true },
      chainId: { type: Number, required: true, index: true },
      maturityDate: { type: Date, default: null },
      accumulatedYield: { type: Number, required: true, min: 0, default: 0 },
      dailyYield: { type: Number, required: true, min: 0, default: 0 },
      dailyYieldPercent: { type: Number, default: 0.5, min: 0 },
      yieldGoalMet: { type: Boolean, default: false },
      timestamp: { type: Date, default: Date.now, index: true },
      lastGoalMet: { type: Date, default: null },
      isTestData: { type: Boolean, default: false },
      lastRedeemedAt: { type: Date, default: null },
      lastRedeemedAmount: { type: Number, default: null },
      lastRedeemedTxHash: { type: String, default: null },
      treasuryTxHash: { type: String, default: null },
      transferConfirmed: { type: Boolean, default: false },
    }, {
      timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    });
    
    const Deposit = mongoose.model('Deposit', depositSchema);
    
    // Get all deposits for this user
    console.log('📊 Fetching deposits...');
    const deposits = await Deposit.find({
      userAddress: userAddress.toLowerCase()
    }).sort({ date: 1 });
    
    console.log(`📊 Found ${deposits.length} deposits`);
    
    if (deposits.length === 0) {
      console.log('❌ No deposits found');
      return;
    }
    
    // Find active deposits (currentBalance > 0)
    const activeDeposits = deposits.filter(d => d.currentBalance > 0);
    console.log(`💰 Active deposits: ${activeDeposits.length}`);
    
    if (activeDeposits.length === 0) {
      console.log('✅ All deposits already have 0 balance');
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
    
    // Apply the fix: set first deposit to target balance, others to 0
    console.log('\n🔧 Applying emergency fix...');
    
    for (let i = 0; i < activeDeposits.length; i++) {
      const deposit = activeDeposits[i];
      const oldBalance = deposit.currentBalance;
      const newBalance = i === 0 ? targetBalance : 0;
      
      if (Math.abs(oldBalance - newBalance) > 0.001) {
        deposit.currentBalance = newBalance;
        deposit.accumulatedYield = 0; // Reset yield
        await deposit.save();
        
        console.log(`✅ Updated deposit ${i + 1}: ${oldBalance} → ${newBalance} USDT`);
        console.log(`   TX Hash: ${deposit.txHash}`);
      }
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const updatedDeposits = await Deposit.find({
      userAddress: userAddress.toLowerCase()
    });
    
    const updatedActiveDeposits = updatedDeposits.filter(d => d.currentBalance > 0);
    const newTotal = updatedActiveDeposits.reduce((sum, d) => sum + d.currentBalance, 0);
    const difference = Math.abs(newTotal - targetBalance);
    
    console.log(`\n✅ Fix complete:`);
    console.log(`💰 New total: ${newTotal} USDT`);
    console.log(`🎯 Target: ${targetBalance} USDT`);
    console.log(`📊 Difference: ${difference} USDT`);
    console.log(`📋 Active deposits: ${updatedActiveDeposits.length}`);
    
    if (difference < 0.001) {
      console.log('🎉 SUCCESS: Database is now in sync with BRICS balance!');
      console.log('✅ MetaMask import popup should no longer appear on refresh.');
    } else {
      console.log('⚠️  Warning: Balances are not perfectly in sync.');
    }
    
    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error during emergency fix:', error);
    try {
      await mongoose.disconnect();
    } catch (e) {
      console.error('❌ Error disconnecting:', e);
    }
  }
}

// Run the emergency fix
emergencyFix();
