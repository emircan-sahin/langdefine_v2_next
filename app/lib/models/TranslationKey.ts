import mongoose from 'mongoose'

const translationValueSchema = new mongoose.Schema({
  language: String,
  value: mongoose.Schema.Types.Mixed,
  valueType: {
    type: String,
    enum: ['text', 'object', 'array'],
    default: 'text'
  }
}, { _id: false, strict: false, validateBeforeSave: false })

const translationKeySchema = new mongoose.Schema({
  title: String,
  key: String,
  description: String,
  valueType: {
    type: String,
    enum: ['text', 'object', 'array'],
    default: 'text'
  },
  values: [translationValueSchema],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { strict: false })

translationKeySchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// Delete existing model if it exists to ensure schema changes take effect
if (mongoose.models.TranslationKey) {
  delete mongoose.models.TranslationKey
}

export default mongoose.model('TranslationKey', translationKeySchema) 