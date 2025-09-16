import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeding de la base de données Dinitech...')

  try {
    // Nettoyer les données existantes (optionnel)
    console.log('🧹 Nettoyage des données existantes...')
    await prisma.postFile.deleteMany()
    await prisma.postTag.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.file.deleteMany()
    await prisma.post.deleteMany()
    await prisma.contact.deleteMany()
    await prisma.tag.deleteMany()
    await prisma.setting.deleteMany()
    await prisma.user.deleteMany()

    // Créer les paramètres de base
    console.log('⚙️ Création des paramètres...')
    const settings = await prisma.setting.createMany({
      data: [
        {
          key: 'site_title',
          value: 'Dinitech',
          type: 'STRING'
        },
        {
          key: 'site_description',
          value: 'Application Next.js avec Prisma et PostgreSQL',
          type: 'STRING'
        },
        {
          key: 'max_file_size',
          value: '52428800',
          type: 'NUMBER'
        },
        {
          key: 'allow_registration',
          value: 'true',
          type: 'BOOLEAN'
        },
        {
          key: 'theme_config',
          value: '{"primaryColor": "#3B82F6", "secondaryColor": "#10B981"}',
          type: 'JSON'
        }
      ]
    })

    // Créer les utilisateurs de test
    console.log('👥 Création des utilisateurs...')
    const alice = await prisma.user.create({
      data: {
        email: 'alice@dinitech.com',
        name: 'Alice Martin',
        avatar: null
      }
    })

    const bob = await prisma.user.create({
      data: {
        email: 'bob@dinitech.com',
        name: 'Bob Dupont',
        avatar: null
      }
    })

    const charlie = await prisma.user.create({
      data: {
        email: 'charlie@dinitech.com',
        name: 'Charlie Durand',
        avatar: null
      }
    })

    console.log(`✅ ${3} utilisateurs créés`)

    // Créer les tags
    console.log('🏷️ Création des tags...')
    const techTag = await prisma.tag.create({
      data: {
        name: 'Technologie',
        slug: 'technologie',
        color: '#3B82F6'
      }
    })

    const nextjsTag = await prisma.tag.create({
      data: {
        name: 'Next.js',
        slug: 'nextjs',
        color: '#000000'
      }
    })

    const prismaTag = await prisma.tag.create({
      data: {
        name: 'Prisma',
        slug: 'prisma',
        color: '#2D3748'
      }
    })

    const tutorialTag = await prisma.tag.create({
      data: {
        name: 'Tutorial',
        slug: 'tutorial',
        color: '#10B981'
      }
    })

    console.log(`✅ ${4} tags créés`)

    // Créer les posts
    console.log('📝 Création des posts...')
    const post1 = await prisma.post.create({
      data: {
        title: 'Bienvenue sur Dinitech !',
        content: `Ceci est le premier post de notre application Next.js avec Prisma et PostgreSQL.

## Technologies utilisées

Notre stack technique moderne inclut :
- **Next.js 15** pour le framework React
- **Prisma** comme ORM pour la base de données
- **PostgreSQL** comme base de données relationnelle
- **TypeScript** pour le typage statique
- **TailwindCSS** pour le styling
- **Sharp** pour le traitement d'images

## Fonctionnalités

L'application propose :
- Gestion complète des utilisateurs
- Système de posts avec tags
- Upload et gestion de fichiers média
- Interface d'administration
- API REST complète

Profitez de votre exploration !`,
        excerpt: 'Introduction à l\'application Dinitech avec Next.js, Prisma et PostgreSQL.',
        published: true,
        featured: true,
        authorId: alice.id
      }
    })

    const post2 = await prisma.post.create({
      data: {
        title: 'Guide de déploiement sur Ubuntu',
        content: `Ce guide détaille le processus de déploiement d'une application Next.js avec Prisma sur un serveur Ubuntu.

## Prérequis

- Serveur Ubuntu 20.04+
- Node.js 18+
- PostgreSQL installé
- Accès SSH au serveur

## Étapes principales

### 1. Installation des dépendances

\`\`\`bash
sudo apt update
sudo apt install postgresql nodejs npm
\`\`\`

### 2. Configuration de la base de données

\`\`\`bash
sudo -u postgres createuser dinitech_user
sudo -u postgres createdb dinitech_db
\`\`\`

### 3. Déploiement de l'application

\`\`\`bash
git clone votre-repo
npm install
npm run db:push
npm run build
\`\`\`

### 4. Configuration PM2

\`\`\`bash
pm2 start npm --name "dinitech" -- start
pm2 save
pm2 startup
\`\`\`

## Nginx et SSL

N'oubliez pas de configurer Nginx comme reverse proxy et d'installer un certificat SSL avec Let's Encrypt pour la production.`,
        excerpt: 'Guide complet pour déployer une application Next.js avec Prisma sur Ubuntu.',
        published: true,
        featured: false,
        authorId: bob.id
      }
    })

    const post3 = await prisma.post.create({
      data: {
        title: 'Gestion avancée des fichiers avec Sharp',
        content: `Notre système de gestion de fichiers utilise Sharp pour le traitement d'images.

## Fonctionnalités

- Upload sécurisé de fichiers
- Génération automatique de miniatures
- Support multi-format (images, vidéos, documents)
- Validation des types MIME
- Limitation de taille configurable

## Types de fichiers supportés

- **Images** : JPEG, PNG, GIF, WebP
- **Vidéos** : MP4, MPEG, QuickTime
- **Documents** : PDF, Word, TXT
- **Archives** : ZIP, RAR, GZIP

## Organisation du stockage

Les fichiers sont organisés par catégorie dans \`public/uploads/\` avec des sous-dossiers pour les originaux et les miniatures.`,
        excerpt: 'Système avancé de gestion de fichiers avec traitement d\'images automatique.',
        published: false,
        featured: false,
        authorId: alice.id
      }
    })

    const post4 = await prisma.post.create({
      data: {
        title: 'Optimisation des performances avec Prisma',
        content: `Découvrez comment optimiser les performances de votre application avec Prisma ORM.

## Stratégies d'optimisation

### 1. Relations intelligentes

Utilisez \`include\` et \`select\` pour charger seulement les données nécessaires :

\`\`\`typescript
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: { name: true, email: true }
    },
    _count: {
      select: { comments: true }
    }
  }
})
\`\`\`

### 2. Index de base de données

Ajoutez des index sur les colonnes fréquemment requêtées :

\`\`\`prisma
model Post {
  // ...
  @@index([published, createdAt])
}
\`\`\`

### 3. Pagination

Implémentez la pagination pour les listes importantes :

\`\`\`typescript
const posts = await prisma.post.findMany({
  skip: page * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})
\`\`\`

## Monitoring

Utilisez Prisma Studio et les logs pour surveiller les performances de vos requêtes.`,
        excerpt: 'Techniques d\'optimisation pour améliorer les performances avec Prisma ORM.',
        published: true,
        featured: true,
        authorId: charlie.id
      }
    })

    console.log(`✅ ${4} posts créés`)

    // Relier les posts aux tags
    console.log('🔗 Création des relations posts-tags...')
    await prisma.postTag.createMany({
      data: [
        { postId: post1.id, tagId: techTag.id },
        { postId: post1.id, tagId: nextjsTag.id },
        { postId: post1.id, tagId: prismaTag.id },
        { postId: post2.id, tagId: tutorialTag.id },
        { postId: post2.id, tagId: nextjsTag.id },
        { postId: post3.id, tagId: techTag.id },
        { postId: post4.id, tagId: prismaTag.id },
        { postId: post4.id, tagId: tutorialTag.id }
      ]
    })

    // Créer des commentaires
    console.log('💬 Création des commentaires...')
    await prisma.comment.createMany({
      data: [
        {
          content: 'Excellent article ! Très utile pour débuter avec cette stack.',
          approved: true,
          postId: post1.id,
          authorId: bob.id
        },
        {
          content: 'Merci pour ce guide détaillé. Le déploiement s\'est très bien passé.',
          approved: true,
          postId: post2.id,
          authorId: charlie.id
        },
        {
          content: 'J\'aimerais voir plus d\'exemples de code pour le traitement d\'images.',
          approved: true,
          postId: post3.id,
          authorId: bob.id
        },
        {
          content: 'Super conseils d\'optimisation ! Mes requêtes sont beaucoup plus rapides maintenant.',
          approved: true,
          postId: post4.id,
          authorId: alice.id
        },
        {
          content: 'En attente de modération...',
          approved: false,
          postId: post1.id,
          authorId: charlie.id
        }
      ]
    })

    console.log(`✅ ${5} commentaires créés`)

    // Créer des contacts de test
    console.log('📧 Création des contacts...')
    await prisma.contact.createMany({
      data: [
        {
          name: 'Marie Laurent',
          email: 'marie@example.com',
          subject: 'Demande d\'information',
          message: 'Bonjour, je suis intéressée par vos services de développement. Pouvez-vous me contacter pour discuter d\'un projet ?',
          read: false,
          replied: false
        },
        {
          name: 'Jean Moreau',
          email: 'jean@example.com',
          subject: 'Félicitations',
          message: 'Excellent travail sur votre application ! L\'interface est très intuitive et les performances sont au rendez-vous.',
          read: true,
          replied: false
        },
        {
          name: 'Sophie Dubois',
          email: 'sophie@example.com',
          subject: 'Question technique',
          message: 'J\'ai une question concernant l\'intégration de Prisma avec Next.js. Serait-il possible d\'avoir des conseils ?',
          read: true,
          replied: true
        }
      ]
    })

    console.log(`✅ ${3} contacts créés`)

    // Statistiques finales
    const stats = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      publishedPosts: await prisma.post.count({ where: { published: true } }),
      comments: await prisma.comment.count(),
      approvedComments: await prisma.comment.count({ where: { approved: true } }),
      tags: await prisma.tag.count(),
      contacts: await prisma.contact.count(),
      settings: await prisma.setting.count()
    }

    console.log('\n📊 Statistiques finales:')
    console.log(`👥 Utilisateurs: ${stats.users}`)
    console.log(`📝 Posts: ${stats.posts} (${stats.publishedPosts} publiés)`)
    console.log(`💬 Commentaires: ${stats.comments} (${stats.approvedComments} approuvés)`)
    console.log(`🏷️ Tags: ${stats.tags}`)
    console.log(`📧 Contacts: ${stats.contacts}`)
    console.log(`⚙️ Paramètres: ${stats.settings}`)

    console.log('\n🎉 Seeding terminé avec succès !')
    console.log('🌐 Vous pouvez maintenant tester l\'application sur http://localhost:3000')
    console.log('🗃️ Utilisez "npm run db:studio" pour voir les données dans Prisma Studio')

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erreur fatale:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
