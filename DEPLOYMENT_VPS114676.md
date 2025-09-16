# Déploiement sur VPS114676

## Informations du serveur
- **Hostname:** vps114676.serveur-vps.net
- **IP:** 180.149.199.175  
- **Utilisateur:** root
- **Projet:** Dinitech avec SQLite + Prisma

---

## 🚀 Déploiement automatique

### Option 1: Script automatisé (Recommandé)
```bash
# Depuis votre machine locale
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

### Option 2: Déploiement manuel

#### 1. Connexion au serveur
```bash
ssh root@180.149.199.175
```

#### 2. Mise à jour du code
```bash
cd /var/www/DT_BnK
git pull origin master
npm install
```

#### 3. Configuration production
```bash
cat > .env << 'EOF'
DATABASE_URL="file:./prod.db"
NEXT_PUBLIC_APP_URL="http://180.149.199.175:3000"
NEXTAUTH_SECRET="vps114676-secret-production-2024"
NEXTAUTH_URL="http://180.149.199.175:3000"
UPLOADS_DIR="uploads"
MAX_FILE_SIZE="10485760"
NODE_ENV="production"
EOF
```

#### 4. Base de données
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

#### 5. Build et démarrage
```bash
npm run build
mkdir -p uploads
chmod 755 uploads
pm2 delete all
pm2 start npm --name "dinitech" -- start
pm2 save
```

---

## 🌐 URLs d'accès

Après déploiement, l'application sera disponible sur:
- http://180.149.199.175:3000
- http://vps114676.serveur-vps.net:3000

### Pages disponibles:
- `/` - Accueil
- `/about` - À propos  
- `/features` - Fonctionnalités
- `/database` - Test de la base de données

### API disponibles:
- `/api/users` - Gestion utilisateurs
- `/api/posts` - Gestion articles
- `/api/files` - Upload de fichiers

---

## 🔧 Commandes utiles

```bash
# Status de l'application
pm2 status
pm2 logs dinitech

# Redémarrer l'application
pm2 restart dinitech

# Voir la base de données
npm run db:studio

# Tests API
curl http://180.149.199.175:3000/api/users
curl http://180.149.199.175:3000/api/posts
```

---

## 🔒 Configuration Nginx (Optionnel)

Si vous voulez utiliser le port 80/443:

```bash
# Configuration Nginx
cat > /etc/nginx/sites-available/dinitech << 'EOF'
server {
    listen 80;
    server_name 180.149.199.175 vps114676.serveur-vps.net;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activer la configuration
ln -s /etc/nginx/sites-available/dinitech /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```
