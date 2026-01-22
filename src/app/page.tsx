'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import {
  Play,
  Pause,
  Zap,
  Upload,
  Database,
  Shield,
  LogOut,
  ArrowLeft,
  X,
  Eye,
  EyeOff,
  Copy,
  Info,
  Share2,
  Heart,
  Download,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function Home() {
  const {
    userId,
    isAdmin,
    viewMode,
    setViewMode,
    setIsPlaying,
    enableNSFW,
    setUser,
  } = useAppStore()

  const [currentContent, setCurrentContent] = useState<any>(null)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [isPlaying, setIsPlayingLocal] = useState(true)

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showSignupOtpModal, setShowSignupOtpModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Signup modal state
  const [fullName, setFullName] = useState('')
  const [userName, setUserName] = useState('')
  const [userNameAvailable, setUserNameAvailable] = useState<boolean | null>(null)
  const [userNameChecking, setUserNameChecking] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signupOtp, setSignupOtp] = useState('')
  const [signupEmailForOtp, setSignupEmailForOtp] = useState('')

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadMayBeNSFW, setUploadMayBeNSFW] = useState(false)
  const [makeContentPrivate, setMakeContentPrivate] = useState(false)
  const [autoGenerateShareLink, setAutoGenerateShareLink] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Mock content for display
  useEffect(() => {
    setCurrentContent({
      id: 'mock-1',
      filename: 'Welcome to Immersive Media',
      fileType: 'image/jpeg',
      filePath: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1920',
      isNSFW: false,
      isPrivate: false,
      views: 1234,
      viewCount: 1234,
      likeCount: 456,
    })
  }, [])

  const togglePlay = () => {
    setIsPlayingLocal(!isPlaying)
    setIsPlaying(!isPlaying)
  }

  const handleUpload = () => {
    setShowUploadModal(true)
    setUploadFile(null)
    setUploadError('')
    setShareLink('')
  }

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadFile(files[0])
      setUploadError('')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFile(e.dataTransfer.files[0])
      setUploadError('')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      alert('Share link copied to clipboard!')
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setUploadError('Please select a file to upload')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError('')

    const formData = new FormData()
    formData.append('file', uploadFile)
    if (userId) {
      formData.append('userId', userId)
    }
    formData.append('isNSFW', uploadMayBeNSFW.toString())
    formData.append('isPrivate', makeContentPrivate.toString())
    formData.append('autoGenerateShareLink', autoGenerateShareLink.toString())

    try {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          if (response.success) {
            setUploadProgress(100)
            if (autoGenerateShareLink && response.shareLink) {
              setShareLink(response.shareLink)
            }
            setTimeout(() => {
              setIsUploading(false)
              setShowUploadModal(false)
              alert('Upload successful!')
            }, 500)
          } else {
            setIsUploading(false)
            setUploadError(response.error || 'Upload failed')
          }
        } else {
          setIsUploading(false)
          setUploadError('Upload failed')
        }
      }

      xhr.onerror = () => {
        setIsUploading(false)
        setUploadError('Upload error. Please try again.')
      }

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    } catch (error) {
      setIsUploading(false)
      setUploadError('Upload error: ' + (error as Error).message)
    }
  }

  // Handle login
  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, rememberMe }),
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.userId, data.isAdmin)
        setShowLoginModal(false)
        if (data.isAdmin) {
          window.location.href = '/admin/dashboard'
        } else {
          window.location.href = '/vault/dashboard'
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Login error: ' + (err as Error).message)
    }
    setLoading(false)
  }

  // Handle forgot password - send OTP
  const handleForgotPassword = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await response.json()
      if (data.success) {
        setResetEmail(forgotEmail)
        setShowForgotPassword(false)
        setShowOtpModal(true)
        setSuccess('OTP sent to your email. Valid for 30 minutes.')
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message)
    }
    setLoading(false)
  }

  // Handle OTP verification and password reset
  const handleVerifyOtp = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp }),
      })
      const data = await response.json()
      if (data.success) {
        setSuccess('Password reset successful! Please login with your new password.')
        setShowOtpModal(false)
        setTimeout(() => {
          window.location.href = '/vault/dashboard'
        }, 2000)
      } else {
        setError(data.error || 'Invalid or expired OTP')
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message)
    }
    setLoading(false)
  }

  // Username availability check
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!userName || userName.length < 3) {
        setUserNameAvailable(null)
        return
      }

      setUserNameChecking(true)
      try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(userName)}`)
        const data = await response.json()
        setUserNameAvailable(data.available)
      } catch (err) {
        console.error('Username check error:', err)
      } finally {
        setUserNameChecking(false)
      }
    }

    const debounceTimer = setTimeout(checkUsernameAvailability, 500)
    return () => clearTimeout(debounceTimer)
  }, [userName])

  // Handle signup
  const handleSignup = async () => {
    setError('')
    setSuccess('')

    // Validate inputs
    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }

    if (!userName.trim() || userName.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (userNameAvailable === false) {
      setError('Username is already taken')
      return
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Valid email address is required')
      return
    }

    if (!signupPassword || signupPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          userName,
          email: signupEmail,
          password: signupPassword,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSignupEmailForOtp(signupEmail)
        setShowSignupModal(false)
        setShowSignupOtpModal(true)
        setSuccess('OTP sent to your email. Valid for 30 minutes.')
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch (err) {
      setError('Signup error: ' + (err as Error).message)
    }
    setLoading(false)
  }

  // Handle signup OTP verification
  const handleSignupVerifyOtp = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmailForOtp, otp: signupOtp }),
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.userId, false)
        setShowSignupOtpModal(false)
        setSuccess('Account created successfully!')
        setTimeout(() => {
          window.location.href = '/vault/dashboard'
        }, 1000)
      } else {
        setError(data.error || 'Invalid or expired OTP')
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message)
    }
    setLoading(false)
  }

  if (viewMode === 'fullscreen') {
    return (
      <FullscreenMode
        content={currentContent}
        isPlaying={isPlaying}
        enableNSFW={enableNSFW}
        onPlay={togglePlay}
        onToggleSettings={() => setShowSettingsPanel(!showSettingsPanel)}
        onSwitchMode={() => setViewMode('manage')}
        onUpload={handleUpload}
        userId={userId}
        isAdmin={isAdmin}
        onLogin={() => setShowLoginModal(true)}
        onSignup={() => setShowSignupModal(true)}
        onSettingsPanel={showSettingsPanel}
        showInfoModal={showInfoModal}
        onInfoModal={() => setShowInfoModal(true)}
      />
    )
  }

  return (
    <>
      <ManageMode
        onSwitchMode={() => setViewMode('fullscreen')}
        onUpload={handleUpload}
        userId={userId}
        isAdmin={isAdmin}
        onLogin={() => setShowLoginModal(true)}
        onSignup={() => setShowSignupModal(true)}
        onLogout={() => {
          setIsPlaying(false)
          setUser(null, false)
          window.location.href = '/'
        }}
      />

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setShowLoginModal(false)}
                variant="ghost"
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white/60 mb-6">Sign in to access your vault</p>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-white/80 text-sm mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-white/80 text-sm mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white/20"
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-white/60 text-sm cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowForgotPassword(true)
                      setError('')
                    }}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={loading || !loginEmail || !loginPassword}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowForgotPassword(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setShowForgotPassword(false)}
                variant="ghost"
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-white/60 mb-6">
                Enter your registered email address to receive a password reset OTP
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email" className="text-white/80 text-sm mb-2 block">
                    Registered Email
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowForgotPassword(false)
                      setShowLoginModal(true)
                      setError('')
                    }}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 hover:bg-white/20 text-white"
                  >
                    Back to Login
                  </Button>
                  <Button
                    onClick={handleForgotPassword}
                    disabled={loading || !forgotEmail}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowOtpModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setShowOtpModal(false)}
                variant="ghost"
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
              <p className="text-white/60 mb-2">
                Enter the OTP sent to {resetEmail}
              </p>
              <p className="text-purple-400 text-sm mb-6">
                Valid for 30 minutes
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp-input" className="text-white/80 text-sm mb-2 block">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp-input"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 text-center text-lg tracking-widest"
                  />
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || !otp}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? 'Verifying...' : 'Verify & Reset Password'}
                </Button>

                <p className="text-white/40 text-xs text-center">
                  Didn't receive the OTP? Click Send OTP again in the previous step
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSignupModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setShowSignupModal(false)}
                variant="ghost"
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-white/60 mb-6">Join us and start sharing your media</p>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="full-name" className="text-white/80 text-sm mb-2 block">
                    Full Name
                  </Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="text-white/80 text-sm mb-2 block">
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-10"
                    />
                    {userNameChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {!userNameChecking && userNameAvailable === true && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      </div>
                    )}
                    {!userNameChecking && userNameAvailable === false && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                        <X className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {userNameAvailable === false && (
                    <p className="text-red-400 text-xs mt-1">Username is already taken</p>
                  )}
                  {userNameAvailable === true && (
                    <p className="text-green-400 text-xs mt-1">Username is available</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-email" className="text-white/80 text-sm mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password" className="text-white/80 text-sm mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="•••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-white/80 text-sm mb-2 block">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="•••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && signupPassword !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword && signupPassword === confirmPassword && confirmPassword.length >= 6 && (
                    <p className="text-green-400 text-xs mt-1">Passwords match</p>
                  )}
                </div>

                <Button
                  onClick={handleSignup}
                  disabled={loading || !fullName || !userName || !signupEmail || !signupPassword || !confirmPassword || userNameAvailable === false}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <p className="text-white/40 text-xs text-center">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignupModal(false)
                      setShowLoginModal(true)
                      setError('')
                      setSuccess('')
                    }}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup OTP Verification Modal */}
      <AnimatePresence>
        {showSignupOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSignupOtpModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setShowSignupOtpModal(false)}
                variant="ghost"
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
              <p className="text-white/60 mb-2">
                Enter the OTP sent to {signupEmailForOtp}
              </p>
              <p className="text-purple-400 text-sm mb-6">
                Valid for 30 minutes
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="signup-otp-input" className="text-white/80 text-sm mb-2 block">
                    Enter OTP
                  </Label>
                  <Input
                    id="signup-otp-input"
                    type="text"
                    placeholder="123456"
                    value={signupOtp}
                    onChange={(e) => setSignupOtp(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 text-center text-lg tracking-widest"
                  />
                </div>

                <Button
                  onClick={handleSignupVerifyOtp}
                  disabled={loading || !signupOtp}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </Button>

                <p className="text-white/40 text-xs text-center">
                  Didn't receive the OTP? Click Create Account again in the previous step
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-8 max-w-2xl w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setShowUploadModal(false)}
                variant="ghost"
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold text-white mb-2">Upload Options</h2>

              {/* Guest Notice */}
              {!userId && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg mb-6 text-sm">
                  <p className="font-semibold mb-1">You're uploading as a guest.</p>
                  <p>Sign up to track uploads, access your vault, and earn from donations.</p>
                </div>
              )}

              {/* Drag & Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                  uploadFile ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-purple-500/50 bg-white/5'
                }`}
              >
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center gap-4 cursor-pointer h-full"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-xl font-semibold">Drag & Drop</p>
                    <p className="text-white/60 text-sm">or</p>
                    <p className="text-purple-400 font-medium">Click to Browse</p>
                  </div>
                  {uploadFile && (
                    <div className="text-white/80 text-sm mt-4 flex items-center justify-center gap-2">
                      <p className="truncate max-w-xs">{uploadFile.name}</p>
                      <p className="text-purple-400">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Controls */}
              <div className="space-y-4 mt-6">
                <div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="nsfw-checkbox"
                      checked={uploadMayBeNSFW}
                      onCheckedChange={(checked) => setUploadMayBeNSFW(checked as boolean)}
                      className="border-white/20"
                    />
                    <Label
                      htmlFor="nsfw-checkbox"
                      className="text-white/80 text-sm flex-1 cursor-pointer"
                    >
                      This content may be NSFW
                    </Label>
                  </div>
                  <p className="text-white/40 text-xs ml-7">
                    System will auto-detect NSFW and apply rating
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="private-checkbox"
                      checked={makeContentPrivate}
                      onCheckedChange={(checked) => setMakeContentPrivate(checked as boolean)}
                      className="border-white/20"
                    />
                    <Label
                      htmlFor="private-checkbox"
                      className="text-white/80 text-sm flex-1 cursor-pointer"
                    >
                      Make this content private
                    </Label>
                  </div>
                  <p className="text-white/40 text-xs ml-7">
                    Private content stays in user vault
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="share-link-checkbox"
                      checked={autoGenerateShareLink}
                      onCheckedChange={(checked) => setAutoGenerateShareLink(checked as boolean)}
                      className="border-white/20"
                    />
                    <Label
                      htmlFor="share-link-checkbox"
                      className="text-white/80 text-sm flex-1 cursor-pointer"
                    >
                      Auto-generate short share link
                    </Label>
                  </div>
                  <p className="text-white/40 text-xs ml-7">
                    Shareable even if content is private
                  </p>
                </div>
              </div>

              {/* Share Link Display */}
              {shareLink && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-green-200 text-sm truncate">{shareLink}</p>
                    </div>
                    <Button
                      onClick={copyShareLink}
                      variant="outline"
                      className="bg-green-500/20 border-green-500/50 text-green-200 hover:bg-green-500/30 flex items-center gap-2"
                      size="sm"
                    >
                      <div className="w-4 h-4" />
                      <span className="text-xs">Copy</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mt-6 text-sm">
                  {uploadError}
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm">Uploading...</span>
                    <span className="text-purple-400 font-semibold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.2 }}
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {!isUploading && (
                <div className="mt-6">
                  <Button
                    onClick={handleFileUpload}
                    disabled={!uploadFile}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Upload Now
                  </Button>
                </div>
              )}

              {/* Upload Limits */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/60 text-xs mb-2">Upload Limits</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      userId ? 'bg-purple-500' : 'bg-white/40'
                    }`}></div>
                    <span className="text-white/80 text-sm">
                      {userId ? 'Registered' : 'Guest'}
                    </span>
                  </div>
                  <span className="text-white font-semibold">
                    {userId ? '500MB' : '100MB'}
                  </span>
                  <span className="text-white/40 text-xs">
                    {userId && '(upgradeable)'}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function FullscreenMode({
  content,
  isPlaying,
  enableNSFW,
  onPlay,
  onToggleSettings,
  onSwitchMode,
  onUpload,
  userId,
  isAdmin,
  onLogin,
  onSignup,
  onSettingsPanel,
  showInfoModal,
  onInfoModal,
}: any) {
  const [showControls, setShowControls] = useState(true)
  const [viewCount, setViewCount] = useState(content?.viewCount || 0)
  const [likeCount, setLikeCount] = useState(content?.likeCount || 0)
  const [isLiked, setIsLiked] = useState(false)
  const [timerProgress, setTimerProgress] = useState(0)
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    const hideControls = () => setShowControls(false)
    const showControlsAgain = () => setShowControls(true)

    let timeout: NodeJS.Timeout
    const resetTimeout = () => {
      clearTimeout(timeout)
      timeout = setTimeout(hideControls, 3000)
    }

    document.addEventListener('mousemove', showControlsAgain)
    document.addEventListener('mousemove', resetTimeout)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousemove', showControlsAgain)
      document.removeEventListener('mousemove', resetTimeout)
    }
  }, [])

  // Update view count when content changes
  useEffect(() => {
    if (content) {
      setViewCount(content.viewCount || 0)
      setLikeCount(content.likeCount || 0)
      setIsLiked(false)
      setTimerProgress(0)
    }
  }, [content])

  // Timer animation
  useEffect(() => {
    setLocalIsPlaying(isPlaying)
  }, [isPlaying])

  useEffect(() => {
    if (!localIsPlaying) return

    const timerDuration = 5000 // 5 seconds for each content
    const interval = 16 // ~60fps
    const progressPerTick = 100 / (timerDuration / interval)

    const timer = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev >= 100) {
          return 0
        }
        return prev + progressPerTick
      })
    }, interval)

    return () => clearInterval(timer)
  }, [localIsPlaying])

  const handleLikeToggle = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setIsLiked((prev) => !prev)
  }

  const handlePlayPause = () => {
    setLocalIsPlaying((prev) => !prev)
    onPlay()
  }

  const handleDownload = async () => {
    if (content?.filePath) {
      try {
        // Fetch the file directly to ensure proper download
        const response = await fetch(content.filePath)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = content.filename || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Download failed:', error)
      }
    }
  }

  const handleUploadClick = () => {
    setShowUploadModal(true)
    setLocalIsPlaying(false) // Pause content when upload modal opens
  }

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadFile(files[0])
      setUploadError('')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFile(e.dataTransfer.files[0])
      setUploadError('')
    }
  }

  const handleCloseUpload = () => {
    setShowUploadModal(false)
    setUploadFile(null)
    setUploadError('')
    setLocalIsPlaying(isPlaying) // Resume playing if it was playing before
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={content?.id || 'current'}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={content?.filePath}
            alt={content?.filename}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      <motion.div
        initial={{ y: -100 }}
        animate={{ y: showControls ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={onSwitchMode}
            variant="outline"
            className="bg-black/20 border-white/20 hover:bg-black/40 text-white backdrop-blur-sm"
            size="sm"
          >
            <Database className="w-4 h-4 mr-2" />
            Manage
          </Button>

          <Button
            onClick={onInfoModal}
            variant="outline"
            className="bg-black/20 border-white/20 hover:bg-black/40 text-white backdrop-blur-sm"
            size="sm"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>

        {/* Center section: View, Like, Play/Pause */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/20 border border-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
            <Eye className="w-4 h-4 text-white/80" />
            <span className="text-white text-sm font-medium">{viewCount}</span>
          </div>

          <button
            onClick={handleLikeToggle}
            className="flex items-center gap-2 bg-black/20 border border-white/20 rounded-full px-4 py-2 backdrop-blur-sm hover:bg-black/40 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : 'text-white/80'}`}
            />
            <span className={`text-sm font-medium ${isLiked ? 'text-pink-500' : 'text-white'}`}>
              {likeCount}
            </span>
          </button>

          <Button
            onClick={handlePlayPause}
            variant="outline"
            className="bg-black/20 border-white/20 hover:bg-black/40 text-white backdrop-blur-sm"
            size="sm"
          >
            {localIsPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Right section: Download, Upload, Settings, X */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="bg-black/20 border-white/20 hover:bg-black/40 text-white backdrop-blur-sm"
            size="sm"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="bg-black/20 border-white/20 hover:bg-black/40 text-white backdrop-blur-sm"
            size="sm"
            title="Upload"
          >
            <Upload className="w-4 h-4" />
          </Button>

          <Button
            onClick={onToggleSettings}
            variant="outline"
            className="bg-black/20 border-white/20 hover:bg-black/40 text-white backdrop-blur-sm"
            size="sm"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            onClick={onSwitchMode}
            variant="outline"
            className="bg-black/20 border-white/20 hover:bg-black/40 text-white backdrop-blur-sm"
            size="sm"
            title="Return to Manage"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showControls ? 0 : 100 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-4"
      >
        {/* Timer Bar at bottom center */}
        <div className="flex items-center justify-center">
          <div className="w-64 h-1 bg-black/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${timerProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {onSettingsPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-80 bg-black/80 backdrop-blur-md p-6 border border-white/20 rounded-l-xl"
          >
            <Button
              onClick={() => onToggleSettings()}
              variant="ghost"
              className="absolute top-2 right-2 text-white hover:text-white/70"
              size="sm"
            >
              <X className="w-5 h-5" />
            </Button>
            <h3 className="text-white text-lg font-semibold mb-6">Playback Settings</h3>
            <div className="space-y-4">
              {/* Auto Play Speed */}
              <div>
                <Label className="text-white text-sm mb-2 block">Auto Play Speed</Label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="3"
                    max="10"
                    defaultValue="5"
                    className="w-full accent-purple-500"
                    onChange={(e) => {
                      // Can be connected to parent state later
                      console.log('Timer duration:', e.target.value)
                    }}
                  />
                  <div className="flex justify-between text-xs text-white/60">
                    <span>3s</span>
                    <span>10s</span>
                  </div>
                </div>
              </div>

              {/* NSFW Toggle */}
              <div>
                <Label className="text-white text-sm mb-2 block">NSFW Content</Label>
                <Button
                  onClick={() => {
                    // Can be connected to parent state later
                    console.log('Toggle NSFW:', !enableNSFW)
                  }}
                  variant="outline"
                  className="w-full bg-black/50 border-white/20 text-white hover:bg-black/70"
                  size="sm"
                >
                  {enableNSFW ? 'Hide NSFW' : 'Show NSFW'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal Overlay */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseUpload}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={handleCloseUpload}
                variant="ghost"
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold text-white mb-2">Upload Content</h2>
              <p className="text-white/60 text-sm mb-6">
                Upload images or videos to share with the community
              </p>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  uploadFile
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-white/20 bg-white/5 hover:border-purple-500/30'
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={handleDrop}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*,video/*'
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement
                    handleFileSelect(target.files)
                  }
                  input.click()
                }}
              >
                {uploadFile ? (
                  <div className="text-white">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                      <Database className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="font-medium mb-1">{uploadFile.name}</p>
                    <p className="text-sm text-white/60">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-white/60">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
                    <p className="font-medium mb-1">Drag & drop files here</p>
                    <p className="text-sm">or click to browse</p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {uploadError}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleCloseUpload}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (uploadFile) {
                      // Handle upload logic here
                      console.log('Uploading:', uploadFile.name)
                      // Can connect to parent upload function
                      handleCloseUpload()
                    }
                  }}
                  disabled={!uploadFile}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  Upload
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-white/40">
                Supported formats: JPG, PNG, GIF, MP4, WebM • Max 50MB
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => onInfoModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-2xl p-6 max-w-2xl w-full relative max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => onInfoModal(false)}
                variant="ghost"
                className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>

                <div className="space-y-4 text-white/80 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center flex-shrink-0">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Upload Content</h3>
                      <p className="text-sm mb-2">Upload images and videos to your personal media vault</p>
                      <p className="text-sm">Choose between public or private uploads</p>
                      <p className="text-sm">Generate shareable links for easy content sharing</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">My Vault</h3>
                      <p className="text-sm mb-2">Access all your uploaded content in one place</p>
                      <p className="text-sm">Track views, likes, and downloads</p>
                      <p className="text-sm">Organize with folders and collections</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Fullscreen Mode</h3>
                      <p className="text-sm mb-2">Immersive viewing experience with auto-rotation</p>
                      <p className="text-sm">Adjust timer settings for content switching</p>
                      <p className="text-sm">Toggle NSFW content on/off</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Benefits</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/20 p-6 mx-auto">
                        <Zap className="w-8 h-8 text-purple-200 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg">500MB Storage</h3>
                        <p className="text-white/80 text-sm">For registered users</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-white/20 p-6 mx-auto">
                        <Database className="w-8 h-8 text-green-200 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg">AI Protection</h3>
                        <p className="text-white/80 text-sm">Auto NSFW detection & rating</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-white/20 p-6 mx-auto">
                        <Shield className="w-8 h-8 text-blue-200 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg">Private Content</h3>
                        <p className="text-white/80 text-sm">Keep content in your vault only</p>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
                  <div className="space-y-3 text-white/80">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Auto-rotation</span>
                      <span className="text-white/60 text-sm">Content auto-switches based on timer</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">Smart Upload</span>
                      <span className="text-white/60 text-sm">Drag & drop with progress tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Privacy Control</span>
                      <span className="text-white/60 text-sm">Mark uploads as private</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-pink-400" />
                      <span className="text-white font-medium">Share Links</span>
                      <span className="text-white/60 text-sm">Auto-generated short URLs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-orange-400" />
                      <span className="text-white font-medium">User Vaults</span>
                      <span className="text-white/60 text-sm">Organize your media collection</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    onInfoModal(false)
                    if (userId) {
                      window.location.href = '/vault/dashboard'
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                >
                  Get Started Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ManageMode({
  onSwitchMode,
  onUpload,
  userId,
  isAdmin,
  onLogin,
  onSignup,
  onLogout,
}: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white">Immersive Media</h1>
              <p className="text-xs text-white/60">Experience content like never before</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userId ? (
              <>
                <Button
                  onClick={() => window.location.href = '/vault/dashboard'}
                  variant="outline"
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                >
                  <Database className="w-4 h-4 mr-2" />
                  My Vault
                </Button>
                <Button
                  onClick={() => {
                    setIsPlaying(false)
                    setUser(null, false)
                    window.location.href = '/'
                  }}
                  variant="outline"
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onLogin}
                  variant="outline"
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                >
                  Sign in
                </Button>
                <Button
                  onClick={onSignup}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Immersive Content
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/80"
          >
            Discover, upload, and experience media in a whole new way.
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                onClick={onUpload}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Content
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                onClick={onSwitchMode}
                variant="outline"
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Enter Fullscreen
              </Button>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            {[
              {
                icon: Zap,
                title: 'Auto-Rotation',
                description: 'Content automatically rotates with customizable timers',
              },
              {
                icon: Shield,
                title: 'Smart Safety',
                description: 'AI-powered NSFW detection keeps your platform safe',
              },
              {
                icon: Database,
                title: 'Personal Vault',
                description: 'Manage your private content with powerful tools',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <feature.icon className="w-10 h-10 text-purple-600 mx-auto mb-4" />
                <h3 className="text-slate-900 dark:text-slate-400 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-12"
          >
            {userId && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => window.location.href = '/vault/dashboard?tab=settings'}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Database className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </motion.button>
            )}
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => window.location.href = '/admin/dashboard'}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-500 transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm">Admin</span>
              </motion.button>
            )}
          </motion.div>

          {userId && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={onLogout}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="bg-black/30 backdrop-blur-md border-t border-white/10 px-6 py-4">
        <div className="flex items-center justify-center gap-8 max-w-7xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              if (userId) {
                window.location.href = '/vault/dashboard'
              } else {
                onLogin()
              }
            }}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Database className="w-5 h-5" />
            <span className="text-sm">My Vault</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={userId ? onSignup : onUpload}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            {userId ? (
              <>
                <Database className="w-5 h-5" />
                <span className="text-sm">Sign up</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-sm">Upload</span>
              </>
            )}
          </motion.button>
          {userId && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => window.location.href = '/vault/dashboard?tab=settings'}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Database className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
