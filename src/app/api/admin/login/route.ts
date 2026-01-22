import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Default admin credentials
const DEFAULT_ADMIN_EMAIL = 'info@zoibox.com'
const DEFAULT_ADMIN_PASSWORD = 'admin123'

// Ensure default admin exists
async function ensureDefaultAdmin() {
  const existingAdmin = await db.user.findUnique({
    where: { email: DEFAULT_ADMIN_EMAIL },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10)

    await db.user.create({
      data: {
        id: 'admin-default',
        email: DEFAULT_ADMIN_EMAIL,
        username: 'admin',
        name: 'System Administrator',
        password: hashedPassword,
        isAdmin: true,
        uploadLimit: 999999,
        storageUsed: 0,
        poolDays: 365,
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    await ensureDefaultAdmin()

    const admin = await db.user.findUnique({
      where: { email },
    })

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, admin.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isDefaultPassword = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, admin.password)

    await db.activityLog.create({
      data: {
        action: 'admin_login',
        details: JSON.stringify({ email, forcedPasswordChange: isDefaultPassword }),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        userId: admin.id,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        name: admin.name,
        isAdmin: true,
        mustChangePassword: isDefaultPassword,
      },
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate admin' },
      { status: 500 }
    )
  }
}
