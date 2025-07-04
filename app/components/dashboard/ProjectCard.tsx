'use client'

interface Project {
  _id: string
  name: string
  description: string
  mainLanguage: string
  languages: string[]
  createdAt: string
}

interface ProjectCardProps {
  project: Project
  onProjectClick: () => void
  onDeleteProject: (projectId: string) => void
}

export default function ProjectCard({ project, onProjectClick, onDeleteProject }: ProjectCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project? This will also delete all categories and translation keys.')) {
      onDeleteProject(project._id)
    }
  }

  return (
    <div
      onClick={onProjectClick}
      className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {project.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {project.mainLanguage}
            </span>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
              title="Delete project"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {project.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {project.languages.length} language{project.languages.length !== 1 ? 's' : ''}
            </span>
            <span>
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {project.languages.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {project.languages.slice(0, 3).map((language) => (
                <span
                  key={language}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {language}
                </span>
              ))}
              {project.languages.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{project.languages.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 