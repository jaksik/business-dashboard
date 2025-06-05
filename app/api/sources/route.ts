import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectToDatabase from '@/lib/db'
import { Source } from '@/models'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const { name, url, type, isActive } = await request.json()
    
    // Validate required fields
    if (!name || !url || !type) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, url, type' 
      }, { status: 400 })
    }

    // Check if source already exists
    const existingSource = await Source.findOne({ 
      $or: [
        { url: url },
        { name: name }
      ]
    })

    if (existingSource) {
      return NextResponse.json({ 
        success: false, 
        error: 'Source with this name or URL already exists' 
      }, { status: 409 })
    }

    // Create new source
    const newSource = await Source.create({
      name,
      url,
      type,
      isActive: isActive !== undefined ? isActive : true,
      fetchStatus: {
        lastFetchedAt: null,
        lastFetchStatus: null,
        lastFetchMessage: null,
        lastFetchError: null,
        lastFetchSavedArticles: null
      }
    })

    console.log(`✅ Created new source: ${name}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Source "${name}" created successfully`,
      source: newSource
    })
    
  } catch (error) {
    console.error('❌ Error creating source:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const sources = await Source.find({}).sort({ createdAt: -1 })
    
    return NextResponse.json(sources)
    
  } catch (error) {
    console.error('❌ Error fetching sources:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}