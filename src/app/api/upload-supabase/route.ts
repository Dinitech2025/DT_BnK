import { NextRequest, NextResponse } from 'next/server'
import { SupabaseStorage } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

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
      IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime'],
      DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg']
    }

    const fileCategory = category.toUpperCase() as keyof typeof allowedTypes
    if (!allowedTypes[fileCategory]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non autorisé: ${file.type}` },
        { status: 400 }
      )
    }

    // Générer un nom unique pour le fichier
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const bucket = getBucketByCategory(fileCategory)
    const filePath = `${fileCategory.toLowerCase()}/${fileName}`

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

    // Obtenir les métadonnées du fichier
    let width: number | undefined
    let height: number | undefined
    let duration: number | undefined

    // Pour les images, essayer d'obtenir les dimensions
    if (fileCategory === 'IMAGE' && file.type.startsWith('image/')) {
      try {
        const imageMetadata = await getImageMetadata(file)
        width = imageMetadata.width
        height = imageMetadata.height
      } catch (error) {
        console.warn('Impossible d\'obtenir les métadonnées de l\'image:', error)
      }
    }

    // Sauvegarder les métadonnées dans la base de données
    const fileRecord = await prisma.file.create({
      data: {
        filename: file.name,
        storedName: fileName,
        mimeType: file.type,
        size: BigInt(file.size),
        path: uploadResult.data!.publicUrl,
        category: fileCategory,
        userId: userId ? parseInt(userId) : null,
        width,
        height,
        duration
      }
    })

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        url: uploadResult.data!.publicUrl,
        size: Number(fileRecord.size),
        mimeType: fileRecord.mimeType,
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

// Obtenir le bucket approprié selon la catégorie
function getBucketByCategory(category: string): string {
  switch (category) {
    case 'IMAGE':
      return 'images'
    case 'VIDEO':
      return 'videos'
    case 'DOCUMENT':
      return 'documents'
    case 'AUDIO':
      return 'audio'
    default:
      return 'files'
  }
}

// Obtenir les métadonnées d'une image
async function getImageMetadata(file: File): Promise<{width: number, height: number}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Impossible de charger l\'image'))
    }
    
    img.src = url
  })
}

