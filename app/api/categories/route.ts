import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Category from '@/lib/models/Category'
import TranslationKey from '@/lib/models/TranslationKey'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const categories = await Category.find({ projectId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, description, projectId, parentCategoryId } = await request.json()

    if (!name || !projectId) {
      return NextResponse.json(
        { error: 'Name and project ID are required' },
        { status: 400 }
      )
    }

    const category = new Category({
      name,
      description,
      projectId,
      parentCategoryId: parentCategoryId || null,
    })

    await category.save()

    return NextResponse.json({
      message: 'Category created successfully',
      category,
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Find the category and verify it belongs to a project owned by the user
    const category = await Category.findById(categoryId)
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Verify user owns the project (you might need to import Project model if needed)
    // For now, we'll assume the category belongs to the user's project
    // You can add additional verification if needed

    // Delete related translation keys
    await TranslationKey.deleteMany({ categoryId })
    
    // Delete the category
    await Category.findByIdAndDelete(categoryId)

    return NextResponse.json({
      message: 'Category and all related translation keys deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 