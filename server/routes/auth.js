const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken,
  generatePasswordResetToken 
} = require('../utils/jwt')
const { 
  validateRegistration, 
  validateLogin, 
  handleValidationErrors 
} = require('../utils/validation')
const { 
  loginLimiter, 
  registerLimiter, 
  passwordResetLimiter 
} = require('../utils/rateLimiter')
const router = express.Router()

router.post('/register', 
  // registerLimiter, // Temporarily disabled for debugging
  validateRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      console.log('Registration attempt:', { 
        email: req.body.email, 
        name: req.body.name,
        bodyKeys: Object.keys(req.body)
      })
      
      const { name, email, password, age, monthlyIncome, investmentHorizon, riskAppetite } = req.body

      // Check if user exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        console.log('User already exists:', email)
        return res.status(409).json({ 
          success: false, 
          message: 'User with this email already exists' 
        })
      }

      // Hash password
      let hashedPassword
      try {
        hashedPassword = await bcrypt.hash(password, 12)
      } catch (hashError) {
        console.error('Password hashing error:', hashError)
        return res.status(500).json({ 
          success: false, 
          message: 'Password processing failed' 
        })
      }

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        age,
        monthlyIncome,
        investmentHorizon,
        riskAppetite
      })

      await user.save()

      // Generate tokens
      let accessToken, refreshToken
      try {
        accessToken = generateAccessToken(user._id, user.email)
        refreshToken = generateRefreshToken()
        
        // Store refresh token
        await user.addRefreshToken(refreshToken)
      } catch (jwtError) {
        console.error('Token generation error:', jwtError)
        return res.status(500).json({ 
          success: false, 
          message: 'Authentication token generation failed' 
        })
      }

      console.log('Registration successful for:', email)
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          riskProfile: user.riskProfile,
          isEmailVerified: user.isEmailVerified
        }
      })
    } catch (error) {
      console.error('Registration server error:', error)
      
      // Handle specific database errors
      if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        return res.status(503).json({ 
          success: false, 
          message: 'Database connection error. Please try again later.' 
        })
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message)
        return res.status(400).json({ 
          success: false, 
          message: messages.join(', ') 
        })
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error. Please try again.' 
      })
    }
  }
)

router.post('/login', 
  // loginLimiter, // Temporarily disabled for debugging
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      console.log('Login attempt:', { email: req.body.email })
      
      const { email, password } = req.body

      // Find user with account status check
      const user = await User.findOne({ email })
      if (!user) {
        console.log('User not found:', email)
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        })
      }

      // Check account status
      if (user.accountStatus === 'suspended') {
        return res.status(403).json({ 
          success: false, 
          message: 'Account suspended. Please contact administrator.' 
        })
      }

      // Check if account is locked
      if (user.isLocked) {
        const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60) // minutes
        return res.status(423).json({ 
          success: false, 
          message: `Account locked due to too many failed attempts. Try again in ${lockTimeRemaining} minutes.` 
        })
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        console.log('Password mismatch for:', email)
        // Increment failed login attempts
        await user.incLoginAttempts()
        
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        })
      }

      // Reset failed login attempts on successful login
      await user.resetLoginAttempts()

      // Generate tokens
      let accessToken, refreshToken
      try {
        accessToken = generateAccessToken(user._id, user.email)
        refreshToken = generateRefreshToken()
        
        // Store refresh token
        await user.addRefreshToken(refreshToken)
      } catch (jwtError) {
        console.error('Token generation error:', jwtError)
        return res.status(500).json({ 
          success: false, 
          message: 'Authentication token generation failed' 
        })
      }

      console.log('Login successful for:', email)
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          riskProfile: user.riskProfile,
          investmentHorizon: user.investmentHorizon,
          riskAppetite: user.riskAppetite,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        }
      })
    } catch (error) {
      console.error('Login server error:', error)
      
      // Handle specific database errors
      if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        return res.status(503).json({ 
          success: false, 
          message: 'Database connection error. Please try again later.' 
        })
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error. Please try again.' 
      })
    }
  }
)

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token required' 
      })
    }

    // Find user with this refresh token
    const user = await User.findOne({ 
      'refreshTokens.token': refreshToken 
    })
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      })
    }

    // Remove the used refresh token
    await user.removeRefreshToken(refreshToken)

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id, user.email)
    const newRefreshToken = generateRefreshToken()
    
    // Store new refresh token
    await user.addRefreshToken(newRefreshToken)

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Token refresh failed' 
    })
  }
})

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body
    
    if (refreshToken) {
      // Remove specific refresh token
      const user = await User.findOne({ 
        'refreshTokens.token': refreshToken 
      })
      
      if (user) {
        await user.removeRefreshToken(refreshToken)
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    })
  }
})

// Logout from all devices
router.post('/logout-all', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      })
    }

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    // Clear all refresh tokens
    await user.clearRefreshTokens()

    res.json({
      success: true,
      message: 'Logged out from all devices'
    })
  } catch (error) {
    console.error('Logout all error:', error)
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      })
    }

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.userId).select('-password -refreshTokens')
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    res.json({ 
      success: true,
      user 
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    })
  }
})

// Request password reset
router.post('/forgot-password', 
  passwordResetLimiter,
  async (req, res) => {
    try {
      const { email } = req.body
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        })
      }

      const user = await User.findOne({ email })
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        })
      }

      // Generate reset token
      const resetToken = generatePasswordResetToken()
      const resetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

      user.passwordResetToken = resetToken
      user.passwordResetExpires = resetExpires
      await user.save()

      console.log('Password reset token generated for:', email)
      // In production, send email with reset link
      // For now, just log the token (remove in production)
      
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        // For development only - remove in production
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      })
    } catch (error) {
      console.error('Forgot password error:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Password reset request failed' 
      })
    }
  }
)

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token and new password are required' 
      })
    }

    // Validate new password strength
    const { validatePassword } = require('../utils/validation')
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: passwordValidation.errors.join(', ') 
      })
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password and clear reset token
    user.password = hashedPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.failedLoginAttempts = 0
    user.lockUntil = undefined
    
    await user.save()

    console.log('Password reset successful for:', user.email)

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Password reset failed' 
    })
  }
})

// Debug route to test validation (remove in production)
router.post('/test-validation', validateRegistration, handleValidationErrors, (req, res) => {
  res.json({
    success: true,
    message: 'Validation passed',
    data: req.body
  })
})

module.exports = router