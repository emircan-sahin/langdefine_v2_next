import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  mainLanguage: {
    type: String,
    required: true,
    trim: true,
  },
  languages: [{
    type: String,
    trim: true,
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

projectSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Project || mongoose.model('Project', projectSchema) 