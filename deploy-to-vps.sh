#!/bin/bash
# Script de déploiement automatisé pour VPS114676
# Serveur: 180.149.199.175

echo "🚀 Déploiement automatisé sur VPS114676..."

# Configuration du serveur
VPS_HOST="180.149.199.175"
VPS_USER="root"
VPS_DOMAIN="vps114676.serveur-vps.net"

echo "📡 Connexion au serveur $VPS_HOST..."

# Exécuter le déploiement sur le serveur
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'

echo "📂 Navigation vers le répertoire du projet..."
cd /var/www/DT_BnK || { echo "❌ Répertoire non trouvé"; exit 1; }

echo "📥 Récupération du nouveau code..."
git pull origin master

echo "📦 Installation des dépendances..."
npm install

echo "⚙️ Configuration de l'environnement production..."
cat > .env << 'EOF'
# Base de données SQLite production
DATABASE_URL="file:./prod.db"

# Configuration production
NEXT_PUBLIC_APP_URL="http://180.149.199.175:3000"
NEXTAUTH_SECRET="vps114676-secret-production-2024"
NEXTAUTH_URL="http://180.149.199.175:3000"

# Gestion des fichiers
UPLOADS_DIR="uploads"
MAX_FILE_SIZE="10485760"
NODE_ENV="production"
EOF

echo "🗃️ Configuration de la base de données..."
npm run db:generate
npm run db:push
npm run db:seed

echo "🏗️ Build de l'application..."
npm run build

echo "📁 Configuration des permissions..."
mkdir -p uploads
chmod 755 uploads
[ -f prod.db ] && chmod 644 prod.db

echo "🔄 Redémarrage PM2..."
pm2 delete all 2>/dev/null || true
pm2 start npm --name "dinitech" -- start
pm2 save

echo "✅ Déploiement terminé!"
echo "🌐 Application disponible sur:"
echo "   - http://180.149.199.175:3000"
echo "   - http://vps114676.serveur-vps.net:3000"
echo ""
echo "📊 Status PM2:"
pm2 status

ENDSSH

echo "🎉 Déploiement terminé avec succès!"
echo "🌐 Votre application est maintenant en ligne sur:"
echo "   http://180.149.199.175:3000"
