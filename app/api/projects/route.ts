import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Project from '@/lib/models/Project'
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

    const projects = await Project.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
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

    const { name, description, mainLanguage, languages } = await request.json()

    if (!name || !mainLanguage) {
      return NextResponse.json(
        { error: 'Name and main language are required' },
        { status: 400 }
      )
    }

    const project = new Project({
      name,
      description,
      mainLanguage,
      languages: languages || [mainLanguage],
      userId: user.userId,
    })

    await project.save()

    return NextResponse.json({
      message: 'Project created successfully',
      project,
    })
  } catch (error) {
    console.error('Error creating project:', error)
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
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Verify the project belongs to the user
    const project = await Project.findOne({ _id: projectId, userId: user.userId })
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Delete related categories and translation keys
    await Category.deleteMany({ projectId })
    await TranslationKey.deleteMany({ projectId })
    
    // Delete the project
    await Project.findByIdAndDelete(projectId)

    return NextResponse.json({
      message: 'Project and all related data deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 