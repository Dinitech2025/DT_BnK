# 🚀 Configuration Supabase pour Dinitech

Guide complet pour configurer Supabase avec votre application Next.js sur Ubuntu.

## 📋 Prérequis

- Docker installé sur le serveur Ubuntu
- Node.js 18+ et npm
- Application Dinitech déployée

## 🛠️ Installation de Supabase sur Ubuntu

### 1. Installer Supabase CLI

```bash
# Télécharger et installer Supabase CLI
curl -sSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/supabase
sudo chmod +x /usr/local/bin/supabase

# Vérifier l'installation
supabase --version
```

### 2. Installer Docker (si pas déjà fait)

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Démarrer Docker
sudo systemctl start docker
sudo systemctl enable docker

# Vérifier
docker --version
```

## 🚀 Déploiement Supabase Local

### 1. Initialiser et démarrer Supabase

```bash
cd /var/www/DT_BnK

# Démarrer les services Supabase
supabase start

# Voir l'état des services
supabase status
```

### 2. Appliquer les migrations

```bash
# Appliquer le schéma de base de données
supabase db reset

# Ou pousser les migrations manuellement
supabase db push
```

### 3. Configuration des ports

Supabase utilise ces ports par défaut :
- **54321** : API REST
- **54322** : PostgreSQL
- **54323** : Dashboard web
- **54324** : Storage API

```bash
# Ouvrir les ports nécessaires
sudo ufw allow 54321  # API REST
sudo ufw allow 54323  # Dashboard (optionnel)

# Redémarrer le firewall
sudo ufw reload
```

## 🔧 Configuration de l'application

### 1. Variables d'environnement

Créer/modifier le fichier `.env` :

```bash
cd /var/www/DT_BnK
nano .env
```

Contenu du fichier `.env` :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Application
NEXT_PUBLIC_APP_URL="http://180.149.199.175:3000"
NEXTAUTH_SECRET="votre-cle-secrete-aleatoire-longue"
NEXTAUTH_URL="http://180.149.199.175:3000"
```

### 2. Redémarrer l'application

```bash
# Installer les nouvelles dépendances
npm install

# Rebuilder l'application
npm run build

# Redémarrer avec PM2
pm2 restart dinitech

# Vérifier les logs
pm2 logs dinitech
```

## 🗃️ Structure de la base de données

### Tables principales :

- **users** : Utilisateurs de l'application
- **posts** : Articles avec relation vers users
- **contacts** : Messages de contact
- **files** : Fichiers uploadés avec métadonnées
- **post_files** : Liaison many-to-many posts ↔ fichiers

### Buckets Storage :

- **images** : Images (JPEG, PNG, GIF, WebP) - 10MB max
- **videos** : Vidéos (MP4, MPEG, QuickTime) - 100MB max
- **documents** : Documents (PDF, Word, TXT) - 50MB max
- **audio** : Fichiers audio (MP3, WAV, OGG) - 50MB max

## 🧪 Test de l'installation

### 1. Via l'interface web

```bash
# Accéder au dashboard Supabase
http://votre-serveur:54323

# Tester l'application
http://votre-serveur:3000/database
```

### 2. Via l'API REST

```bash
# Tester l'API users
curl http://localhost:54321/rest/v1/users \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Tester l'API posts
curl http://localhost:54321/rest/v1/posts \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
```

### 3. Test de upload de fichiers

```bash
# Tester l'upload via l'interface web
http://votre-serveur:3000/database

# Ou via curl
curl -X POST http://localhost:3000/api/files \
  -F "file=@/path/to/test.jpg" \
  -F "category=image" \
  -F "userId=1"
```

## 🔄 Commandes utiles

### Gestion Supabase

```bash
# Voir l'état des services
supabase status

# Arrêter les services
supabase stop

# Redémarrer les services
supabase start

# Réinitialiser la base de données
supabase db reset

# Voir les logs
supabase logs

# Accéder à la base de données
supabase db shell
```

### Gestion de l'application

```bash
# Voir les logs de l'application
pm2 logs dinitech

# Redémarrer l'application
pm2 restart dinitech

# Voir l'état PM2
pm2 status

# Rebuilder après changements
npm run build && pm2 restart dinitech
```

## 🌐 Configuration pour accès externe

### 1. Configuration Nginx (optionnel)

```nginx
# /etc/nginx/sites-available/dinitech-supabase
server {
    listen 80;
    server_name api.votre-domaine.com;
    
    location / {
        proxy_pass http://localhost:54321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Variables d'environnement pour production

```env
# Pour accès externe
NEXT_PUBLIC_SUPABASE_URL="http://api.votre-domaine.com"
# Ou avec l'IP directe
NEXT_PUBLIC_SUPABASE_URL="http://180.149.199.175:54321"
```

## 🚨 Dépannage

### Erreur de connexion Supabase

```bash
# Vérifier que les services tournent
supabase status
docker ps

# Redémarrer si nécessaire
supabase stop && supabase start
```

### Erreur de ports

```bash
# Vérifier les ports utilisés
sudo netstat -tulpn | grep 543

# Libérer un port si nécessaire
sudo kill $(sudo lsof -t -i:54321)
```

### Erreur de permissions

```bash
# Vérifier les permissions Docker
sudo usermod -aG docker $USER
newgrp docker

# Redémarrer si nécessaire
sudo systemctl restart docker
```

## 🔒 Sécurité

### 1. Configuration RLS (Row Level Security)

Les politiques RLS sont configurées dans la migration initiale pour :
- Lecture publique des données
- Écriture pour les utilisateurs authentifiés
- Modification limitée aux propriétaires

### 2. Configuration des buckets

- Limites de taille par type de fichier
- Types MIME autorisés
- Accès public en lecture
- Upload limité aux utilisateurs authentifiés

### 3. Bonnes pratiques

- Utilisez HTTPS en production
- Configurez des clés API spécifiques par environnement
- Sauvegardez régulièrement avec `supabase db dump`
- Surveillez l'utilisation des ressources

## 📊 Monitoring

### 1. Dashboard Supabase

Accédez au dashboard sur `http://votre-serveur:54323` pour :
- Visualiser les données
- Éditer les tables
- Gérer les fichiers
- Voir les logs

### 2. Logs applicatifs

```bash
# Logs de l'application Next.js
pm2 logs dinitech

# Logs Supabase
supabase logs

# Logs Docker
docker logs supabase_db_Dinitech
```

## 🔄 Migration depuis PostgreSQL/Prisma

Si vous migrez depuis une installation PostgreSQL existante :

```bash
# Exporter les données existantes
pg_dump -U dinitech_user -h localhost dinitech_db > backup.sql

# Adapter le format pour Supabase
# Puis importer dans Supabase
psql -h localhost -p 54322 -U postgres postgres < adapted_backup.sql
```

## 📝 Scripts de maintenance

### Sauvegarde automatique

```bash
#!/bin/bash
# /usr/local/bin/backup-supabase.sh
DATE=$(date +%Y%m%d_%H%M%S)
supabase db dump > /var/backups/supabase_backup_$DATE.sql
find /var/backups -name "supabase_backup_*.sql" -mtime +7 -delete

# Ajouter au cron
0 2 * * * /usr/local/bin/backup-supabase.sh
```
