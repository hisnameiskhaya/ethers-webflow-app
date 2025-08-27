// Simple fix script - can be run directly on production server
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Deposit Schema
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

async function simpleFix() {
  try {
    console.log('🔧 Simple fix script starting...');
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.log('💡 Make sure you have the correct MongoDB URI in your .env file');
      return;
    }
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      ssl: true,
      retryWrites: true,
      w: 'majority',
      appName: 'simple-fix',
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });
    console.log('✅ MongoDB connected');
    
    const userAddress = '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1';
    const targetBalance = 0.01;
    
    console.log(`🔍 Fixing deposits for: ${userAddress}`);
    console.log(`🎯 Target balance: ${targetBalance} USDT`);
    
    // Get all deposits for this address
    const deposits = await Deposit.find({ 
      userAddress: userAddress.toLowerCase() 
    }).sort({ date: 1 });
    
    console.log(`📊 Found ${deposits.length} total deposits`);
    
    if (deposits.length === 0) {
      console.log('❌ No deposits found');
      return;
    }
    
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
    
    // Apply the fix
    console.log('\n🔧 Applying fix...');
    console.log('⚠️  This will set the first deposit to 0.01 and all others to 0');
    
    const changes = [];
    
    for (let i = 0; i < activeDeposits.length; i++) {
      const deposit = activeDeposits[i];
      const oldBalance = deposit.currentBalance;
      const newBalance = i === 0 ? targetBalance : 0;
      
      if (Math.abs(oldBalance - newBalance) > 0.001) {
        deposit.currentBalance = newBalance;
        deposit.accumulatedYield = 0; // Reset yield
        await deposit.save();
        
        changes.push({
          depositId: deposit._id,
          oldBalance,
          newBalance,
          txHash: deposit.txHash
        });
        
        console.log(`✅ Updated deposit ${i + 1}: ${oldBalance} → ${newBalance} USDT`);
      }
    }
    
    // Verify the fix
    const updatedDeposits = await Deposit.find({ 
      userAddress: userAddress.toLowerCase() 
    });
    
    const updatedActiveDeposits = updatedDeposits.filter(d => d.currentBalance > 0);
    const newTotal = updatedActiveDeposits.reduce((sum, d) => sum + d.currentBalance, 0);
    const difference = Math.abs(newTotal - targetBalance);
    
    console.log(`\n✅ Fix complete!`);
    console.log(`💰 New total: ${newTotal} USDT`);
    console.log(`🎯 Target: ${targetBalance} USDT`);
    console.log(`📊 Difference: ${difference} USDT`);
    console.log(`📝 Deposits updated: ${changes.length}`);
    
    if (difference < 0.001) {
      console.log('🎉 SUCCESS: Database is now in sync with BRICS balance!');
      console.log('✅ MetaMask import popup should no longer appear on refresh.');
      console.log('✅ Smart import logic will now work correctly.');
    } else {
      console.log('⚠️  Warning: Balances are not perfectly in sync.');
    }
    
  } catch (error) {
    console.error('❌ Error during fix:', error);
    console.log('💡 Make sure you have the correct MongoDB URI and network access');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the fix
simpleFix();
