# 🗃️ Configuration Base de Données Prisma

Guide pour configurer la base de données avec Prisma sur votre serveur Ubuntu.

## 📋 Prérequis

- PostgreSQL ou MySQL installé
- Node.js et npm installés
- Application Dinitech déployée

## 🛠️ Installation de PostgreSQL sur Ubuntu

```bash
# Mettre à jour les paquets
sudo apt update

# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Démarrer et activer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer un utilisateur et une base de données
sudo -u postgres psql

# Dans le shell PostgreSQL :
CREATE USER dinitech_user WITH PASSWORD 'votre_mot_de_passe_fort';
CREATE DATABASE dinitech_db OWNER dinitech_user;
GRANT ALL PRIVILEGES ON DATABASE dinitech_db TO dinitech_user;
\q
```

## 🔧 Configuration des variables d'environnement

### 1. Créer le fichier .env sur le serveur :

```bash
cd /var/www/DT_BnK
nano .env
```

### 2. Contenu du fichier .env :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://dinitech_user:votre_mot_de_passe_fort@localhost:5432/dinitech_db?schema=public"

# Variables Next.js
NEXT_PUBLIC_APP_URL="http://votre-ip-ou-domaine:3000"
NEXTAUTH_SECRET="une-cle-secrete-tres-longue-et-aleatoire"
NEXTAUTH_URL="http://votre-ip-ou-domaine:3000"
```

### 3. Alternative avec SQLite (développement) :

```env
# Base de données SQLite (plus simple pour les tests)
DATABASE_URL="file:./dev.db"
```

## 🚀 Déploiement de la base de données

### 1. Installer les dépendances :

```bash
cd /var/www/DT_BnK
npm install
```

### 2. Générer le client Prisma :

```bash
npm run db:generate
```

### 3. Pousser le schéma vers la base de données :

```bash
# Pour PostgreSQL/MySQL
npm run db:push

# Ou créer une migration
npm run db:migrate
```

### 4. Ajouter des données de test :

```bash
npm run db:seed
```

### 5. Redémarrer l'application :

```bash
pm2 restart dinitech
```

## 🧪 Test de la base de données

1. **Via l'interface web :**
   - Allez sur `http://votre-serveur:3000/database`
   - Créez un utilisateur
   - Vérifiez que les données apparaissent

2. **Via l'API :**
   ```bash
   # Tester l'API users
   curl http://localhost:3000/api/users
   
   # Tester l'API posts
   curl http://localhost:3000/api/posts
   ```

3. **Via Prisma Studio (local) :**
   ```bash
   npm run db:studio
   ```

## 🔄 Commandes utiles

```bash
# Voir le statut de la base de données
npm run db:generate

# Réinitialiser la base de données
npm run db:reset

# Voir les logs de l'application
pm2 logs dinitech

# Redémarrer l'application
pm2 restart dinitech
```

## 📊 Structure de la base de données

### Modèles créés :

- **User** : Utilisateurs de l'application
- **Post** : Articles/posts avec relation vers User
- **Contact** : Messages de contact

### Relations :

- Un User peut avoir plusieurs Posts
- Chaque Post appartient à un User

## 🚨 Dépannage

### Erreur de connexion :

1. Vérifiez que PostgreSQL est démarré :
   ```bash
   sudo systemctl status postgresql
   ```

2. Vérifiez les permissions :
   ```bash
   sudo -u postgres psql -c "SELECT usename FROM pg_user;"
   ```

3. Testez la connexion :
   ```bash
   psql -h localhost -U dinitech_user -d dinitech_db
   ```

### Erreur de migration :

1. Réinitialiser la base de données :
   ```bash
   npm run db:reset
   ```

2. Recréer les tables :
   ```bash
   npm run db:push
   ```

## 🔒 Sécurité

- Utilisez des mots de passe forts
- Configurez le firewall pour PostgreSQL
- Sauvegardez régulièrement vos données
- Ne commitez jamais le fichier .env

## 📝 Scripts de maintenance

### Sauvegarde automatique :

```bash
# Créer un script de sauvegarde
sudo nano /usr/local/bin/backup-dinitech.sh

#!/bin/bash
pg_dump -U dinitech_user -h localhost dinitech_db > /var/backups/dinitech_$(date +%Y%m%d_%H%M%S).sql

# Rendre exécutable
sudo chmod +x /usr/local/bin/backup-dinitech.sh

# Ajouter au cron (tous les jours à 2h)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-dinitech.sh
```
