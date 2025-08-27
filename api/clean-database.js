import mongoose from 'mongoose';
import { ethers } from 'ethers';

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

// BRICS Token Contract
const BRICS_TOKEN_ADDRESS = '0x9d82c77578FE4114ba55fAbb43F6F4c4650ae85d';
const BRICS_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

async function getBRICSBalance(address) {
  try {
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    const contract = new ethers.Contract(BRICS_TOKEN_ADDRESS, BRICS_ABI, provider);
    const rawBalance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const balance = parseFloat(ethers.formatUnits(rawBalance, decimals));
    return balance;
  } catch (error) {
    console.error('Error getting BRICS balance:', error);
    return 0;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userAddress } = req.body;
    
    if (!userAddress) {
      return res.status(400).json({ success: false, message: 'userAddress is required' });
    }

    console.log(`🔍 Cleaning database for address: ${userAddress}`);

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      return res.status(500).json({ success: false, message: 'MongoDB URI not configured' });
    }

    await mongoose.connect(MONGODB_URI, {
      ssl: true,
      retryWrites: true,
      w: 'majority',
      appName: 'database-cleanup-api',
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });

    // Get all deposits for this address
    const deposits = await Deposit.find({ 
      userAddress: userAddress.toLowerCase() 
    }).sort({ date: 1 });
    
    console.log(`📊 Found ${deposits.length} deposits`);
    
    if (deposits.length === 0) {
      await mongoose.connection.close();
      return res.status(404).json({ 
        success: false, 
        message: 'No deposits found for this address' 
      });
    }
    
    // Calculate total deposited
    const totalDeposited = deposits.reduce((sum, deposit) => sum + deposit.currentBalance, 0);
    console.log(`💰 Total deposited amount: ${totalDeposited} USDT`);
    
    // Get current BRICS balance
    const bricsBalance = await getBRICSBalance(userAddress);
    console.log(`🪙 Current BRICS balance: ${bricsBalance} BRICS`);
    
    if (Math.abs(totalDeposited - bricsBalance) < 0.001) {
      await mongoose.connection.close();
      return res.status(200).json({ 
        success: true, 
        message: 'Balances are already in sync!',
        data: {
          totalDeposited,
          bricsBalance,
          difference: 0
        }
      });
    }
    
    // Clean up the deposits
    const targetTotal = bricsBalance;
    const depositCount = deposits.length;
    
    if (depositCount === 1) {
      // Single deposit - set it to the BRICS balance
      const deposit = deposits[0];
      const oldAmount = deposit.currentBalance;
      deposit.currentBalance = targetTotal;
      deposit.accumulatedYield = 0; // Reset yield
      await deposit.save();
      
      console.log(`✅ Updated single deposit: ${oldAmount} → ${targetTotal} USDT`);
      
    } else {
      // Multiple deposits - distribute proportionally
      console.log(`📊 Distributing ${targetTotal} USDT across ${depositCount} deposits...`);
      
      for (let i = 0; i < deposits.length; i++) {
        const deposit = deposits[i];
        const oldAmount = deposit.currentBalance;
        
        if (i === deposits.length - 1) {
          // Last deposit gets the remainder to ensure exact total
          const previousTotal = deposits.slice(0, i).reduce((sum, d) => sum + d.currentBalance, 0);
          deposit.currentBalance = targetTotal - previousTotal;
        } else {
          // Distribute proportionally
          const proportion = deposit.currentBalance / totalDeposited;
          deposit.currentBalance = targetTotal * proportion;
        }
        
        deposit.accumulatedYield = 0; // Reset yield
        await deposit.save();
        
        console.log(`✅ Updated deposit ${i + 1}: ${oldAmount} → ${deposit.currentBalance} USDT`);
      }
    }
    
    // Verify the cleanup
    const updatedDeposits = await Deposit.find({ 
      userAddress: userAddress.toLowerCase() 
    });
    
    const newTotal = updatedDeposits.reduce((sum, deposit) => sum + deposit.currentBalance, 0);
    const difference = Math.abs(newTotal - bricsBalance);
    
    console.log(`✅ Cleanup complete: ${newTotal} USDT vs ${bricsBalance} BRICS (diff: ${difference})`);
    
    await mongoose.connection.close();
    
    return res.status(200).json({
      success: true,
      message: 'Database cleaned successfully',
      data: {
        oldTotal: totalDeposited,
        newTotal,
        bricsBalance,
        difference,
        depositsUpdated: deposits.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    return res.status(500).json({
      success: false,
      message: 'Database cleanup failed',
      error: error.message
    });
  }
}
