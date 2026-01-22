import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signupOtpStore } from '../signup/route'

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
    const storedOtp = signupOtpStore.get(email)

    if (!storedOtp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Check if OTP expired
    if (Date.now() > storedOtp.expiresAt) {
      signupOtpStore.delete(email)
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

    // Create user in database
    const user = await db.user.create({
      data: storedOtp.userData,
    })

    // Remove used OTP
    signupOtpStore.delete(email)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      userId: user.id,
    })

    // Set session cookie
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 1 day
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Verify signup OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
