'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: number
  name: string | null
  email: string
  createdAt: string
  posts: Post[]
}

interface Post {
  id: number
  title: string
  content: string | null
  published: boolean
  createdAt: string
  author?: {
    id: number
    name: string | null
    email: string
  }
}

export default function DatabasePage() {
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Formulaire pour créer un utilisateur
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [usersRes, postsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/posts')
      ])

      if (!usersRes.ok || !postsRes.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }

      const usersData = await usersRes.json()
      const postsData = await postsRes.json()

      setUsers(usersData)
      setPosts(postsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        setNewUser({ name: '', email: '' })
        fetchData() // Recharger les données
      } else {
        throw new Error('Erreur lors de la création de l\'utilisateur')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de création')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-xl">Chargement des données...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-600 text-xl">Erreur: {error}</div>
        <p className="text-gray-600 mt-4">
          Assurez-vous que la base de données est configurée et accessible.
        </p>
        <Link href="/" className="mt-4 text-blue-600 hover:text-blue-800">
          ← Retour à l&apos;accueil
        </Link>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-24">
      <div className="max-w-6xl w-full mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← Retour à l&apos;accueil
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Test Base de Données Prisma</h1>
        
        {/* Section création d'utilisateur */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Créer un utilisateur</h2>
          <form onSubmit={createUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                required
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Création...' : 'Créer utilisateur'}
            </button>
          </form>
        </div>

        {/* Section utilisateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Utilisateurs ({users.length})
            </h2>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun utilisateur trouvé. Créez-en un ci-dessus !
                </p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      {user.posts.length} post(s)
                    </p>
                    <p className="text-xs text-gray-400">
                      Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section posts */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Posts ({posts.length})
            </h2>
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun post trouvé.
                </p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="font-semibold">{post.title}</h3>
                    {post.content && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {post.content.substring(0, 100)}...
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.published ? 'Publié' : 'Brouillon'}
                      </span>
                      <span className="text-xs text-gray-400">
                        Par {post.author?.name || 'Anonyme'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
