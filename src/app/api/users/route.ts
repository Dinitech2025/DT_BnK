import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true
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
    const { name, email } = await request.json()
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}
