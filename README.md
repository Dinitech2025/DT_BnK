# Dinitech - Projet Test Next.js

Application de test Next.js créée pour démontrer le déploiement sur serveur Ubuntu sans Docker.

## Technologies

- **Next.js 15** - Framework React pour la production
- **TypeScript** - Typage statique
- **TailwindCSS** - Framework CSS utilitaire
- **Prisma** - ORM moderne pour la base de données
- **PostgreSQL** - Base de données relationnelle native
- **Sharp** - Traitement et optimisation d'images
- **ESLint** - Linting du code

## Installation et développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Builder pour la production
npm run build

# Lancer en production
npm start
```

## Structure du projet

```
Dinitech/
├── src/
│   └── app/
│       ├── about/
│       │   └── page.tsx
│       ├── features/
│       │   └── page.tsx
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── public/
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Déploiement sur Ubuntu

### Prérequis
- Ubuntu 20.04+
- Node.js 18+
- Git

### Étapes de déploiement

1. **Cloner le repository**
```bash
cd /var/www
git clone <votre-repo-url>
cd Dinitech
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Builder l'application**
```bash
npm run build
```

4. **Configurer PM2**
```bash
sudo npm install -g pm2
pm2 start npm --name "dinitech" -- start
pm2 save
pm2 startup
```

5. **Configurer Nginx**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **SSL avec Let's Encrypt**
```bash
sudo certbot --nginx -d votre-domaine.com
```

## Pages disponibles

- `/` - Page d'accueil
- `/about` - À propos du projet
- `/features` - Liste des fonctionnalités
- `/database` - Interface de gestion de base de données

## Base de données et stockage

L'application utilise **Prisma** comme ORM avec **PostgreSQL natif** et un système de stockage de fichiers local.

### Configuration rapide :

```bash
# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Configurer la base de données
sudo -u postgres psql
CREATE USER dinitech_user WITH PASSWORD 'mot_de_passe_fort';
CREATE DATABASE dinitech_db OWNER dinitech_user;
GRANT ALL PRIVILEGES ON DATABASE dinitech_db TO dinitech_user;
\q

# Configurer le projet
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

### Fonctionnalités intégrées :
- **Base de données** : PostgreSQL natif avec Prisma ORM
- **Stockage** : Upload et gestion de fichiers locaux avec miniatures
- **Traitement d'images** : Redimensionnement automatique avec Sharp
- **API REST** : Routes Next.js avec validation complète
- **Interface** : Dashboard d'administration intégré

### Structure des données :
- **users** - Utilisateurs avec avatar et statistiques
- **posts** - Articles avec fichiers attachés et tags
- **files** - Fichiers avec métadonnées et miniatures
- **comments** - Système de commentaires
- **tags** - Tags pour catégoriser les posts
- **contacts** - Messages de contact
- **settings** - Paramètres de l'application

### Catégories de fichiers :
- **IMAGE** - Images avec miniatures automatiques
- **VIDEO** - Vidéos avec métadonnées (durée, dimensions)
- **AUDIO** - Fichiers audio avec durée
- **DOCUMENT** - PDF, Word, texte
- **ARCHIVE** - ZIP, RAR, etc.
- **OTHER** - Autres types de fichiers

### Stockage local organisé :
```
public/uploads/
├── image/
│   ├── original/     # Images originales
│   └── thumbnails/   # Miniatures générées
├── video/
├── audio/
├── document/
└── archive/
```

## Commandes utiles

```bash
# Développement
npm run dev     # Serveur de développement
npm run build   # Build de production
npm start       # Serveur de production
npm run lint    # Vérification du code

# Base de données Prisma
npm run db:generate # Générer le client Prisma
npm run db:push     # Pousser le schéma vers la DB
npm run db:migrate  # Créer une migration
npm run db:studio   # Interface graphique Prisma
npm run db:seed     # Ajouter des données de test
npm run db:reset    # Réinitialiser la DB
npm run db:deploy   # Déployer les migrations (production)

# Production avec PM2
pm2 logs dinitech    # Voir les logs
pm2 restart dinitech # Redémarrer
pm2 status          # Statut des processus

# PostgreSQL direct
sudo -u postgres psql dinitech_db  # Accès DB direct
psql -h localhost -U dinitech_user dinitech_db  # Accès utilisateur
```

## Configuration

Le projet utilise les fichiers de configuration suivants :
- `next.config.js` - Configuration Next.js
- `tsconfig.json` - Configuration TypeScript
- `tailwind.config.js` - Configuration TailwindCSS
- `.eslintrc.json` - Configuration ESLint
- `prisma/schema.prisma` - Schéma de base de données Prisma
- `prisma/migrations/` - Migrations de base de données
- `.env` - Variables d'environnement (DATABASE_URL, secrets)

## Licence

ISC
