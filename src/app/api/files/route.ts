import { NextRequest, NextResponse } from 'next/server'
import { prisma, FileUtils } from '@/lib/prisma'
import { FileManager } from '@/lib/fileManager'

// GET /api/files - Récupérer tous les fichiers
export async function GET() {
  try {
    const files = await prisma.file.findMany({
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        postFiles: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                published: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Enrichir les données avec les URLs formatées
    const enrichedFiles = files.map(file => ({
      ...file,
      url: FileUtils.getFileUrl(file.path),
      thumbnailUrl: file.thumbnail ? FileUtils.getFileUrl(file.thumbnail) : null,
      formattedSize: FileUtils.formatFileSize(file.size),
      categoryLabel: file.category.toLowerCase()
    }))

    return NextResponse.json(enrichedFiles)
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fichiers' },
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
    const categoryOverride = formData.get('category') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Déterminer la catégorie du fichier
    const category = categoryOverride || FileUtils.getFileCategory(file.type).toLowerCase()
    
    // Valider le type de fichier
    if (!FileUtils.isValidFileType(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non autorisé: ${file.type}` },
        { status: 400 }
      )
    }

    // Upload du fichier avec le FileManager
    const uploadResult = await FileManager.uploadFile(
      file, 
      category as 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
    )

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      )
    }

    // Générer le nom stocké
    const storedName = FileUtils.generateFileName(file.name)

    // Sauvegarder les métadonnées dans la base de données avec Prisma
    const fileRecord = await prisma.file.create({
      data: {
        filename: file.name,
        storedName: storedName,
        mimeType: file.type,
        size: BigInt(file.size),
        path: uploadResult.filePath!,
        thumbnail: uploadResult.thumbnailPath || null,
        category: FileUtils.getFileCategory(file.type),
        width: uploadResult.metadata?.width || null,
        height: uploadResult.metadata?.height || null,
        duration: uploadResult.metadata?.duration || null,
        userId: userId ? parseInt(userId) : null
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    // Formater la réponse
    const response = {
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        url: FileUtils.getFileUrl(fileRecord.path),
        thumbnailUrl: fileRecord.thumbnail ? FileUtils.getFileUrl(fileRecord.thumbnail) : null,
        size: Number(fileRecord.size),
        formattedSize: FileUtils.formatFileSize(fileRecord.size),
        mimeType: fileRecord.mimeType,
        category: fileRecord.category,
        categoryLabel: fileRecord.category.toLowerCase(),
        width: fileRecord.width,
        height: fileRecord.height,
        duration: fileRecord.duration,
        uploadedBy: fileRecord.uploadedBy,
        createdAt: fileRecord.createdAt
      }
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/files/[id] - Supprimer un fichier
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const fileId = url.searchParams.get('id')

    if (!fileId) {
      return NextResponse.json(
        { error: 'ID du fichier manquant' },
        { status: 400 }
      )
    }

    // Récupérer les infos du fichier
    const file = await prisma.file.findUnique({
      where: { id: parseInt(fileId) }
    })

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le fichier physique
    const deleted = await FileManager.deleteFile(file.path)
    
    if (deleted) {
      // Supprimer l'enregistrement de la base de données
      await prisma.file.delete({
        where: { id: parseInt(fileId) }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Fichier supprimé avec succès' 
      })
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du fichier' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
