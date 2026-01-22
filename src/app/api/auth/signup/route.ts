import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// In-memory OTP storage (in production, use database or Redis)
const signupOtpStore = new Map<string, { otp: string; expiresAt: number; userData: any }>()

export async function POST(request: NextRequest) {
  try {
    const { fullName, userName, email, password } = await request.json()

    // Validate required fields
    if (!fullName || !userName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { userName },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()

    // Store OTP with user data and 30-minute expiry
    const expiresAt = Date.now() + 30 * 60 * 1000 // 30 minutes
    signupOtpStore.set(email, {
      otp,
      expiresAt,
      userData: {
        id: crypto.randomUUID(),
        fullName,
        userName,
        email,
        password: hashedPassword,
        isAdmin: false,
        uploadLimit: 500 * 1024 * 1024, // 500MB for registered users
        poolDays: 30,
      },
    })

    // Clean up expired OTPs
    const now = Date.now()
    for (const [key, value] of signupOtpStore.entries()) {
      if (value.expiresAt < now) {
        signupOtpStore.delete(key)
      }
    }

    // In a real implementation, send email with OTP
    // For now, log to console (in production, use email service)
    console.log(`Signup OTP for ${email}: ${otp} (valid for 30 minutes)`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      // Dev only: return OTP for testing (remove in production)
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export OTP store for use in verify-signup-otp endpoint
export { signupOtpStore }
