import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectToDatabase from '@/lib/db'
import { Source } from '@/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const { id } = await params
    const source = await Source.findById(id)
    
    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(source)
    
  } catch (error) {
    console.error('❌ Error fetching source:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const { id } = await params
    const updateData = await request.json()
    
    // Validate that we're not duplicating names or URLs
    if (updateData.name || updateData.url) {
      const existingSource = await Source.findOne({
        _id: { $ne: id },
        $or: [
          ...(updateData.name ? [{ name: updateData.name }] : []),
          ...(updateData.url ? [{ url: updateData.url }] : [])
        ]
      })

      if (existingSource) {
        return NextResponse.json(
          { error: 'Source with this name or URL already exists' },
          { status: 409 }
        )
      }
    }
    
    const updatedSource = await Source.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    )
    
    if (!updatedSource) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }
    
    console.log(`✅ Updated source: ${updatedSource.name}`)
    
    return NextResponse.json(updatedSource)
    
  } catch (error) {
    console.error('❌ Error updating source:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const { id } = await params
    const deletedSource = await Source.findByIdAndDelete(id)
    
    if (!deletedSource) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }
    
    console.log(`✅ Deleted source: ${deletedSource.name}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Source "${deletedSource.name}" deleted successfully` 
    })
    
  } catch (error) {
    console.error('❌ Error deleting source:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
