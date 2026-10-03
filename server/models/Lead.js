import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    contact: String,
    company: String,
    category: String,
    website: String,
    email: String,
    location: String,
    description: String,
    source: { type: String, default: 'demo' },
    query: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);
