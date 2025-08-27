import mongoose from 'mongoose';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userAddress, targetBalance = 0.01 } = req.body;
    
    if (!userAddress) {
      return res.status(400).json({ success: false, message: 'userAddress is required' });
    }

    console.log(`🔧 Fixing deposits for address: ${userAddress} to match balance: ${targetBalance}`);

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      return res.status(500).json({ success: false, message: 'MongoDB URI not configured' });
    }

    await mongoose.connect(MONGODB_URI, {
      ssl: true,
      retryWrites: true,
      w: 'majority',
      appName: 'fix-deposits-api',
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });

    // Get all deposits for this address
    const deposits = await Deposit.find({ 
      userAddress: userAddress.toLowerCase() 
    }).sort({ date: 1 });
    
    console.log(`📊 Found ${deposits.length} total deposits`);
    
    if (deposits.length === 0) {
      await mongoose.connection.close();
      return res.status(404).json({ 
        success: false, 
        message: 'No deposits found for this address' 
      });
    }
    
    // Find active deposits (currentBalance > 0)
    const activeDeposits = deposits.filter(d => d.currentBalance > 0);
    console.log(`💰 Active deposits (not redeemed): ${activeDeposits.length}`);
    
    if (activeDeposits.length === 0) {
      await mongoose.connection.close();
      return res.status(200).json({ 
        success: true, 
        message: 'All deposits are already redeemed (currentBalance = 0)',
        data: {
          totalDeposits: deposits.length,
          activeDeposits: 0,
          targetBalance,
          changes: []
        }
      });
    }
    
    // Calculate current total
    const currentTotal = activeDeposits.reduce((sum, d) => sum + d.currentBalance, 0);
    console.log(`💰 Current active balance: ${currentTotal} USDT`);
    console.log(`🎯 Target balance: ${targetBalance} USDT`);
    
    if (Math.abs(currentTotal - targetBalance) < 0.001) {
      await mongoose.connection.close();
      return res.status(200).json({ 
        success: true, 
        message: 'Balances are already in sync!',
        data: {
          currentTotal,
          targetBalance,
          difference: 0,
          changes: []
        }
      });
    }
    
    // Apply the fix: set first deposit to target balance, others to 0
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
    
    console.log(`✅ Fix complete: ${newTotal} USDT vs ${targetBalance} USDT (diff: ${difference})`);
    
    await mongoose.connection.close();
    
    return res.status(200).json({
      success: true,
      message: 'Deposits fixed successfully',
      data: {
        oldTotal: currentTotal,
        newTotal,
        targetBalance,
        difference,
        depositsUpdated: changes.length,
        changes
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing deposits:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fix deposits',
      error: error.message
    });
  }
}
