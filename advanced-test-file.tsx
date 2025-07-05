import React, { useState, useEffect } from 'react'

// Mock translation functions for testing
const useTranslation = () => ({ t: (key: string, defaultValue: string) => defaultValue })
const t = (key: string, defaultValue: string) => defaultValue

interface User {
  name: string
  email: string
  role: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
}

function AdvancedComponent() {
  const { t: translate } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  const validationMessages = {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 8 characters long',
    passwordMismatch: 'Passwords do not match',
    invalidPhone: 'Please enter a valid phone number'
  }

  const statusMessages = {
    loading: 'Loading data...',
    saving: 'Saving changes...',
    success: 'Data saved successfully!',
    error: 'An error occurred while processing your request.',
    networkError: 'Network connection error. Please try again.'
  }

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'users', label: 'User Management', icon: 'users' },
    { key: 'settings', label: 'Settings', icon: 'settings' },
    { key: 'reports', label: 'Reports & Analytics', icon: 'chart' }
  ]

  const userRoles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'Regular User' },
    { value: 'guest', label: 'Guest User' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess(t('form_submit_success', 'Form submitted successfully!'))
    } catch (err) {
      setError(t('form_submit_error', 'Failed to submit form. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="advanced-component">
      <header className="component-header">
        <h1>{t('advanced_component_title', 'Advanced User Management')}</h1>
        <p>{t('advanced_component_description', 'Manage users and their permissions with advanced features')}</p>
      </header>

      <nav className="main-navigation">
        <ul>
          {navigationItems.map(item => (
            <li key={item.key}>
              <a href={`/${item.key}`}>
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        <section className="form-section">
          <h2>{t('user_registration', 'User Registration')}</h2>
          
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">{t('first_name', 'First Name')}</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder={t('enter_first_name', 'Enter your first name')}
                  required
                />
                {!formData.firstName && (
                  <span className="error-message">{validationMessages.required}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">{t('last_name', 'Last Name')}</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder={t('enter_last_name', 'Enter your last name')}
                  required
                />
                {!formData.lastName && (
                  <span className="error-message">{validationMessages.required}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('email_address', 'Email Address')}</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('enter_email', 'Enter your email address')}
                required
              />
              {formData.email && !formData.email.includes('@') && (
                <span className="error-message">{validationMessages.invalidEmail}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('password', 'Password')}</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={t('enter_password', 'Enter your password')}
                required
              />
              {formData.password && formData.password.length < 8 && (
                <span className="error-message">{validationMessages.passwordTooShort}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role">{t('user_role', 'User Role')}</label>
              <select id="role" defaultValue="">
                <option value="">{t('select_role', 'Select a role')}</option>
                {userRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? t('processing', 'Processing...') : t('register_user', 'Register User')}
              </button>
              
              <button
                type="button"
                className="cancel-button"
                onClick={() => setFormData({ firstName: '', lastName: '', email: '', password: '' })}
              >
                {t('cancel', 'Cancel')}
              </button>
            </div>
          </form>
        </section>

        <section className="status-section">
          <h3>{t('status_messages', 'Status Messages')}</h3>
          <div className="status-list">
            <div className="status-item loading">
              <span className="status-icon">⏳</span>
              <span>{statusMessages.loading}</span>
            </div>
            <div className="status-item saving">
              <span className="status-icon">💾</span>
              <span>{statusMessages.saving}</span>
            </div>
            <div className="status-item success">
              <span className="status-icon">✅</span>
              <span>{statusMessages.success}</span>
            </div>
            <div className="status-item error">
              <span className="status-icon">❌</span>
              <span>{statusMessages.error}</span>
            </div>
          </div>
        </section>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-banner">
            <span className="success-icon">🎉</span>
            <span>{success}</span>
          </div>
        )}
      </main>

      <footer className="component-footer">
        <p>{t('footer_copyright', '© 2024 Advanced Component. All rights reserved.')}</p>
        <div className="footer-links">
          <a href="/privacy">{t('privacy_policy', 'Privacy Policy')}</a>
          <a href="/terms">{t('terms_of_service', 'Terms of Service')}</a>
          <a href="/contact">{t('contact_us', 'Contact Us')}</a>
        </div>
      </footer>
    </div>
  )
}

export default AdvancedComponent 