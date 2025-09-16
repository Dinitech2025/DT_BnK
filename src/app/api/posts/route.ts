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
            email: true,
            avatar: true
          }
        },
        files: {
          include: {
            file: {
              select: {
                id: true,
                filename: true,
                path: true,
                thumbnail: true,
                mimeType: true,
                category: true,
                size: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            files: true
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
    const { 
      title, 
      content, 
      excerpt,
      authorId, 
      published = false,
      featured = false,
      fileIds = [],
      tagIds = []
    } = await request.json()
    
    if (!title || !authorId) {
      return NextResponse.json(
        { error: 'Le titre et l\'auteur sont obligatoires' },
        { status: 400 }
      )
    }

    // Créer le post avec toutes ses relations
    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt,
        published,
        featured,
        authorId: parseInt(authorId),
        // Relier les fichiers si fournis
        ...(fileIds.length > 0 && {
          files: {
            create: fileIds.map((fileId: number, index: number) => ({
              fileId,
              order: index
            }))
          }
        }),
        // Relier les tags si fournis
        ...(tagIds.length > 0 && {
          tags: {
            create: tagIds.map((tagId: number) => ({
              tagId
            }))
          }
        })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        files: {
          include: {
            file: {
              select: {
                id: true,
                filename: true,
                path: true,
                thumbnail: true,
                mimeType: true,
                category: true,
                size: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            files: true
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
