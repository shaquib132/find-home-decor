import mongoose from 'mongoose';

const pitchSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    recipient: { type: String, required: true },
    buyerName: String,
    company: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    // Delivery: 'sent' = emailed through Resend, 'saved' = stored only (no email provider / demo address)
    status: { type: String, enum: ['sent', 'saved'], default: 'saved' },
    // Pipeline: pitched -> proposal -> accepted
    stage: { type: String, enum: ['pitched', 'proposal', 'accepted'], default: 'pitched' }
  },
  { timestamps: true }
);

export default mongoose.model('Pitch', pitchSchema);
