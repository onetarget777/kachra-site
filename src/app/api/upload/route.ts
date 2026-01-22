import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import crypto from 'crypto'

// POST /api/upload - Handle file upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string | null
    const isNSFW = formData.get('isNSFW') === 'true'
    const isPrivate = formData.get('isPrivate') === 'true'
    const autoGenerateShareLink = formData.get('autoGenerateShareLink') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Determine upload limit based on user status
    let uploadLimit: number
    let isGuest = false

    if (!userId) {
      // Guest upload limit: 100MB
      uploadLimit = 100 * 1024 * 1024 // 100MB in bytes
      isGuest = true
    } else {
      // Verify user exists
      const user = await db.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Registered user upload limit: 500MB (or user's custom limit)
      uploadLimit = (user.uploadLimit || 500) * 1024 * 1024 // 500MB in bytes
    }

    // Calculate current storage usage
    const currentUsage = userId ? await db.content.aggregate({
      where: { userId },
      _sum: { fileSize: true },
    }) : { _sum: { fileSize: 0 } }
    const usedBytes = currentUsage._sum.fileSize || 0

    if (usedBytes + file.size > uploadLimit) {
      return NextResponse.json(
        { error: 'Storage limit exceeded. Guest: 100MB, Registered: 500MB' },
        { status: 413 }
      )
    }

    // Read file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filename = `${timestamp}.${ext}`

    // Save to uploads directory
    const fs = require('fs')
    const path = require('path')
    const uploadsDir = path.join(process.cwd(), 'uploads')

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const filePath = path.join(uploadsDir, filename)
    fs.writeFileSync(filePath, buffer)

    // NSFW Detection using ZAI Vision API
    let finalNSFW = false
    let nsfwProbability = 0

    // If user marks content as NSFW, skip detection
    if (isNSFW) {
      finalNSFW = true
      nsfwProbability = 100
    } else {
      // Auto-detect NSFW
      try {
        const zai = ZAI.default.create({
          apiKey: process.env.ZAI_API_KEY || '',
        })

        const base64 = buffer.toString('base64')
        const dataUrl = `data:${file.type};base64,${base64}`

        const response = await zai.chat.completions.create({
          model: 'vision',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl,
                  },
                },
                {
                  type: 'text',
                  text: 'Analyze this image for NSFW content. Rate from 0 to 100. 0 means completely safe, 100 means explicit adult content. Respond with a number only.',
                },
              ],
            },
          ],
          max_tokens: 10,
        })

        const score = parseInt(response.choices[0]?.message?.content?.trim() || '0')
        nsfwProbability = Math.min(100, Math.max(0, score))
        finalNSFW = nsfwProbability > 50
      } catch (error) {
        console.error('NSFW detection error:', error)
        // Default to safe if detection fails
        finalNSFW = false
        nsfwProbability = 0
      }
    }

    // Generate short share link if requested
    let shareLink = null
    if (autoGenerateShareLink) {
      // Generate a unique short code
      const shortCode = crypto.randomBytes(6).toString('hex').slice(0, 8)
      shareLink = `https://zoibox.com/s/${shortCode}`
    }

    // Create content record
    const content = await db.content.create({
      data: {
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: `/uploads/${filename}`,
        isNSFW: finalNSFW,
        nsfwProbability,
        isPrivate,
        views: 0,
        userId: userId || null,
      },
    })

    // Create share link record if needed
    if (shareLink && content.id) {
      await db.shareLink.create({
        data: {
          shortCode: shareLink.split('/').pop(),
          contentId: content.id,
          userId: userId || null,
          views: 0,
        },
      })
    }

    // Update user storage used
    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          storageUsed: Math.ceil((usedBytes + file.size) / 1024 / 1024), // Convert to MB
        },
      })
    }

    // Log upload
    await db.activityLog.create({
      data: {
        action: 'upload',
        details: JSON.stringify({
          filename: file.name,
          size: file.size,
          isNSFW: finalNSFW,
          isPrivate,
          isGuest,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        userId: userId || null,
        contentId: content.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: content.id,
        filename: content.filename,
        fileType: content.fileType,
        fileSize: content.fileSize,
        filePath: content.filePath,
        isNSFW: content.isNSFW,
        nsfwProbability: content.nsfwProbability,
        isPrivate: content.isPrivate,
        shareLink: shareLink || null,
        isGuest,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
