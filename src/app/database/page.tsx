'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: number
  name: string | null
  email: string
  created_at: string
  posts?: Post[]
}

interface Post {
  id: number
  title: string
  content: string | null
  published: boolean
  created_at: string
  users?: {
    id: number
    name: string | null
    email: string
  }
}

interface File {
  id: number
  filename: string
  url: string
  file_size: number
  mime_type: string
  category: string
  created_at: string
}

export default function DatabasePage() {
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // États pour les formulaires
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [newPost, setNewPost] = useState({ title: '', content: '', authorId: '', published: false })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [usersRes, postsRes, filesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/posts'),
        fetch('/api/files')
      ])

      if (!usersRes.ok || !postsRes.ok || !filesRes.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }

      const [usersData, postsData, filesData] = await Promise.all([
        usersRes.json(),
        postsRes.json(),
        filesRes.json()
      ])

      setUsers(usersData || [])
      setPosts(postsData || [])
      setFiles(filesData || [])
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        setNewUser({ name: '', email: '' })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de création')
    } finally {
      setCreating(false)
    }
  }

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPost,
          authorId: parseInt(newPost.authorId)
        }),
      })

      if (response.ok) {
        setNewPost({ title: '', content: '', authorId: '', published: false })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de création')
    } finally {
      setCreating(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('category', getFileCategory(uploadFile.type))
      formData.append('userId', users[0]?.id?.toString() || '')

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploadFile(null)
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'upload')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'upload')
    } finally {
      setUploading(false)
    }
  }

  const getFileCategory = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'document'
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
          Assurez-vous que PostgreSQL est configuré et accessible.
        </p>
        <Link href="/" className="mt-4 text-blue-600 hover:text-blue-800">
          ← Retour à l&apos;accueil
        </Link>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="max-w-7xl w-full mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← Retour à l&apos;accueil
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Base de Données Prisma</h1>
        
        {/* Formulaires de création */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Créer un utilisateur */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Créer un utilisateur</h2>
            <form onSubmit={createUser} className="space-y-4">
              <input
                type="text"
                placeholder="Nom"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Création...' : 'Créer'}
              </button>
            </form>
          </div>

          {/* Créer un post */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Créer un post</h2>
            <form onSubmit={createPost} className="space-y-4">
              <input
                type="text"
                placeholder="Titre"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              />
              <textarea
                placeholder="Contenu"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                rows={3}
              />
              <select
                value={newPost.authorId}
                onChange={(e) => setNewPost({ ...newPost, authorId: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="">Sélectionner un auteur</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newPost.published}
                  onChange={(e) => setNewPost({ ...newPost, published: e.target.checked })}
                  className="mr-2"
                />
                Publié
              </label>
              <button
                type="submit"
                disabled={creating || users.length === 0}
                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {creating ? 'Création...' : 'Créer Post'}
              </button>
            </form>
          </div>

          {/* Upload de fichier */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Upload fichier</h2>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                accept="image/*,video/*,application/pdf,.doc,.docx"
                required
              />
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {uploading ? 'Upload...' : 'Upload'}
              </button>
            </form>
          </div>
        </div>

        {/* Affichage des données */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Utilisateurs */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Utilisateurs ({users.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{user.name || 'Sans nom'}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <p className="text-xs text-gray-400">
                    ID: {user.id} | Créé: {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Posts ({posts.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {posts.map((post) => (
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
                      Par {post.users?.name || 'Anonyme'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fichiers */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Fichiers ({files.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {files.map((file) => (
                <div key={file.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-sm">{file.filename}</h3>
                  <p className="text-xs text-gray-600">
                    {file.category} | {(file.file_size / 1024).toFixed(1)} KB
                  </p>
                  {file.category === 'image' && (
                    <img 
                      src={file.url} 
                      alt={file.filename}
                      className="mt-2 max-w-full h-16 object-cover rounded"
                    />
                  )}
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Ouvrir
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
