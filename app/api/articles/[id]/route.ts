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

export async function PATCH(
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
    const { newsCategory, techCategory, rationale, isTrainingData } = await request.json()

    // Get the current article data before updating
    const currentArticle = await Article.findById(id)
    if (!currentArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }


    // Check if this is actually a correction (AI had categorized it before)
    const isCorrection = currentArticle.categorization.status === 'completed' && 
                        (currentArticle.categorization.categories.news || currentArticle.categorization.categories.tech)

    // If this is a correction, log it to CategoryCorrection collection


    // Build update object
    const updateObj: Record<string, unknown> = {}
    
    if (newsCategory) {
      updateObj['categorization.categories.news'] = newsCategory
    }
    
    if (techCategory) {
      updateObj['categorization.categories.tech'] = techCategory
    }
    
    if (rationale !== undefined) {
      updateObj['categorization.rationale'] = rationale
    }

    if (isTrainingData !== undefined) {
      updateObj['categorization.isTrainingData'] = isTrainingData
    }

    // Always update the status and timestamp when categories are provided
    if (newsCategory || techCategory) {
      updateObj['categorization.status'] = 'completed'
      updateObj['categorization.categorizedAt'] = new Date()
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true, runValidators: true }
    )
    
    if (!updatedArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    console.log(`✅ Updated article categorization: ${updatedArticle.title}`)
    if (isCorrection) {
      console.log(`📊 Logged correction for analysis`)
    }
    
    return NextResponse.json({ 
      success: true, 
      article: updatedArticle,
      correctionLogged: isCorrection,
      message: 'Article categorization updated successfully' 
    })
    
  } catch (error) {
    console.error('❌ Error updating article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
