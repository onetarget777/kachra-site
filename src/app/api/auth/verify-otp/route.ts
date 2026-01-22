import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { otpStore } from '../forgot-password/route'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Check OTP
    const storedOtp = otpStore.get(email)

    if (!storedOtp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Check if OTP expired
    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(email)
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify OTP matches
    if (storedOtp.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Generate new random password
    const newPassword = crypto.randomBytes(12).toString('base64').slice(0, 16)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await db.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Remove used OTP
    otpStore.delete(email)

    // Return the new password (in production, send via email instead)
    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
      // Dev only: return new password for testing (remove in production)
      newPassword: process.env.NODE_ENV !== 'production' ? newPassword : undefined,
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
