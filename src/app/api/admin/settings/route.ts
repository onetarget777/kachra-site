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

    const admin = await db.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    if (!admin?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    let settings = await db.siteSettings.findFirst()

    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          guestUploadLimit: 100,
          userUploadLimit: 500,
          poolDays: 30,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })

  } catch (error) {
    console.error('Admin settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const adminId = searchParams.get('userId')
    const body = await request.json()

    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const admin = await db.user.findUnique({
      where: { id: adminId },
      select: { isAdmin: true },
    })

    if (!admin?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    let settings = await db.siteSettings.findFirst()

    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          guestUploadLimit: 100,
          userUploadLimit: 500,
          poolDays: 30,
        },
      })
    }

    const { guestUploadLimit, userUploadLimit, poolDays, maintenanceMode } = body

    const updateData: any = {}
    if (guestUploadLimit !== undefined) updateData.guestUploadLimit = guestUploadLimit
    if (userUploadLimit !== undefined) updateData.userUploadLimit = userUploadLimit
    if (poolDays !== undefined) updateData.poolDays = poolDays

    const updatedSettings = await db.siteSettings.update({
      where: { id: settings.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updatedSettings,
    })

  } catch (error) {
    console.error('Admin settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
