import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

function ExampleComponent() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = () => {
    setIsLoading(true)
    // Some async operation
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const menuItems = [
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About Us' },
    { key: 'contact', label: 'Contact Information' }
  ]

  const errorMessages = {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 8 characters long'
  }

  return (
    <div className="container">
      <header>
        <h1>Welcome to Our Application</h1>
        <p>This is a sample React component with various translation examples</p>
      </header>

      <main>
        <section>
          <h2>User Interface Elements</h2>
          
          <div className="form-section">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your email address"
            />
            {errorMessages.invalidEmail && (
              <span className="error">{errorMessages.invalidEmail}</span>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter your password"
            />
            {errorMessages.passwordTooShort && (
              <span className="error">{errorMessages.passwordTooShort}</span>
            )}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? 'Processing...' : 'Submit Form'}
          </button>
        </section>

        <section>
          <h2>Navigation Menu</h2>
          <nav>
            <ul>
              {menuItems.map(item => (
                <li key={item.key}>
                  <a href={`/${item.key}`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section>
          <h2>Translation Function Examples</h2>
          <p>{t('welcome_message', 'Welcome to our application!')}</p>
          <p>{t('description', 'This is a sample description')}</p>
          <button>{t('submit_button', 'Submit')}</button>
          <button>{t('cancel_button', 'Cancel')}</button>
        </section>

        <section>
          <h2>Status Messages</h2>
          <div className="status-messages">
            <p>Loading data...</p>
            <p>Data saved successfully!</p>
            <p>An error occurred while processing your request.</p>
          </div>
        </section>

        <section>
          <h2>Form Validation</h2>
          <div className="validation-messages">
            <p>Please fill in all required fields.</p>
            <p>Your password must contain at least one uppercase letter.</p>
            <p>Email format is invalid.</p>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2024 Our Company. All rights reserved.</p>
        <p>Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  )
}

export default ExampleComponent 