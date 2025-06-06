import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import connectToDatabase from '../../../../lib/db'
import Article from '../../../../models/Article'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const { id } = await params
    const deletedArticle = await Article.findByIdAndDelete(id)
    
    if (!deletedArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    console.log(`✅ Deleted article: ${deletedArticle.title}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Article "${deletedArticle.title}" deleted successfully` 
    })
    
  } catch (error) {
    console.error('❌ Error deleting article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
