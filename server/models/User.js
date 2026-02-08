const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  monthlyIncome: {
    type: String,
    required: true
  },
  investmentHorizon: {
    type: String,
    enum: ['short', 'medium', 'long'],
    required: true
  },
  riskAppetite: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    required: true
  },
  riskProfile: {
    type: String,
    enum: ['Conservative', 'Balanced', 'Aggressive'],
    default: 'Balanced'
  },
  // Security fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'locked'],
    default: 'active'
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  // Refresh tokens for better security
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }]
}, {
  timestamps: true
})

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Instance method to check login attempts and lock account
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { failedLoginAttempts: 1 }
    })
  }
  
  const updates = { $inc: { failedLoginAttempts: 1 } }
  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }
  
  return this.updateOne(updates)
}

// Instance method to reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { failedLoginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: Date.now() }
  })
}

// Instance method to add refresh token
userSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push({ token })
  return this.save()
}

// Instance method to remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token)
  return this.save()
}

// Instance method to clear all refresh tokens
userSchema.methods.clearRefreshTokens = function() {
  this.refreshTokens = []
  return this.save()
}

userSchema.pre('save', function(next) {
  if (this.investmentHorizon === 'short' && this.riskAppetite === 'low') {
    this.riskProfile = 'Conservative'
  } else if (this.investmentHorizon === 'long' && this.riskAppetite === 'high') {
    this.riskProfile = 'Aggressive'
  } else {
    this.riskProfile = 'Balanced'
  }
  next()
})

module.exports = mongoose.model('User', userSchema)