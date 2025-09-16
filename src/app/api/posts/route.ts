import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/posts - Récupérer tous les posts
export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des posts' },
        { status: 500 }
      )
    }

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Créer un nouveau post
export async function POST(request: NextRequest) {
  try {
    const { title, content, authorId, published = false } = await request.json()
    
    if (!title || !authorId) {
      return NextResponse.json(
        { error: 'Le titre et l\'auteur sont obligatoires' },
        { status: 400 }
      )
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert([{
        title,
        content,
        published,
        author_id: authorId,
      }])
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création du post' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du post:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
