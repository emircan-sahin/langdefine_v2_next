'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Globe, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  onDelete: (projectId: string) => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project? This will also delete all categories and translation keys.')) {
      onDelete(project._id)
    }
  }

  const handleClick = () => {
    router.push(`/dashboard/projects/${project._id}`)
  }

  return (
    <Card 
      className="group hover-lift cursor-pointer transition-all duration-200"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {project.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {project.languages.length} language{project.languages.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {project.mainLanguage}
          </Badge>
          
          {project.languages.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {project.languages.slice(0, 3).map((language) => (
                <Badge key={language} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
              {project.languages.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.languages.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 