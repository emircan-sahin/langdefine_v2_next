'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store/auth'

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('react')
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const tabs = [
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'express', name: 'Express.js', icon: '🚀' },
    { id: 'node', name: 'Node.js', icon: '🟢' },
    { id: 'remix', name: 'Remix', icon: '⚡' }
  ]

  const frameworks = {
    react: {
      title: 'React Integration',
      description: 'Learn how to integrate translations into your React application',
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">LangDefine</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Integration Documentation
            </h1>
            <p className="text-lg text-gray-600">
              Learn how to integrate your exported translations into different frameworks and applications.
            </p>
          </div>

          {/* Framework Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Framework Content */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentFramework.title}
              </h2>
              <p className="text-gray-600 mt-1">
                {currentFramework.description}
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-8">
                {currentFramework.steps.map((step, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code className={`language-${step.language}`}>
                          {step.code}
                        </code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Tips */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  💡 Pro Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Always provide fallback translations for missing keys</li>
                  <li>• Use nested keys for better organization (e.g., "common.buttons.save")</li>
                  <li>• Consider using TypeScript for better type safety</li>
                  <li>• Implement locale detection based on user preferences</li>
                  <li>• Cache translations for better performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 