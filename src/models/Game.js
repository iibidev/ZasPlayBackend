import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  background: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  route: {
    type: String,
    required: true,
    unique: true,
  },
  min: {
    type: Number,
    default: 2
  },
  max: {
    type: Number,
    default: 2
  },
  isInDevelopment: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

export default mongoose.model('Game', gameSchema);
