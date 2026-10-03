import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Optional: users who sign in with Google have no password.
    passwordHash: { type: String },
    googleId: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
