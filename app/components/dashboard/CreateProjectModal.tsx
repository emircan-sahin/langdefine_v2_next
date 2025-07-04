'use client'

import { useState } from 'react'

interface CreateProjectModalProps {
  onClose: () => void
  onSubmit: (projectData: {
    name: string
    description: string
    mainLanguage: string
    languages: string[]
  }) => void
}

export default function CreateProjectModal({ onClose, onSubmit }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mainLanguage, setMainLanguage] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [newLanguage, setNewLanguage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        name,
        description,
        mainLanguage,
        languages: [mainLanguage, ...languages.filter(lang => lang !== mainLanguage)],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage) && newLanguage !== mainLanguage) {
      setLanguages([...languages, newLanguage])
      setNewLanguage('')
    }
  }

  const removeLanguage = (language: string) => {
    setLanguages(languages.filter(lang => lang !== language))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="mainLanguage" className="block text-sm font-medium text-gray-700">
                Main Language
              </label>
              <input
                type="text"
                id="mainLanguage"
                value={mainLanguage}
                onChange={(e) => setMainLanguage(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., en, es, fr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Languages
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., es, fr"
                />
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Add
                </button>
              </div>
              {languages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <span
                      key={language}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => removeLanguage(language)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name || !mainLanguage}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 