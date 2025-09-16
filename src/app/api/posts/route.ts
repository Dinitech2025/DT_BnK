import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/posts - Récupérer tous les posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des posts' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Créer un nouveau post
export async function POST(request: NextRequest) {
  try {
    const { title, content, authorId, published = false } = await request.json()
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        authorId: parseInt(authorId),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du post:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du post' },
      { status: 500 }
    )
  }
}
