const mongoose = require('mongoose')

const fundSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  holdings: [{
    company: {
      type: String,
      required: true
    },
    sector: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Fund', fundSchema)