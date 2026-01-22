import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newPassword } = body

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const admin = await db.user.findUnique({
      where: { id: userId },
    })

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    await db.activityLog.create({
      data: {
        action: 'admin_password_changed',
        details: JSON.stringify({ userId }),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        userId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })

  } catch (error) {
    console.error('Admin password change error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
