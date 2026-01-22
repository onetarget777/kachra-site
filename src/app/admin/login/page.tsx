'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, Mail, X, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const { setUser } = useAppStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForcePasswordChange, setShowForcePasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [user, setUserState] = useState<any>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUserState(data.user)

        if (data.user.mustChangePassword) {
          setShowForcePasswordChange(true)
        } else {
          setUser(data.user.id, data.user.isAdmin)
          window.location.href = '/admin/dashboard'
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(user.id, user.isAdmin)
        window.location.href = '/admin/dashboard'
      } else {
        setError(data.error || 'Password change failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!showForcePasswordChange ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => window.location.href = '/'}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            {/* Admin Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl mb-4">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Access
              </h1>
              <p className="text-slate-400">
                Secure management console
              </p>
            </motion.div>

            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-purple-200 dark:border-purple-800"
            >
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@zoibox.com"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••••"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 text-base font-semibold"
                >
                  {loading ? 'Authenticating...' : 'Access Admin Panel'}
                </Button>
              </form>

              {/* Default Credentials */}
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">Default Admin Credentials:</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Email:</span>
                    <code className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded font-mono">info@zoibox.com</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Password:</span>
                    <code className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded font-mono">admin123</code>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                  Note: You will be required to change this password on first login
                </p>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                  <strong className="text-red-600 dark:text-red-400">SECURITY NOTICE:</strong> All admin actions are logged.
                  Failed login attempts are monitored and reported.
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="password-change"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Force Password Change Card */}
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-yellow-200 dark:border-yellow-800"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Security Alert
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  You are using the default admin password. You must change it before accessing the admin panel.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="•••••••••"
                      className="pl-10 h-11"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="•••••••••"
                      className="pl-10 h-11"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 h-11 text-base font-semibold"
                >
                  {loading ? 'Updating...' : 'Change Password & Continue'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
