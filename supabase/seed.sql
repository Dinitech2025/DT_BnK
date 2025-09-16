-- Configuration des buckets Supabase Storage
-- Ce fichier sera exécuté après les migrations pour configurer le stockage

-- Créer les buckets pour organiser les fichiers par type
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'images',
    'images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
  ),
  (
    'videos',
    'videos',
    true,
    104857600, -- 100MB
    ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm']::text[]
  ),
  (
    'documents',
    'documents',
    true,
    52428800, -- 50MB
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']::text[]
  ),
  (
    'audio',
    'audio',
    true,
    52428800, -- 50MB
    ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']::text[]
  )
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS pour les buckets de stockage
-- Permettre la lecture publique de tous les fichiers
CREATE POLICY "Public can view files" ON storage.objects FOR SELECT USING (true);

-- Permettre l'upload pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload files" ON storage.objects 
FOR INSERT WITH CHECK (true);

-- Permettre la suppression pour les propriétaires des fichiers
CREATE POLICY "Users can delete their own files" ON storage.objects 
FOR DELETE USING (auth.uid()::text = owner);

-- Permettre la mise à jour pour les propriétaires des fichiers
CREATE POLICY "Users can update their own files" ON storage.objects 
FOR UPDATE USING (auth.uid()::text = owner);

-- Fonction utilitaire pour obtenir l'URL publique d'un fichier
CREATE OR REPLACE FUNCTION get_file_url(bucket_name text, file_path text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN bucket_name IS NULL OR file_path IS NULL THEN NULL
    ELSE 'https://' || current_setting('app.settings.supabase_url', true) || '/storage/v1/object/public/' || bucket_name || '/' || file_path
  END;
$$;

-- Vue pour simplifier l'accès aux fichiers avec leurs URLs
CREATE OR REPLACE VIEW files_with_urls AS
SELECT 
  f.*,
  get_file_url(f.category || 's', f.stored_name) as public_url,
  u.name as uploader_name,
  u.email as uploader_email
FROM files f
LEFT JOIN users u ON f.user_id = u.id;

-- Commentaires
COMMENT ON FUNCTION get_file_url IS 'Génère l''URL publique d''un fichier dans Supabase Storage';
COMMENT ON VIEW files_with_urls IS 'Vue enrichie des fichiers avec leurs URLs publiques et informations utilisateur';
