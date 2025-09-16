# Dinitech - Projet Test Next.js

Application de test Next.js créée pour démontrer le déploiement sur serveur Ubuntu sans Docker.

## Technologies

- **Next.js 15** - Framework React pour la production
- **TypeScript** - Typage statique
- **TailwindCSS** - Framework CSS utilitaire
- **Supabase** - Backend-as-a-Service avec PostgreSQL
- **Supabase Storage** - Stockage de fichiers avec CDN
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
- `/database` - Interface de gestion Supabase

## Base de données et stockage

L'application utilise **Supabase** comme backend complet avec PostgreSQL et stockage de fichiers.

### Configuration rapide :

```bash
# Installer Supabase CLI
curl -sSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/supabase

# Installer Docker (requis)
curl -fsSL https://get.docker.com | sudo sh

# Démarrer Supabase
supabase start

# Voir l'état des services
supabase status
```

### Fonctionnalités Supabase :
- **Base de données** : PostgreSQL avec API REST automatique
- **Stockage** : Upload et gestion de fichiers (images, vidéos, documents)
- **Authentification** : Système d'auth intégré
- **API temps réel** : Synchronisation en temps réel
- **Dashboard** : Interface d'administration web

### Structure des données :
- **users** - Utilisateurs avec email et nom
- **posts** - Articles liés aux utilisateurs  
- **contacts** - Messages de contact
- **files** - Fichiers uploadés avec métadonnées
- **post_files** - Liaison posts ↔ fichiers

### Buckets de stockage :
- **images** - Images (10MB max)
- **videos** - Vidéos (100MB max)
- **documents** - Documents PDF/Word (50MB max)
- **audio** - Fichiers audio (50MB max)

Voir [SUPABASE_SETUP.md](SUPABASE_SETUP.md) pour la configuration complète.

## Commandes utiles

```bash
# Développement
npm run dev     # Serveur de développement
npm run build   # Build de production
npm start       # Serveur de production
npm run lint    # Vérification du code

# Supabase
npm run supabase:start   # Démarrer Supabase
npm run supabase:stop    # Arrêter Supabase
npm run supabase:status  # État des services
npm run supabase:reset   # Réinitialiser la DB

# Production avec PM2
pm2 logs dinitech    # Voir les logs
pm2 restart dinitech # Redémarrer
pm2 status          # Statut des processus

# Supabase direct
supabase start      # Démarrer les services
supabase status     # État des services
supabase logs       # Logs Supabase
supabase db shell   # Accès PostgreSQL
```

## Configuration

Le projet utilise les fichiers de configuration suivants :
- `next.config.js` - Configuration Next.js
- `tsconfig.json` - Configuration TypeScript
- `tailwind.config.js` - Configuration TailwindCSS
- `.eslintrc.json` - Configuration ESLint
- `supabase/config.toml` - Configuration Supabase
- `supabase/migrations/` - Migrations de base de données
- `.env` - Variables d'environnement (Supabase URL, clés API)

## Licence

ISC
