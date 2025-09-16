import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export interface FileMetadata {
  filename: string
  storedName: string
  mimeType: string
  size: number
  path: string
  category: FileCategory
  width?: number
  height?: number
  duration?: number
}

export enum FileCategory {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  OTHER = 'OTHER'
}

export const ALLOWED_FILE_TYPES = {
  [FileCategory.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  [FileCategory.VIDEO]: ['video/mp4', 'video/webm', 'video/quicktime'],
  [FileCategory.DOCUMENT]: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  [FileCategory.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
}

export const MAX_FILE_SIZE = {
  [FileCategory.IMAGE]: 10 * 1024 * 1024, // 10MB
  [FileCategory.VIDEO]: 100 * 1024 * 1024, // 100MB
  [FileCategory.DOCUMENT]: 25 * 1024 * 1024, // 25MB
  [FileCategory.AUDIO]: 50 * 1024 * 1024, // 50MB
}

export function categorizeFile(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return FileCategory.IMAGE
  if (mimeType.startsWith('video/')) return FileCategory.VIDEO
  if (mimeType.startsWith('audio/')) return FileCategory.AUDIO
  if (mimeType === 'application/pdf' || mimeType.includes('document') || mimeType === 'text/plain') {
    return FileCategory.DOCUMENT
  }
  return FileCategory.OTHER
}

export function validateFile(file: { size: number; type: string }): { valid: boolean; error?: string } {
  const category = categorizeFile(file.type)
  
  // Vérifier le type de fichier
  const allowedTypes = ALLOWED_FILE_TYPES[category]
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types acceptés pour ${category}: ${allowedTypes.join(', ')}`
    }
  }
  
  // Vérifier la taille
  const maxSize = MAX_FILE_SIZE[category]
  if (maxSize && file.size > maxSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximale pour ${category}: ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }
  
  return { valid: true }
}

export function generateFileName(originalName: string): string {
  const extension = path.extname(originalName)
  const uuid = uuidv4()
  return `${uuid}${extension}`
}

export function getStoragePath(category: FileCategory): string {
  const baseDir = path.join(process.cwd(), 'public', 'uploads')
  
  switch (category) {
    case FileCategory.IMAGE:
      return path.join(baseDir, 'images')
    case FileCategory.VIDEO:
      return path.join(baseDir, 'videos')
    case FileCategory.DOCUMENT:
      return path.join(baseDir, 'documents')
    case FileCategory.AUDIO:
      return path.join(baseDir, 'audio')
    default:
      return path.join(baseDir, 'other')
  }
}

export async function processImage(
  inputPath: string,
  outputPath: string
): Promise<{ width: number; height: number }> {
  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    
    // Redimensionner si trop grande (max 1920px de largeur)
    if (metadata.width && metadata.width > 1920) {
      await image
        .resize(1920, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(outputPath)
    } else {
      // Juste optimiser la qualité
      await image
        .jpeg({ quality: 85 })
        .toFile(outputPath)
    }
    
    const processedMetadata = await sharp(outputPath).metadata()
    
    return {
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0
    }
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image:', error)
    throw error
  }
}

export function getPublicUrl(filePath: string): string {
  // Retourner l'URL publique relative
  return filePath.replace(path.join(process.cwd(), 'public'), '')
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath)
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath)
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error)
  }
}

// Créer les répertoires s'ils n'existent pas
export function ensureDirectories(): void {
  const categories = Object.values(FileCategory)
  categories.forEach(category => {
    const dir = getStoragePath(category)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

