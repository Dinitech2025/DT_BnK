# Dinitech - Projet Test Next.js

Application de test Next.js créée pour démontrer le déploiement sur serveur Ubuntu sans Docker.

## Technologies

- **Next.js 15** - Framework React pour la production
- **TypeScript** - Typage statique
- **TailwindCSS** - Framework CSS utilitaire
- **Prisma** - ORM moderne pour la base de données
- **PostgreSQL** - Base de données relationnelle
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
- `/database` - Test de la base de données Prisma

## Base de données

L'application utilise **Prisma** comme ORM avec **PostgreSQL**. 

### Configuration rapide :

```bash
# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Configurer la base de données
sudo -u postgres createuser -s dinitech_user
sudo -u postgres createdb dinitech_db

# Créer le fichier .env avec DATABASE_URL
# Voir DATABASE_SETUP.md pour plus de détails

# Déployer le schéma
npm run db:push

# Ajouter des données de test
npm run db:seed
```

### Modèles de données :
- **User** - Utilisateurs avec email et nom
- **Post** - Articles liés aux utilisateurs
- **Contact** - Messages de contact

Voir [DATABASE_SETUP.md](DATABASE_SETUP.md) pour la configuration complète.

## Commandes utiles

```bash
# Développement
npm run dev     # Serveur de développement
npm run build   # Build de production
npm start       # Serveur de production
npm run lint    # Vérification du code

# Production avec PM2
pm2 logs dinitech    # Voir les logs
pm2 restart dinitech # Redémarrer
pm2 status          # Statut des processus
```

## Configuration

Le projet utilise les fichiers de configuration suivants :
- `next.config.js` - Configuration Next.js
- `tsconfig.json` - Configuration TypeScript
- `tailwind.config.js` - Configuration TailwindCSS
- `.eslintrc.json` - Configuration ESLint

## Licence

ISC
