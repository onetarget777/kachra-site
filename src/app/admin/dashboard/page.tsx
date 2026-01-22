'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import {
  Users,
  Database,
  Shield,
  HardDrive,
  RefreshCw,
  LogOut,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const { userId, setUser } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (userId) {
      fetchStats()
    }
  }, [userId])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/metrics?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null, false)
    window.location.href = '/admin/login'
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Shield className="w-16 h-16 text-purple-500 mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">Please log in to access admin panel</p>
          <Button
            onClick={() => window.location.href = '/admin/login'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go to Login
          </Button>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Management Console</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchStats}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Users', value: stats?.users?.total || 0, icon: Users, color: 'blue' },
              { label: 'Total Content', value: stats?.content?.total || 0, icon: Database, color: 'purple' },
              { label: 'Total Views', value: stats?.engagement?.totalViews || 0, icon: Database, color: 'green' },
              { label: 'Total Likes', value: stats?.engagement?.totalLikes || 0, icon: Database, color: 'pink' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                  stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  stat.color === 'purple' ? 'from-purple-600 to-pink-600' :
                  stat.color === 'green' ? 'from-green-500 to-green-600' :
                  'from-pink-500 to-pink-600'
                } flex items-center justify-center mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value.toLocaleString()}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => window.location.href = '/vault/dashboard'}
              className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl text-white text-left hover:scale-105 transition-transform"
            >
              <Database className="w-8 h-8 mb-2" />
              <div>
                <p className="font-bold text-lg">User Vault</p>
                <p className="text-white/80 text-sm">Manage user content and settings</p>
              </div>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => window.location.href = '/'}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl text-left hover:scale-105 transition-transform border border-slate-200 dark:border-slate-800"
            >
              <Shield className="w-8 h-8 mb-2 text-purple-600" />
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">Manage Mode</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Switch to manage mode</p>
              </div>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl text-left hover:scale-105 transition-transform border border-slate-200 dark:border-slate-800"
            >
              <HardDrive className="w-8 h-8 mb-2 text-blue-600" />
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">System Settings</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Configure platform settings</p>
              </div>
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  )
}
