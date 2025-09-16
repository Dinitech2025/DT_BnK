import Link from 'next/link'

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-4xl w-full">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← Retour à l&apos;accueil
        </Link>
        
        <h1 className="text-4xl font-bold mb-8 text-center">À propos de Dinitech</h1>
        
        <div className="prose prose-lg mx-auto dark:prose-invert">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Dinitech est un projet de test créé pour démontrer le déploiement d&apos;une application Next.js 
            sur un serveur Ubuntu sans Docker.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Technologies utilisées</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Next.js 15 - Framework React pour la production</li>
            <li>TypeScript - Typage statique pour JavaScript</li>
            <li>TailwindCSS - Framework CSS utilitaire</li>
            <li>ESLint - Outil de linting pour la qualité du code</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Objectifs du projet</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Démontrer une configuration Next.js moderne</li>
            <li>Tester le processus de déploiement sur Ubuntu</li>
            <li>Valider l&apos;utilisation de PM2 et Nginx</li>
            <li>Servir d&apos;exemple pour futurs projets</li>
          </ul>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mt-8">
            <h3 className="text-lg font-semibold mb-2">Note importante</h3>
            <p className="text-sm">
              Ce projet est conçu pour être simple mais complet, incluant toutes les bonnes pratiques 
              pour un déploiement en production sur serveur Ubuntu.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
