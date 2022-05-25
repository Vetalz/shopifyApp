import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  allInfo: {
    type: Object,
  },
  shop: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

export const SessionModel = mongoose.model('session', SessionSchema);