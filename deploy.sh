#!/bin/bash

echo "🚀 Début du déploiement automatique de Dinitech..."

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    log_error "package.json non trouvé. Êtes-vous dans le bon répertoire ?"
    exit 1
fi

# Sauvegarder les modifications locales
log_info "Sauvegarde des modifications locales..."
git stash

# Récupérer les dernières modifications
log_info "Récupération des dernières modifications..."
git pull origin main

if [ $? -ne 0 ]; then
    log_error "Échec du git pull"
    exit 1
fi

# Installer/mettre à jour les dépendances
log_info "Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    log_error "Échec de l'installation des dépendances"
    exit 1
fi

# Builder l'application
log_info "Build de l'application..."
npm run build

if [ $? -ne 0 ]; then
    log_error "Échec du build"
    exit 1
fi

# Redémarrer PM2
log_info "Redémarrage de l'application..."
pm2 restart dinitech

if [ $? -ne 0 ]; then
    log_warning "PM2 restart a échoué, tentative de démarrage..."
    pm2 start npm --name "dinitech" -- start
fi

log_info "✅ Déploiement terminé avec succès !"
log_info "🌐 Votre application est maintenant à jour"

# Afficher le statut PM2
pm2 status
