import { writeFile, mkdir, unlink, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

// Configuration des uploads
export const UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
    document: [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 
      'text/csv'
    ],
    archive: ['application/zip', 'application/x-rar-compressed', 'application/gzip']
  },
  thumbnailSizes: {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 800, height: 600 }
  }
}

// Interface pour les résultats d'upload
export interface UploadResult {
  success: boolean
  filePath?: string
  thumbnailPath?: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    size: number
  }
  error?: string
}

// Classe principale pour la gestion des fichiers
export class FileManager {
  private static uploadDir = path.join(process.cwd(), 'public', 'uploads')

  // Initialiser les répertoires d'upload
  static async initDirectories(): Promise<void> {
    const categories = ['image', 'video', 'audio', 'document', 'archive', 'other']
    const subdirs = ['original', 'thumbnails']

    for (const category of categories) {
      for (const subdir of subdirs) {
        const dirPath = path.join(this.uploadDir, category, subdir)
        if (!existsSync(dirPath)) {
          await mkdir(dirPath, { recursive: true })
        }
      }
    }
  }

  // Upload d'un fichier
  static async uploadFile(
    file: File, 
    category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
  ): Promise<UploadResult> {
    try {
      // Validation de la taille
      if (file.size > UPLOAD_CONFIG.maxFileSize) {
        return {
          success: false,
          error: `Fichier trop volumineux. Taille max: ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`
        }
      }

      // Validation du type MIME
      const allowedTypes = UPLOAD_CONFIG.allowedTypes[category]
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Type de fichier non autorisé pour la catégorie ${category}`
        }
      }

      // Générer un nom unique
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop() || ''
      const fileName = `${timestamp}_${randomString}.${extension}`

      // Chemins
      const categoryDir = path.join(this.uploadDir, category, 'original')
      const filePath = path.join(categoryDir, fileName)
      const relativePath = `uploads/${category}/original/${fileName}`

      // Créer le répertoire si nécessaire
      await this.initDirectories()

      // Sauvegarder le fichier
      const bytes = await file.arrayBuffer()
      await writeFile(filePath, Buffer.from(bytes))

      // Préparer le résultat
      const result: UploadResult = {
        success: true,
        filePath: `/${relativePath}`,
        metadata: {
          size: file.size
        }
      }

      // Traitement spécial pour les images
      if (category === 'image') {
        const imageResult = await this.processImage(filePath, fileName, category)
        result.thumbnailPath = imageResult.thumbnailPath
        result.metadata = { ...result.metadata, ...imageResult.metadata }
      }

      return result

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      return {
        success: false,
        error: 'Erreur lors de l\'upload du fichier'
      }
    }
  }

  // Traitement des images avec Sharp
  static async processImage(
    filePath: string, 
    fileName: string, 
    category: string
  ): Promise<{ thumbnailPath?: string, metadata: any }> {
    try {
      const image = sharp(filePath)
      const metadata = await image.metadata()

      // Générer une miniature
      const thumbnailName = `thumb_${fileName}`
      const thumbnailDir = path.join(this.uploadDir, category, 'thumbnails')
      const thumbnailPath = path.join(thumbnailDir, thumbnailName)
      const relativeThumbnailPath = `uploads/${category}/thumbnails/${thumbnailName}`

      await image
        .resize(UPLOAD_CONFIG.thumbnailSizes.medium.width, UPLOAD_CONFIG.thumbnailSizes.medium.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath)

      return {
        thumbnailPath: `/${relativeThumbnailPath}`,
        metadata: {
          width: metadata.width,
          height: metadata.height
        }
      }
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error)
      return { metadata: {} }
    }
  }

  // Supprimer un fichier
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''))
      
      if (existsSync(fullPath)) {
        await unlink(fullPath)
        
        // Supprimer aussi la miniature si c'est une image
        if (filePath.includes('/image/')) {
          const fileName = path.basename(filePath)
          const thumbnailPath = filePath.replace('/original/', '/thumbnails/').replace(fileName, `thumb_${fileName}`)
          const fullThumbnailPath = path.join(process.cwd(), 'public', thumbnailPath.replace(/^\//, ''))
          
          if (existsSync(fullThumbnailPath)) {
            await unlink(fullThumbnailPath)
          }
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      return false
    }
  }

  // Obtenir les informations d'un fichier
  static async getFileInfo(filePath: string): Promise<any> {
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''))
      const stats = await stat(fullPath)
      
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        exists: true
      }
    } catch (error) {
      return { exists: false }
    }
  }

  // Nettoyer les fichiers orphelins
  static async cleanupOrphanedFiles(validPaths: string[]): Promise<number> {
    let cleanedCount = 0
    
    try {
      // Cette fonction pourrait parcourir les répertoires d'upload
      // et supprimer les fichiers qui ne sont plus référencés en DB
      
      // Pour l'instant, on retourne 0
      // TODO: Implémenter la logique de nettoyage
      
      return cleanedCount
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error)
      return 0
    }
  }
}

// Types d'export
export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
