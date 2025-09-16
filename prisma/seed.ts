import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeding de la base de données...')

  // Créer des utilisateurs de test
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@dinitech.com' },
    update: {},
    create: {
      email: 'alice@dinitech.com',
      name: 'Alice Martin',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@dinitech.com' },
    update: {},
    create: {
      email: 'bob@dinitech.com',
      name: 'Bob Dupont',
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@dinitech.com' },
    update: {},
    create: {
      email: 'charlie@dinitech.com',
      name: 'Charlie Durand',
    },
  })

  console.log('✅ Utilisateurs créés:', { user1, user2, user3 })

  // Créer des posts de test
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Bienvenue sur Dinitech !',
        content: 'Ceci est le premier post de notre application Next.js avec Prisma. Nous utilisons TypeScript et TailwindCSS pour créer une application moderne et performante.',
        published: true,
        authorId: user1.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Guide de déploiement sur Ubuntu',
        content: 'Dans ce post, nous expliquons comment déployer une application Next.js sur un serveur Ubuntu sans Docker. Nous couvrons Node.js, PM2, Nginx et SSL.',
        published: true,
        authorId: user2.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Configuration Prisma avec PostgreSQL',
        content: 'Apprenez à configurer Prisma avec PostgreSQL pour créer une base de données robuste et moderne. Nous couvrons les migrations, les relations et les requêtes.',
        published: false,
        authorId: user1.id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Optimisation des performances Next.js',
        content: 'Découvrez les meilleures pratiques pour optimiser les performances de votre application Next.js, du côté client et serveur.',
        published: true,
        authorId: user3.id,
      },
    }),
  ])

  console.log('✅ Posts créés:', posts.length, 'posts')

  // Créer des contacts de test
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        name: 'Marie Laurent',
        email: 'marie@example.com',
        message: 'Bonjour, je suis intéressée par vos services. Pouvez-vous me contacter ?',
      },
    }),
    prisma.contact.create({
      data: {
        name: 'Jean Moreau',
        email: 'jean@example.com',
        message: 'Excellent travail sur le site ! J\'aimerais discuter d\'un projet similaire.',
      },
    }),
  ])

  console.log('✅ Contacts créés:', contacts.length, 'contacts')

  console.log('🎉 Seeding terminé avec succès !')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
