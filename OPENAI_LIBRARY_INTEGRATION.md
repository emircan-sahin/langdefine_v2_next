# OpenAI Library Integration (Functions & Tools)

Bu dokümantasyon, OpenAI kütüphanesi kullanılarak implement edilen AI destekli translation analizi özelliğini açıklar.

## 🚀 Özellikler

- **OpenAI Library**: Resmi OpenAI kütüphanesi kullanımı
- **Functions & Tools**: OpenAI'nın yeni tools API'si ile entegrasyon
- **Structured Output**: Yapılandırılmış JSON çıktısı
- **Error Handling**: Kapsamlı hata yönetimi
- **Fallback Analysis**: AI başarısız olursa regex analizi

## 🔧 Teknik Implementasyon

### 1. OpenAI Kütüphanesi Kurulumu

```bash
npm install openai
```

### 2. Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. API Endpoint Implementation

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
```

## 🤖 Tools API Kullanımı

### Tool Definition:
```typescript
const translationAnalysisTool = {
  type: 'function' as const,
  function: {
    name: 'extract_translation_keys',
    description: 'Extract translation keys and their English text values from React file content',
    parameters: {
      type: 'object',
      properties: {
        keys: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
              description: { type: 'string' },
              lineNumber: { type: 'number' },
              confidence: { type: 'number' }
            },
            required: ['key', 'value', 'lineNumber', 'confidence']
          }
        }
      },
      required: ['keys']
    }
  }
}
```

### OpenAI API Call:
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: 'You are an expert web developer and internationalization specialist. Analyze web files (React, HTML, JavaScript, TypeScript) and extract translation keys with their English text values...'
    },
    {
      role: 'user',
      content: `Analyze this React file...`
    }
  ],
  tools: [translationAnalysisTool],
  tool_choice: { type: 'function', function: { name: 'extract_translation_keys' } },
  temperature: 0.1,
  max_tokens: 2000
})
```

### Response Parsing:
```typescript
const toolCall = response.choices[0]?.message?.tool_calls?.[0]

if (toolCall && toolCall.function.name === 'extract_translation_keys') {
  const args = JSON.parse(toolCall.function.arguments)
  return args.keys || []
}
```

## 📊 Performans Karşılaştırması

### OpenAI Library vs Fetch API:

| Özellik | OpenAI Library | Fetch API |
|---------|----------------|-----------|
| **Type Safety** | ✅ Tam tip güvenliği | ❌ Manuel tip kontrolü |
| **Error Handling** | ✅ Otomatik hata yönetimi | ❌ Manuel hata kontrolü |
| **Rate Limiting** | ✅ Otomatik retry | ❌ Manuel implementasyon |
| **Streaming** | ✅ Built-in support | ❌ Manuel implementasyon |
| **Function Calling** | ✅ Native support | ❌ Manuel JSON parsing |

## 🔍 Tespit Edilen Translation Patterns

### 1. Translation Functions
```typescript
// Tespit edilen patterns:
t('key', 'value')
t('key')
useTranslation('key')
translate('key')
$t('key')
i18n.t('key')
```

### 2. JSX Content
```jsx
// Hardcoded text in JSX
<h1>Welcome to Our Store</h1>
<p>Find the best products</p>
<button>Add to Cart</button>
```

### 3. HTML Content
```html
<!-- HTML text content -->
<h1>Welcome to Our Store</h1>
<p>Find the best products at great prices</p>
<button>Add to Cart</button>
<a href="/products">Browse Products</a>
<label>Email Address</label>
<input placeholder="Enter your email" />
```

### 3. Form Elements
```jsx
// Form labels and placeholders
<label>Email Address</label>
<input placeholder="Enter your email" />
<textarea placeholder="Enter your message" />
```

### 4. Object Properties
```typescript
// Object with English text
const messages = {
  success: 'Operation completed successfully',
  error: 'An error occurred',
  loading: 'Please wait...'
}
```

### 5. Array Items
```typescript
// Array with English text
const categories = [
  'Electronics',
  'Clothing & Fashion',
  'Books & Media'
]
```

## 🧪 Test Dosyaları

### 1. Basic Test File (`example-react-file.jsx`)
- Temel translation patterns
- Basit JSX içeriği
- Translation fonksiyonları

### 2. Advanced Test File (`advanced-test-file.tsx`)
- Gelişmiş form yapıları
- Karmaşık object structures
- Multiple translation patterns

### 3. E-commerce Test File (`openai-test-file.tsx`)
- Gerçek dünya e-commerce senaryosu
- Kapsamlı form validasyonları
- Çoklu translation contexts

### 4. HTML Test File (`html-test-file.html`)
- Kapsamlı HTML e-commerce sayfası
- HTML elementleri ve attribute'ları
- Form elementleri ve accessibility

## ⚡ Optimizasyonlar

### 1. Model Seçimi
```typescript
// Hızlı analiz için
model: 'gpt-4o-mini'

// Daha detaylı analiz için
model: 'gpt-4o'
```

### 2. Temperature Ayarları
```typescript
// Tutarlı sonuçlar için
temperature: 0.1

// Daha yaratıcı analiz için
temperature: 0.3
```

### 3. Token Limitleri
```typescript
// Büyük dosyalar için
max_tokens: 4000

// Küçük dosyalar için
max_tokens: 2000
```

## 🔒 Güvenlik Önlemleri

### 1. API Key Güvenliği
```typescript
// Environment variable kullanımı
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
```

### 2. Input Validation
```typescript
// Dosya boyutu kontrolü
if (fileContent.length > 1000000) {
  throw new Error('File too large')
}

// Dosya türü kontrolü - HTML desteği ile
const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.htm']
const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
if (!allowedExtensions.includes(fileExtension)) {
  throw new Error('Invalid file type')
}
```

### 3. Error Handling
```typescript
try {
  const response = await openai.chat.completions.create({...})
} catch (error) {
  console.error('OpenAI API error:', error)
  // Fallback to regex analysis
  return fallbackAnalysis(fileContent, fileName)
}
```

## 📈 Monitoring ve Logging

### 1. Performance Metrics
```typescript
const startTime = Date.now()
const response = await openai.chat.completions.create({...})
const duration = Date.now() - startTime

console.log(`Analysis completed in ${duration}ms`)
```

### 2. Error Tracking
```typescript
try {
  // OpenAI call
} catch (error) {
  console.error('OpenAI API Error:', {
    error: error.message,
    fileName,
    fileSize: fileContent.length,
    timestamp: new Date().toISOString()
  })
}
```

### 3. Success Metrics
```typescript
console.log('Analysis Results:', {
  fileName,
  keysFound: extractedKeys.length,
  confidence: extractedKeys.reduce((acc, key) => acc + key.confidence, 0) / extractedKeys.length,
  model: 'gpt-4o-mini'
})
```

## 🔮 Gelecek Geliştirmeler

### 1. Streaming Support
```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  tools: [...],
  stream: true
})

for await (const chunk of stream) {
  // Real-time progress updates
}
```

### 2. Batch Processing
```typescript
// Multiple files at once
const batchResults = await Promise.all(
  files.map(file => analyzeWithFunctions(file.content, file.name, ...))
)
```

### 3. Custom Models
```typescript
// Fine-tuned model support
model: 'ft:gpt-4o-mini:your-org:custom-model:1.0'
```

## 🎯 Best Practices

### 1. Rate Limiting
```typescript
// Implement rate limiting
const rateLimiter = new Map()
const cooldown = 1000 // 1 second

if (rateLimiter.has(userId) && Date.now() - rateLimiter.get(userId) < cooldown) {
  throw new Error('Rate limit exceeded')
}
rateLimiter.set(userId, Date.now())
```

### 2. Caching
```typescript
// Cache results for repeated files
const cache = new Map()
const cacheKey = `${fileName}-${fileContentHash}`

if (cache.has(cacheKey)) {
  return cache.get(cacheKey)
}
```

### 3. Progressive Enhancement
```typescript
// Start with basic analysis, enhance with AI
const basicKeys = fallbackAnalysis(fileContent, fileName)
const aiKeys = await analyzeWithFunctions(fileContent, fileName, ...)

return [...basicKeys, ...aiKeys]
```

Bu implementasyon sayesinde OpenAI kütüphanesinin tüm avantajlarından yararlanarak güvenli, hızlı ve güvenilir bir AI analizi elde ettik. 