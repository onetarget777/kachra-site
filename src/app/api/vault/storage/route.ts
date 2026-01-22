import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let siteSettings = await db.siteSettings.findFirst()
    if (!siteSettings) {
      siteSettings = await db.siteSettings.create({
        data: {
          guestUploadLimit: 100,
          userUploadLimit: 500,
          poolDays: 30,
        },
      })
    }

    const totalStorageUsed = await db.content.aggregate({
      where: { userId },
      _sum: { fileSize: true },
    })

    const used = totalStorageUsed._sum.fileSize || 0
    const limit = user.uploadLimit * 1024 * 1024
    const remaining = Math.max(0, limit - used)
    const usedPercentage = limit > 0 ? Math.round((used / limit) * 100) : 0

    const files = await db.content.findMany({
      where: { userId },
      select: {
        id: true,
        fileType: true,
        isPrivate: true,
      },
    })

    const fileStats = {
      total: files.length,
      private: files.filter((f) => f.isPrivate).length,
      public: files.filter((f) => !f.isPrivate).length,
    }

    const totalViews = await db.content.aggregate({
      where: { userId },
      _sum: { views: true },
    })

    const totalLikes = await db.like.count({
      where: {
        content: { userId },
      },
    })

    const isGuest = user.email.includes('@guest') || user.email.startsWith('guest')
    const defaultLimit = isGuest ? siteSettings.guestUploadLimit : siteSettings.userUploadLimit
    const currentLimit = user.uploadLimit || defaultLimit

    return NextResponse.json({
      success: true,
      data: {
        storage: {
          used,
          limit: currentLimit * 1024 * 1024,
          remaining: (currentLimit * 1024 * 1024) - used,
          usedPercentage,
          allocatedMB: currentLimit,
          usedMB: Math.round(used / 1024 / 1024),
          remainingMB: Math.round(((currentLimit * 1024 * 1024) - used) / 1024 / 1024),
          defaultLimitMB: defaultLimit,
          isGuest,
          siteSettings: {
            guestLimitMB: siteSettings.guestUploadLimit,
            userLimitMB: siteSettings.userUploadLimit,
            poolDays: siteSettings.poolDays,
          },
        },
        files: fileStats,
        engagement: {
          totalViews: totalViews._sum.views || 0,
          totalLikes,
        },
        user: {
          poolDays: user.poolDays || siteSettings.poolDays,
          uploadLimit: user.uploadLimit || defaultLimit,
        },
      },
    })

  } catch (error) {
    console.error('Vault storage error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storage info' },
      { status: 500 }
    )
  }
}
