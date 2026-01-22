import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// In-memory OTP storage (in production, use database or Redis)
const otpStore = new Map<string, { otp: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Registered email not available' },
        { status: 404 }
      )
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()

    // Store OTP with 30-minute expiry
    const expiresAt = Date.now() + 30 * 60 * 1000 // 30 minutes
    otpStore.set(email, { otp, expiresAt })

    // In a real implementation, send email with OTP
    // For now, log the OTP (in production, use email service like SendGrid, Mailgun, etc.)
    console.log(`OTP for ${email}: ${otp} (valid for 30 minutes)`)

    // Clean up expired OTPs
    const now = Date.now()
    for (const [key, value] of otpStore.entries()) {
      if (value.expiresAt < now) {
        otpStore.delete(key)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      // Dev only: return OTP for testing (remove in production)
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export OTP store for use in verify-otp endpoint
export { otpStore }
