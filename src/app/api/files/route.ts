import { NextRequest, NextResponse } from 'next/server'
import { supabase, SupabaseStorage } from '@/lib/supabase'

// GET /api/files - Récupérer tous les fichiers
export async function GET() {
  try {
    const { data: files, error } = await supabase
      .from('files')
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
        { error: 'Erreur lors de la récupération des fichiers' },
        { status: 500 }
      )
    }

    return NextResponse.json(files)
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/files - Upload d'un fichier
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const category = formData.get('category') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validation du type de fichier
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
    }

    const fileCategory = (category || 'document').toLowerCase()
    if (allowedTypes[fileCategory as keyof typeof allowedTypes] && 
        !allowedTypes[fileCategory as keyof typeof allowedTypes].includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non autorisé: ${file.type}` },
        { status: 400 }
      )
    }

    // Générer un nom unique pour le fichier
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const bucket = `${fileCategory}s` // images, videos, documents, etc.
    const filePath = `${fileName}`

    // Upload vers Supabase Storage
    const uploadResult = await SupabaseStorage.uploadFile({
      bucket,
      path: filePath,
      file
    })

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: `Échec de l'upload: ${uploadResult.error}` },
        { status: 500 }
      )
    }

    // Sauvegarder les métadonnées dans la base de données
    const { data: fileRecord, error } = await supabase
      .from('files')
      .insert([{
        filename: file.name,
        stored_name: fileName,
        mime_type: file.type,
        file_size: file.size,
        file_path: uploadResult.data!.publicUrl,
        category: fileCategory,
        user_id: userId ? parseInt(userId) : null,
      }])
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la sauvegarde des métadonnées:', error)
      // Supprimer le fichier uploadé en cas d'erreur DB
      await SupabaseStorage.deleteFile(bucket, filePath)
      
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde des métadonnées' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        url: uploadResult.data!.publicUrl,
        size: fileRecord.file_size,
        mimeType: fileRecord.mime_type,
        category: fileRecord.category
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
