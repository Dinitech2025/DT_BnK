import Link from 'next/link'

export default function Features() {
  const features = [
    {
      title: "App Router",
      description: "Utilise le nouveau App Router de Next.js 13+ pour une meilleure structure et performance.",
      icon: "🚀"
    },
    {
      title: "TypeScript",
      description: "Typage statique complet pour une meilleure expérience de développement.",
      icon: "⚡"
    },
    {
      title: "TailwindCSS",
      description: "Styling moderne et responsive avec un framework CSS utilitaire.",
      icon: "🎨"
    },
    {
      title: "Mode sombre",
      description: "Support natif du mode sombre avec TailwindCSS.",
      icon: "🌙"
    },
    {
      title: "SEO optimisé",
      description: "Métadonnées configurées pour un bon référencement.",
      icon: "📈"
    },
    {
      title: "Production ready",
      description: "Configuration optimisée pour le déploiement en production.",
      icon: "🔧"
    }
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-6xl w-full">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← Retour à l&apos;accueil
        </Link>
        
        <h1 className="text-4xl font-bold mb-4 text-center">Fonctionnalités</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 text-center">
          Découvrez toutes les fonctionnalités intégrées dans ce projet test
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Prêt pour le déploiement</h2>
          <p className="text-lg mb-6">
            Ce projet est optimisé pour être déployé facilement sur un serveur Ubuntu 
            avec Node.js, PM2 et Nginx.
          </p>
          <div className="flex justify-center space-x-4">
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">Node.js</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">PM2</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">Nginx</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">SSL</span>
          </div>
        </div>
      </div>
    </main>
  )
}
