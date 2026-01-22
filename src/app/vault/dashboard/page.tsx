'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import {
  Database,
  HardDrive,
  Upload,
  LogOut,
  ArrowLeft,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VaultDashboard() {
  const { userId, setUser } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [vaultData, setVaultData] = useState<any>(null)

  useEffect(() => {
    if (userId) {
      fetchVaultData()
    }
  }, [userId])

  const fetchVaultData = async () => {
    try {
      const response = await fetch(`/api/vault/storage?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setVaultData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch vault data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null, false)
    window.location.href = '/'
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Database className="w-16 h-16 text-purple-600 mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Vault Access Required</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You must be logged in to access your vault.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Go to Login
          </Button>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Vault</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your private control space</p>
              </div>
            </div>

            {/* Back to Site */}
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="hidden sm:flex"
            >
              <Database className="w-4 h-4 mr-2" />
              View Site
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {[
              {
                label: 'Storage Used',
                value: `${vaultData?.storage?.usedMB || 0} MB`,
                icon: HardDrive,
                color: 'blue',
                subtext: `${vaultData?.storage?.remainingMB || 0} MB remaining`,
              },
              {
                label: 'Total Files',
                value: vaultData?.files?.total?.toLocaleString() || '0',
                icon: Database,
                color: 'purple',
                subtext: `${vaultData?.files?.private || 0} private`,
              },
              {
                label: 'Total Views',
                value: vaultData?.engagement?.totalViews?.toLocaleString() || '0',
                icon: Database,
                color: 'green',
                subtext: `${vaultData?.engagement?.totalLikes || 0} likes`,
              },
              {
                label: 'Storage Limit',
                value: `${vaultData?.storage?.allocatedMB || 0} MB`,
                icon: Database,
                color: 'pink',
                subtext: `${vaultData?.storage?.usedPercentage || 0}% used`,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                  stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  stat.color === 'purple' ? 'from-purple-600 to-pink-600' :
                  stat.color === 'green' ? 'from-green-500 to-green-600' :
                  stat.color === 'pink' ? 'from-pink-500 to-pink-600' :
                  'from-purple-500 to-purple-600'
                } flex items-center justify-center mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.subtext}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.multiple = true
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files
                  if (files && files.length > 0) {
                    // Upload files would go here
                    alert('Upload functionality - will open file picker')
                  }
                }
                input.click()
              }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl text-white text-left hover:scale-105 transition-transform"
            >
              <Upload className="w-8 h-8 mb-2" />
              <div>
                <p className="font-bold text-lg">Upload Files</p>
                <p className="text-white/80 text-sm">Add new content to your vault</p>
              </div>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => window.location.href = '/'}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl text-left hover:scale-105 transition-transform border border-slate-200 dark:border-slate-800"
            >
              <Database className="w-8 h-8 mb-2 text-purple-600" />
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">My Files</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">View and manage your files</p>
              </div>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl text-left hover:scale-105 transition-transform border border-slate-200 dark:border-slate-800"
            >
              <Settings className="w-8 h-8 mb-2 text-blue-600" />
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">Settings</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Configure your preferences</p>
              </div>
            </motion.button>
          </div>

          {/* Plan Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Your Plan</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {vaultData?.storage?.isGuest ? 'Guest Account' : 'Registered User'}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <HardDrive className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Storage Used</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {vaultData?.storage?.usedMB || 0}
                  <span className="text-lg text-slate-500">MB</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Storage Limit</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {vaultData?.storage?.allocatedMB || 0}
                  <span className="text-lg text-slate-500">MB</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Free Space</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {vaultData?.storage?.remainingMB || 0}
                  <span className="text-lg text-green-700 dark:text-green-700">MB</span>
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Default limits: <strong>{vaultData?.storage?.siteSettings?.guestLimitMB || 100} MB</strong> (Guest) / <strong>{vaultData?.storage?.siteSettings?.userLimitMB || 500} MB</strong> (Registered)
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
