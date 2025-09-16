import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Utilitaires pour la gestion des fichiers
export const FileUtils = {
  // Obtenir l'URL complète d'un fichier
  getFileUrl: (path: string): string => {
    if (path.startsWith('http')) return path // URL externe
    return path.startsWith('/') ? path : `/${path}` // URL relative
  },

  // Générer un nom de fichier unique
  generateFileName: (originalName: string): string => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop() || ''
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')
    return `${timestamp}_${randomString}_${baseName}.${extension}`
  },

  // Déterminer la catégorie d'un fichier
  getFileCategory: (mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'ARCHIVE' | 'OTHER' => {
    if (mimeType.startsWith('image/')) return 'IMAGE'
    if (mimeType.startsWith('video/')) return 'VIDEO'
    if (mimeType.startsWith('audio/')) return 'AUDIO'
    if (mimeType.includes('pdf') || 
        mimeType.includes('word') || 
        mimeType.includes('document') ||
        mimeType.includes('text/') ||
        mimeType.includes('rtf')) return 'DOCUMENT'
    if (mimeType.includes('zip') ||
        mimeType.includes('rar') ||
        mimeType.includes('tar') ||
        mimeType.includes('gzip')) return 'ARCHIVE'
    return 'OTHER'
  },

  // Formater la taille de fichier
  formatFileSize: (bytes: bigint): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0n) return '0 Bytes'
    
    const i = Math.floor(Math.log(Number(bytes)) / Math.log(1024))
    return Math.round(Number(bytes) / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  },

  // Valider le type de fichier
  isValidFileType: (mimeType: string, allowedTypes?: string[]): boolean => {
    if (!allowedTypes) {
      // Types par défaut autorisés
      const defaultTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm',
        'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv',
        'application/zip', 'application/x-rar-compressed'
      ]
      return defaultTypes.includes(mimeType)
    }
    return allowedTypes.includes(mimeType)
  }
}

// Types utilitaires pour TypeScript
export type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true, files: true }
}>

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: { 
    author: true, 
    files: { include: { file: true } },
    tags: { include: { tag: true } },
    _count: { select: { comments: true } }
  }
}>

export type FileWithUser = Prisma.FileGetPayload<{
  include: { uploadedBy: true }
}>

export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: { author: true, post: { select: { title: true } } }
}>

// Import des types Prisma
import { Prisma } from '@prisma/client'

export { Prisma } from '@prisma/client'
export type { User, Post, File, Comment, Tag, Contact, Setting } from '@prisma/client'
