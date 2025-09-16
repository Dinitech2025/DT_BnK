import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        posts (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      )
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'L\'email est obligatoire' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
      }])
      .select()
      .single()

    if (error) {
      console.error('Erreur Supabase:', error)
      
      // Vérifier si c'est une erreur de duplication d'email
      if (error.code === '23505') {
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
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
