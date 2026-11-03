import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  // 1. We store the userId here and index it for lightning-fast lookups
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true 
  },
  filename: { type: String, required: true },
  
 
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'], 
    default: 'PENDING' 
  },
  prediction: { 
    type: String, 
    enum: ['REAL', 'FAKE', null], 
    default: null 
  },
  confidence: { type: Number, default: 0 },
  metrics: {
    faceNeckCorrelation: { type: Number, default: 0 },
    compressionType: { type: String, default: "c23 Native" }
  },
  error: { type: String, default: null }
}, { 
  timestamps: true 
});

export const Analysis= mongoose.model('Analysis', AnalysisSchema);
