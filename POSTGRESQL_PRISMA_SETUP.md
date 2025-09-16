# 🗃️ Configuration PostgreSQL + Prisma pour Dinitech

Guide complet pour configurer PostgreSQL natif avec Prisma ORM pour votre application Next.js sur Ubuntu.

## 📋 Prérequis

- Ubuntu 20.04+ 
- Node.js 18+
- npm ou yarn
- Accès sudo

## 🛠️ Installation PostgreSQL sur Ubuntu

### 1. Installer PostgreSQL

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer PostgreSQL et outils
sudo apt install postgresql postgresql-contrib -y

# Démarrer et activer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Vérifier l'installation
sudo systemctl status postgresql
psql --version
```

### 2. Configurer PostgreSQL

```bash
# Se connecter en tant que superutilisateur postgres
sudo -u postgres psql

# Dans le shell PostgreSQL, créer utilisateur et base de données
CREATE USER dinitech_user WITH PASSWORD 'votre_mot_de_passe_fort_123';
CREATE DATABASE dinitech_db OWNER dinitech_user;
GRANT ALL PRIVILEGES ON DATABASE dinitech_db TO dinitech_user;

# Optionnel : créer une base de test
CREATE DATABASE dinitech_test OWNER dinitech_user;

# Quitter le shell PostgreSQL
\q
```

### 3. Configurer l'accès (optionnel)

```bash
# Éditer la configuration PostgreSQL si besoin d'accès externe
sudo nano /etc/postgresql/*/main/postgresql.conf

# Décommenter et modifier si nécessaire :
# listen_addresses = 'localhost'

# Configurer l'authentification
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Ajouter une ligne pour l'utilisateur (si nécessaire) :
# local   dinitech_db     dinitech_user                     md5

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

## 🚀 Configuration du projet Dinitech

### 1. Cloner et installer

```bash
# Cloner le projet
cd /var/www
git clone https://github.com/Dinitech2025/DT_BnK.git
cd DT_BnK

# Installer les dépendances
npm install
```

### 2. Configurer les variables d'environnement

```bash
# Créer le fichier .env
nano .env
```

**Contenu du fichier `.env` :**

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://dinitech_user:votre_mot_de_passe_fort_123@localhost:5432/dinitech_db?schema=public"

# Application Next.js
NEXT_PUBLIC_APP_URL="http://180.149.199.175:3000"
NEXTAUTH_SECRET="une-cle-secrete-tres-longue-et-aleatoire-minimum-32-caracteres"
NEXTAUTH_URL="http://180.149.199.175:3000"

# Configuration uploads (optionnel)
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_DIR="uploads"
```

### 3. Configurer et déployer la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers la base de données
npm run db:push

# Ou créer une migration (recommandé pour la production)
npm run db:migrate

# Ajouter des données de test
npm run db:seed

# Vérifier avec Prisma Studio (optionnel)
npm run db:studio
```

### 4. Créer les répertoires d'upload

```bash
# Créer la structure de fichiers
mkdir -p public/uploads/{image,video,audio,document,archive,other}
mkdir -p public/uploads/{image,video,audio,document,archive,other}/{original,thumbnails}

# Définir les permissions
chmod 755 public/uploads -R
chown -R www-data:www-data public/uploads  # Si utilisation avec Nginx
```

### 5. Builder et démarrer l'application

```bash
# Builder l'application
npm run build

# Installer PM2 si pas déjà fait
sudo npm install -g pm2

# Démarrer avec PM2
pm2 start npm --name "dinitech" -- start

# Sauvegarder la configuration PM2
pm2 save

# Configurer le démarrage automatique
pm2 startup
```

## 🏗️ Structure de la base de données

### Tables principales :

| Table | Description | Relations |
|-------|-------------|-----------|
| **users** | Utilisateurs avec avatar | → posts, files, comments |
| **posts** | Articles/posts | → author (user), files, tags, comments |
| **files** | Fichiers avec métadonnées | → uploader (user), posts |
| **comments** | Commentaires sur les posts | → author (user), post |
| **tags** | Tags pour catégoriser | → posts |
| **contacts** | Messages de contact | - |
| **settings** | Paramètres de l'application | - |

### Types de fichiers supportés :

| Catégorie | Types MIME | Taille max | Traitement |
|-----------|------------|------------|------------|
| **IMAGE** | JPEG, PNG, GIF, WebP | 10MB | Miniatures auto |
| **VIDEO** | MP4, MPEG, QuickTime | 100MB | Métadonnées |
| **AUDIO** | MP3, WAV, OGG | 50MB | Durée |
| **DOCUMENT** | PDF, Word, TXT | 50MB | - |
| **ARCHIVE** | ZIP, RAR, GZIP | 50MB | - |

## 🧪 Test de l'installation

### 1. Via l'interface web

```bash
# Accéder à l'application
http://votre-serveur:3000

# Page de test de la base de données
http://votre-serveur:3000/database
```

### 2. Via les API

```bash
# Tester l'API users
curl http://localhost:3000/api/users

# Tester l'API posts
curl http://localhost:3000/api/posts

# Tester l'API files
curl http://localhost:3000/api/files

# Créer un utilisateur
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

### 3. Via Prisma Studio

```bash
# Ouvrir l'interface graphique Prisma
npm run db:studio

# Accessible sur http://localhost:5555
```

### 4. Via PostgreSQL direct

```bash
# Se connecter à la base de données
psql -h localhost -U dinitech_user -d dinitech_db

# Vérifier les tables
\dt

# Voir les données
SELECT * FROM users;
SELECT * FROM posts;
SELECT * FROM files;

# Quitter
\q
```

## 🔄 Commandes de maintenance

### Prisma

```bash
# Générer le client après changement de schéma
npm run db:generate

# Créer une nouvelle migration
npm run db:migrate

# Appliquer les migrations en production
npm run db:deploy

# Réinitialiser la base de données (ATTENTION: supprime tout)
npm run db:reset

# Ouvrir Prisma Studio
npm run db:studio

# Ajouter des données de test
npm run db:seed
```

### PostgreSQL

```bash
# Sauvegarder la base de données
pg_dump -U dinitech_user -h localhost dinitech_db > backup.sql

# Restaurer une sauvegarde
psql -U dinitech_user -h localhost dinitech_db < backup.sql

# Voir les connexions actives
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname = 'dinitech_db';"

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

### Application

```bash
# Voir les logs
pm2 logs dinitech

# Redémarrer l'application
pm2 restart dinitech

# Voir l'état
pm2 status

# Rebuilder après changements
npm run build && pm2 restart dinitech
```

## 🚨 Dépannage

### Erreur de connexion PostgreSQL

```bash
# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql

# Vérifier les logs PostgreSQL
sudo journalctl -u postgresql

# Tester la connexion
psql -h localhost -U dinitech_user -d dinitech_db
```

### Erreur Prisma

```bash
# Régénérer le client Prisma
npm run db:generate

# Vérifier la chaîne de connexion
echo $DATABASE_URL

# Réinitialiser les migrations (ATTENTION)
rm -rf prisma/migrations
npm run db:push
```

### Erreur de permissions fichiers

```bash
# Vérifier les permissions
ls -la public/uploads/

# Corriger les permissions
chmod 755 public/uploads -R
chown -R www-data:www-data public/uploads

# Ou pour l'utilisateur courant
chown -R $USER:$USER public/uploads
```

### Erreur de taille de fichier

```bash
# Vérifier la configuration Nginx (si utilisé)
sudo nano /etc/nginx/nginx.conf

# Ajouter/modifier dans http {}
client_max_body_size 50M;

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 🔒 Sécurité

### 1. Base de données

```bash
# Créer un utilisateur en lecture seule (optionnel)
sudo -u postgres psql dinitech_db
CREATE USER dinitech_readonly WITH PASSWORD 'password_readonly';
GRANT CONNECT ON DATABASE dinitech_db TO dinitech_readonly;
GRANT USAGE ON SCHEMA public TO dinitech_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dinitech_readonly;
```

### 2. Fichiers uploadés

- Valider tous les types MIME
- Limiter les tailles de fichiers
- Scanner les fichiers malveillants
- Stocker hors du répertoire web si sensible

### 3. Variables d'environnement

- Utiliser des mots de passe forts
- Ne jamais commiter le fichier `.env`
- Changer les secrets en production

## 📊 Monitoring

### 1. Surveillance PostgreSQL

```bash
# Voir l'utilisation
sudo -u postgres psql -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables;"

# Voir la taille des tables
sudo -u postgres psql dinitech_db -c "
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables 
WHERE schemaname = 'public';"
```

### 2. Surveillance des fichiers

```bash
# Voir l'utilisation du disque uploads
du -sh public/uploads/*

# Compter les fichiers par catégorie
find public/uploads -type f | wc -l
find public/uploads/image -type f | wc -l
```

## 🔄 Scripts d'automatisation

### Script de sauvegarde

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/dinitech"

mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
pg_dump -U dinitech_user -h localhost dinitech_db > $BACKUP_DIR/db_$DATE.sql

# Sauvegarder les fichiers uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz public/uploads/

# Nettoyer les anciennes sauvegardes (garder 7 jours)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Sauvegarde terminée: $DATE"
```

### Automatiser avec cron

```bash
# Éditer le crontab
crontab -e

# Ajouter une sauvegarde quotidienne à 2h du matin
0 2 * * * /path/to/backup-db.sh >> /var/log/dinitech-backup.log 2>&1
```

## 📝 Migration depuis d'autres systèmes

### Depuis Supabase

Si vous migrez depuis Supabase :

```bash
# Exporter les données Supabase (via dashboard ou CLI)
# Adapter le format pour PostgreSQL
# Importer dans votre nouvelle base

# Exemple de conversion basique
# supabase_export.sql → postgresql_import.sql
```

### Depuis MySQL

```bash
# Utiliser des outils comme pgloader
sudo apt install pgloader

# Configurer et exécuter la migration
pgloader mysql://user:pass@localhost/olddb postgresql://dinitech_user:pass@localhost/dinitech_db
```

Cette configuration vous donne une stack PostgreSQL + Prisma robuste et complète pour votre application Dinitech ! 🚀
