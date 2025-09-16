import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour le stockage de fichiers
export interface FileUploadOptions {
  bucket: string
  path: string
  file: File
  upsert?: boolean
}

export interface FileUploadResult {
  success: boolean
  data?: {
    path: string
    fullPath: string
    publicUrl: string
  }
  error?: string
}

// Utilitaires pour le stockage de fichiers
export class SupabaseStorage {
  
  // Upload d'un fichier
  static async uploadFile({
    bucket,
    path,
    file,
    upsert = false
  }: FileUploadOptions): Promise<FileUploadResult> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert })

      if (error) {
        return { success: false, error: error.message }
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl: publicUrlData.publicUrl
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  // Supprimer un fichier
  static async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    return { success: !error, error: error?.message }
  }

  // Obtenir l'URL publique d'un fichier
  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  // Obtenir l'URL avec transformation (pour les images)
  static getTransformedImageUrl(
    bucket: string, 
    path: string, 
    options: {
      width?: number
      height?: number
      resize?: 'cover' | 'contain' | 'fill'
      quality?: number
    }
  ) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path, {
        transform: options
      })
    
    return data.publicUrl
  }

  // Lister les fichiers dans un bucket
  static async listFiles(bucket: string, folder?: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder)
    
    return { data, error: error?.message }
  }
}

