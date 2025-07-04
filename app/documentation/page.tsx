'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store/auth'
import { DashboardLayout } from '../components/ui/dashboard-layout'
import { PageHeader } from '../components/ui/page-header'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  BookOpen, 
  Code, 
  FileText, 
  Globe, 
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Terminal,
  Zap
} from 'lucide-react'

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('react')
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const tabs = [
    { id: 'react', name: 'React', icon: '⚛️', description: 'React applications' },
    { id: 'express', name: 'Express.js', icon: '🚀', description: 'Node.js web servers' },
    { id: 'node', name: 'Node.js', icon: '🟢', description: 'Server-side applications' },
    { id: 'remix', name: 'Remix', icon: '⚡', description: 'Full-stack framework' }
  ]

  const frameworks = {
    react: {
      title: 'React Integration',
      description: 'Learn how to integrate translations into your React application with react-i18next',
      icon: '⚛️',
      steps: [
        {
          title: '1. Install i18n library',
          code: 'npm install react-i18next i18next',
          language: 'bash'
        },
        {
          title: '2. Import your translations',
          code: `import enTranslations from './translations-en.json'
import trTranslations from './translations-tr.json'

const resources = {
  en: {
    translation: enTranslations
  },
  tr: {
    translation: trTranslations
  }
}`,
          language: 'javascript'
        },
        {
          title: '3. Initialize i18next',
          code: `import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n`,
          language: 'javascript'
        },
        {
          title: '4. Use in components',
          code: `import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.buttons.save')}</h1>
      <p>{t('common.messages.welcome')}</p>
    </div>
  )
}`,
          language: 'javascript'
        }
      ]
    },
    express: {
      title: 'Express.js Integration',
      description: 'Learn how to integrate translations into your Express.js application',
      icon: '🚀',
      steps: [
        {
          title: '1. Install i18n library',
          code: 'npm install i18next-http-middleware i18next',
          language: 'bash'
        },
        {
          title: '2. Import your translations',
          code: `const translations = require('./translations.js')

// translations structure:
// {
//   en: { common: { buttons: { save: 'Save' } } },
//   tr: { common: { buttons: { save: 'Kaydet' } } }
// }`,
          language: 'javascript'
        },
        {
          title: '3. Setup i18next',
          code: `const i18next = require('i18next')
const middleware = require('i18next-http-middleware')

i18next.init({
  resources: {
    en: { translation: translations.en },
    tr: { translation: translations.tr }
  },
  lng: 'en',
  fallbackLng: 'en'
})

app.use(middleware.handle(i18next))`,
          language: 'javascript'
        },
        {
          title: '4. Use in routes',
          code: `app.get('/', (req, res) => {
  const t = req.t
  
  res.json({
    message: t('common.messages.welcome'),
    button: t('common.buttons.save')
  })
})`,
          language: 'javascript'
        }
      ]
    },
    node: {
      title: 'Node.js Integration',
      description: 'Learn how to integrate translations into your Node.js application',
      icon: '🟢',
      steps: [
        {
          title: '1. Import your translations',
          code: `const translations = require('./translations.js')

// translations structure:
// {
//   en: { common: { buttons: { save: 'Save' } } },
//   tr: { common: { buttons: { save: 'Kaydet' } } }
// }`,
          language: 'javascript'
        },
        {
          title: '2. Create translation helper',
          code: `function t(key, language = 'en') {
  const keys = key.split('.')
  let value = translations[language]
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k]
    } else {
      return key // fallback to key if translation not found
    }
  }
  
  return value
}`,
          language: 'javascript'
        },
        {
          title: '3. Use in your application',
          code: `// Example usage
console.log(t('common.buttons.save', 'en')) // Output: Save
console.log(t('common.buttons.save', 'tr')) // Output: Kaydet

// In API responses
app.get('/api/messages', (req, res) => {
  const lang = req.query.lang || 'en'
  
  res.json({
    welcome: t('common.messages.welcome', lang),
    save: t('common.buttons.save', lang)
  })
})`,
          language: 'javascript'
        }
      ]
    },
    remix: {
      title: 'Remix Integration',
      description: 'Learn how to integrate translations into your Remix application',
      icon: '⚡',
      steps: [
        {
          title: '1. Install i18n library',
          code: 'npm install remix-i18next i18next',
          language: 'bash'
        },
        {
          title: '2. Import your translations',
          code: `import enTranslations from './translations-en.json'
import trTranslations from './translations-tr.json'

const resources = {
  en: {
    translation: enTranslations
  },
  tr: {
    translation: trTranslations
  }
}`,
          language: 'javascript'
        },
        {
          title: '3. Setup i18next configuration',
          code: `// i18next.server.ts
import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import resources from './translations'

const initI18next = async (locale: string) => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .init({
      lng: locale,
      fallbackLng: 'en',
      resources,
      interpolation: {
        escapeValue: false
      }
    })
  return i18nInstance
}

export default initI18next`,
          language: 'javascript'
        },
        {
          title: '4. Use in Remix routes',
          code: `// routes/_index.tsx
import { useTranslation } from 'react-i18next'
import { json, LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request }) => {
  const locale = getLocale(request) // implement your locale detection
  const i18n = await initI18next(locale)
  
  return json({ locale })
}

export default function Index() {
  const { locale } = useLoaderData()
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.messages.welcome')}</h1>
      <button>{t('common.buttons.save')}</button>
    </div>
  )
}`,
          language: 'javascript'
        }
      ]
    }
  }

  const currentFramework = frameworks[activeTab as keyof typeof frameworks]

  return (
    <DashboardLayout>
      <PageHeader
        title="Documentation"
        description="Learn how to integrate your exported translations into different frameworks and applications."
      >
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </PageHeader>

      {/* Framework Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Framework Content */}
      <Card className="hover-lift">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">{currentFramework.icon}</span>
            </div>
            <div>
              <CardTitle className="text-2xl">{currentFramework.title}</CardTitle>
              <CardDescription className="text-base">
                {currentFramework.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Steps */}
          <div className="space-y-6">
            {currentFramework.steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <div className="bg-muted rounded-lg p-4 overflow-x-auto border">
                      <pre className="text-sm">
                        <code className={`language-${step.language} text-foreground`}>
                          {step.code}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tips */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg">Pro Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Always provide fallback translations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Use nested keys for organization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Consider TypeScript for type safety</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Implement locale detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Cache translations for performance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Use consistent naming conventions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover-lift cursor-pointer" onClick={() => router.push('/dashboard')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Create Project</h4>
                    <p className="text-sm text-muted-foreground">Start a new translation project</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Code className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">API Reference</h4>
                    <p className="text-sm text-muted-foreground">View API documentation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Examples</h4>
                    <p className="text-sm text-muted-foreground">Browse code examples</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
} 