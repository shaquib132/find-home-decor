import crypto from 'node:crypto';
import mongoose from 'mongoose';
import User from './models/User.js';
import Lead from './models/Lead.js';
import Pitch from './models/Pitch.js';

// If MONGODB_URI is set we always use MongoDB (and fail loudly if it is down, instead of silently
// losing data). If it is not set we run in Demo Mode with in-memory storage, so the app really
// does work without a database, as the README promises.
export const usingDb = () => Boolean(process.env.MONGODB_URI);

const mem = { users: [], pitches: [] };
const newId = () => crypto.randomUUID();
const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

/* ---------- users ---------- */
export async function findUserByEmail(email) {
  const e = String(email).toLowerCase();
  if (usingDb()) return User.findOne({ email: e }).lean();
  return mem.users.find((u) => u.email === e) || null;
}

export async function createUser(data) {
  const user = { ...data, email: String(data.email).toLowerCase() };
  if (usingDb()) return (await User.create(user)).toObject();
  const doc = { _id: newId(), createdAt: new Date(), ...user };
  mem.users.push(doc);
  return doc;
}

/* ---------- leads ---------- */
export async function saveLeads(userId, query, source, rows) {
  const docs = rows.map((r) => ({ ...r, userId, query, source }));
  if (usingDb()) return (await Lead.insertMany(docs)).map((d) => d.toObject());
  return docs.map((d) => ({ _id: newId(), ...d }));
}

/* ---------- pitches ---------- */
export async function listPitches(userId) {
  if (usingDb()) return Pitch.find({ userId }).sort({ createdAt: -1 }).limit(200).lean();
  return mem.pitches.filter((p) => p.userId === userId).sort(byNewest);
}

export async function createPitch(userId, data) {
  if (usingDb()) {
    const doc = { ...data, userId };
    if (!mongoose.isValidObjectId(doc.leadId)) delete doc.leadId;
    return (await Pitch.create(doc)).toObject();
  }
  const doc = { _id: newId(), createdAt: new Date(), stage: 'pitched', ...data, userId };
  mem.pitches.push(doc);
  return doc;
}

export async function setStage(userId, pitchId, stage) {
  if (usingDb()) {
    if (!mongoose.isValidObjectId(pitchId)) return null;
    return Pitch.findOneAndUpdate({ _id: pitchId, userId }, { stage }, { new: true }).lean();
  }
  const pitch = mem.pitches.find((p) => p._id === pitchId && p.userId === userId);
  if (!pitch) return null;
  pitch.stage = stage;
  return pitch;
}

// stage: 'all' | 'proposal' | 'accepted'
export async function clearPitches(userId, stage) {
  const filter = stage === 'all' ? {} : { stage };
  if (usingDb()) {
    const r = await Pitch.deleteMany({ userId, ...filter });
    return r.deletedCount;
  }
  const before = mem.pitches.length;
  mem.pitches = mem.pitches.filter((p) => !(p.userId === userId && (stage === 'all' || p.stage === stage)));
  return before - mem.pitches.length;
}

export async function countPitchesSince(userId, since) {
  if (usingDb()) return Pitch.countDocuments({ userId, createdAt: { $gte: since } });
  return mem.pitches.filter((p) => p.userId === userId && new Date(p.createdAt) >= since).length;
}
