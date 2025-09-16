-- Création du schéma initial pour Dinitech
-- Remplace les modèles Prisma par des tables SQL natives

-- Table des utilisateurs
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des posts
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  author_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des contacts
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des fichiers
CREATE TABLE files (
  id BIGSERIAL PRIMARY KEY,
  filename VARCHAR(500) NOT NULL,
  stored_name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'document',
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Métadonnées optionnelles pour les médias
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- en secondes pour les vidéos/audio
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison posts-fichiers (many-to-many)
CREATE TABLE post_files (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  file_id BIGINT REFERENCES files(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(post_id, file_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_files_created_at ON files(created_at DESC);
CREATE INDEX idx_post_files_post_id ON post_files(post_id);
CREATE INDEX idx_post_files_file_id ON post_files(file_id);

-- Triggers pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Sécurité au niveau des lignes
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_files ENABLE ROW LEVEL SECURITY;

-- Politiques RLS de base (à ajuster selon vos besoins)
-- Pour l'instant, accès lecture pour tous les utilisateurs authentifiés

CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can read all posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can insert posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid()::text = author_id::text);

CREATE POLICY "Users can read all files" ON files FOR SELECT USING (true);
CREATE POLICY "Users can insert files" ON files FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own files" ON files FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read all contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Users can insert contacts" ON contacts FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read post_files" ON post_files FOR SELECT USING (true);
CREATE POLICY "Users can insert post_files" ON post_files FOR INSERT WITH CHECK (true);

-- Données de test (seed)
INSERT INTO users (email, name) VALUES
  ('alice@dinitech.com', 'Alice Martin'),
  ('bob@dinitech.com', 'Bob Dupont'),
  ('charlie@dinitech.com', 'Charlie Durand');

INSERT INTO posts (title, content, published, author_id) VALUES
  (
    'Bienvenue sur Dinitech !',
    'Ceci est le premier post de notre application Next.js avec Supabase. Nous utilisons TypeScript et TailwindCSS pour créer une application moderne et performante.',
    true,
    1
  ),
  (
    'Guide de déploiement sur Ubuntu',
    'Dans ce post, nous expliquons comment déployer une application Next.js sur un serveur Ubuntu avec Supabase. Nous couvrons Node.js, PM2, Nginx et la configuration Supabase.',
    true,
    2
  ),
  (
    'Configuration Supabase avec Next.js',
    'Apprenez à configurer Supabase avec Next.js pour créer une base de données robuste et moderne. Nous couvrons l''authentification, le stockage et les API.',
    false,
    1
  ),
  (
    'Optimisation des performances Next.js',
    'Découvrez les meilleures pratiques pour optimiser les performances de votre application Next.js avec Supabase.',
    true,
    3
  );

INSERT INTO contacts (name, email, message) VALUES
  ('Marie Laurent', 'marie@example.com', 'Bonjour, je suis intéressée par vos services. Pouvez-vous me contacter ?'),
  ('Jean Moreau', 'jean@example.com', 'Excellent travail sur le site ! J''aimerais discuter d''un projet similaire.');

-- Commentaires pour la documentation
COMMENT ON TABLE users IS 'Table des utilisateurs de l''application';
COMMENT ON TABLE posts IS 'Table des articles/posts avec relation vers les utilisateurs';
COMMENT ON TABLE contacts IS 'Table des messages de contact';
COMMENT ON TABLE files IS 'Table des fichiers uploadés (images, vidéos, documents)';
COMMENT ON TABLE post_files IS 'Table de liaison many-to-many entre posts et fichiers';
