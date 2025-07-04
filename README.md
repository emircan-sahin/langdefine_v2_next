# LangDefine - AI-Powered i18n Panel

LangDefine is an AI-powered internationalization (i18n) panel that helps you create and manage translations with artificial intelligence assistance. Create projects, organize categories, and let AI help you translate your content.

## Features

- 🔐 **User Authentication** - Secure login and registration system
- 📁 **Project Management** - Create and manage multiple translation projects
- 📂 **Category Organization** - Hierarchical category system for organizing translations
- 🔑 **Translation Keys** - Create keys with multiple language values
- 🤖 **AI Translation** - OpenAI-powered automatic translation assistance
- 📊 **Dashboard** - Clean and intuitive interface for managing translations
- 🌐 **Multi-language Support** - Support for unlimited languages per project

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Stylus modules
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **AI**: OpenAI API for translations
- **UI Components**: Radix UI, Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd langdefine_v2_next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/langdefine
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # OpenAI API Key
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### 1. Authentication

- Visit the app and you'll be redirected to the login page
- Create an account or sign in with existing credentials
- JWT tokens are automatically managed and persisted

### 2. Creating Projects

1. Click "Create Project" on the dashboard
2. Fill in:
   - **Project Name**: Your project identifier
   - **Description**: Optional project description
   - **Main Language**: Primary language (e.g., "en", "es")
   - **Additional Languages**: Other languages to support

### 3. Managing Categories

1. Navigate to your project
2. Click "Create Category"
3. Set:
   - **Category Name**: Organizational name
   - **Description**: Optional category description
   - **Parent Category**: Optional parent for hierarchical organization

### 4. Creating Translation Keys

1. Click "Add Key" on any category
2. Fill in:
   - **Title**: Human-readable name
   - **Key**: Programmatic identifier (e.g., "welcome_message")
   - **Description**: Context for AI translation
   - **Category**: Select the appropriate category
   - **Translation Values**: Add values for each language

### 5. AI Translation

The system uses OpenAI's GPT models to provide translation suggestions. The AI considers:
- Source and target languages
- Context provided in descriptions
- Original text meaning and tone

## API Usage Examples

### React/Next.js Integration

```typescript
// Using translations in React components
import { useTranslation } from '@/hooks/useTranslation'

function WelcomeComponent() {
  const { t } = useTranslation('en') // or your preferred language
  
  return (
    <div>
      <h1>{t('welcome_message')}</h1>
      <p>{t('welcome_description')}</p>
    </div>
  )
}

// Custom hook for translation
export function useTranslation(language: string) {
  const translations = useTranslationStore(state => state.translations)
  
  const t = (key: string) => {
    return translations[language]?.[key] || key
  }
  
  return { t }
}
```

### Express.js Integration

```javascript
// Express.js middleware for i18n
const express = require('express')
const app = express()

// Middleware to load translations
app.use('/api/translations/:projectId/:language', async (req, res) => {
  try {
    const { projectId, language } = req.params
    
    // Fetch translations from your database
    const translations = await TranslationKey.find({
      projectId,
      'values.language': language
    })
    
    // Format as key-value pairs
    const formatted = translations.reduce((acc, key) => {
      const value = key.values.find(v => v.language === language)
      if (value) {
        acc[key.key] = value.value
      }
      return acc
    }, {})
    
    res.json(formatted)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load translations' })
  }
})

// Usage in templates
app.get('/', async (req, res) => {
  const translations = await fetch('/api/translations/my-project/en')
  res.render('index', { t: translations })
})
```

### JavaScript/TypeScript Usage

```typescript
// Direct API usage
async function loadTranslations(projectId: string, language: string) {
  const response = await fetch(`/api/translations/${projectId}/${language}`)
  return response.json()
}

// Usage
const translations = await loadTranslations('my-project', 'en')
console.log(translations.welcome_message) // "Welcome to our app!"
```

## Database Schema

### User
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // hashed
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  mainLanguage: String,
  languages: [String],
  userId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Category
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  projectId: ObjectId,
  parentCategoryId: ObjectId, // optional
  createdAt: Date,
  updatedAt: Date
}
```

### TranslationKey
```javascript
{
  _id: ObjectId,
  title: String,
  key: String,
  description: String,
  values: [{
    language: String,
    value: String
  }],
  categoryId: ObjectId,
  projectId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `OPENAI_API_KEY` | OpenAI API key for translations | Yes |

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
langdefine_v2_next/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── projects/          # Project management
│   │   ├── categories/        # Category management
│   │   ├── keys/             # Translation keys
│   │   └── translate/         # AI translation
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   └── ui/               # UI components
│   ├── lib/                  # Utilities and models
│   │   ├── models/           # Mongoose models
│   │   └── auth.ts           # Authentication utilities
│   ├── store/                # Zustand stores
│   ├── dashboard/            # Dashboard pages
│   ├── login/                # Authentication pages
│   └── register/             # Registration pages
├── public/                   # Static assets
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
