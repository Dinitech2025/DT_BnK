import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
            createdAt: true
          }
        },
        files: {
          select: {
            id: true,
            filename: true,
            category: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            posts: true,
            files: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const { name, email, avatar } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'L\'email est obligatoire' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        avatar
      },
      include: {
        _count: {
          select: {
            posts: true,
            files: true,
            comments: true
          }
        }
      }
    })

    return NextResponse.json(user, { status: 201 })
    
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    
    // Vérifier si c'est une erreur de duplication d'email
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}
