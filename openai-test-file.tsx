import React, { useState, useEffect } from 'react'

// Mock translation functions for testing
const useTranslation = () => ({ t: (key: string, defaultValue: string) => defaultValue })

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
}

interface CartItem {
  productId: string
  quantity: number
  price: number
}

function EcommerceComponent() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing & Fashion' },
    { id: 'books', name: 'Books & Media' },
    { id: 'home', name: 'Home & Garden' }
  ]

  const orderStatuses = {
    pending: 'Order Pending',
    processing: 'Processing Order',
    shipped: 'Order Shipped',
    delivered: 'Order Delivered',
    cancelled: 'Order Cancelled'
  }

  const paymentMethods = [
    { id: 'credit_card', name: 'Credit Card', description: 'Pay with your credit card' },
    { id: 'paypal', name: 'PayPal', description: 'Pay with PayPal account' },
    { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct bank transfer' }
  ]

  const validationMessages = {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Please enter a valid phone number',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    invalidCardNumber: 'Please enter a valid card number',
    invalidExpiryDate: 'Please enter a valid expiry date',
    invalidCVV: 'Please enter a valid CVV'
  }

  const successMessages = {
    productAdded: 'Product added to cart successfully!',
    orderPlaced: 'Order placed successfully!',
    profileUpdated: 'Profile updated successfully!',
    passwordChanged: 'Password changed successfully!',
    reviewSubmitted: 'Review submitted successfully!'
  }

  const errorMessages = {
    networkError: 'Network connection error. Please try again.',
    serverError: 'Server error. Please try again later.',
    unauthorized: 'You are not authorized to perform this action.',
    notFound: 'The requested resource was not found.',
    validationError: 'Please check your input and try again.'
  }

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId: product.id, quantity: 1, price: product.price }]
    })
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (cart.length === 0) {
        throw new Error('Cart is empty')
      }

      setSuccess(t('checkout_success', 'Checkout completed successfully!'))
      setCart([])
    } catch (err) {
      setError(t('checkout_error', 'Failed to complete checkout. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    // Filter products based on search term
  }

  return (
    <div className="ecommerce-component">
      <header className="component-header">
        <h1>{t('ecommerce_title', 'Online Shopping Store')}</h1>
        <p>{t('ecommerce_subtitle', 'Find the best products at great prices')}</p>
      </header>

      <nav className="main-navigation">
        <div className="search-section">
          <input
            type="text"
            placeholder={t('search_placeholder', 'Search for products...')}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            {t('search_button', 'Search')}
          </button>
        </div>

        <div className="category-filter">
          <label htmlFor="category-select">{t('category_label', 'Category:')}</label>
          <select id="category-select" defaultValue="">
            <option value="">{t('all_categories', 'All Categories')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <main className="main-content">
        <section className="products-section">
          <h2>{t('featured_products', 'Featured Products')}</h2>
          
          {isLoading ? (
            <div className="loading-state">
              <p>{t('loading_products', 'Loading products...')}</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-price">
                    {t('price_label', 'Price:')} ${product.price}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="add-to-cart-button"
                  >
                    {t('add_to_cart', 'Add to Cart')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cart-section">
          <h2>{t('shopping_cart', 'Shopping Cart')}</h2>
          
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>{t('empty_cart_message', 'Your cart is empty')}</p>
              <p>{t('start_shopping_message', 'Start shopping to add items to your cart')}</p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.productId} className="cart-item">
                  <span>{t('quantity_label', 'Quantity:')} {item.quantity}</span>
                  <span>{t('price_label', 'Price:')} ${item.price}</span>
                </div>
              ))}
              
              <div className="cart-actions">
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="checkout-button"
                >
                  {isLoading ? t('processing', 'Processing...') : t('checkout', 'Checkout')}
                </button>
                
                <button
                  onClick={() => setCart([])}
                  className="clear-cart-button"
                >
                  {t('clear_cart', 'Clear Cart')}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="checkout-section">
          <h2>{t('checkout_title', 'Checkout')}</h2>
          
          <form className="checkout-form">
            <div className="form-section">
              <h3>{t('shipping_info', 'Shipping Information')}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">{t('first_name', 'First Name')}</label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder={t('enter_first_name', 'Enter your first name')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">{t('last_name', 'Last Name')}</label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder={t('enter_last_name', 'Enter your last name')}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('email_address', 'Email Address')}</label>
                <input
                  type="email"
                  id="email"
                  placeholder={t('enter_email', 'Enter your email address')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">{t('phone_number', 'Phone Number')}</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder={t('enter_phone', 'Enter your phone number')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">{t('shipping_address', 'Shipping Address')}</label>
                <textarea
                  id="address"
                  placeholder={t('enter_address', 'Enter your shipping address')}
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>{t('payment_info', 'Payment Information')}</h3>
              
              <div className="payment-methods">
                {paymentMethods.map(method => (
                  <div key={method.id} className="payment-method">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                    />
                    <label htmlFor={method.id}>
                      <strong>{method.name}</strong>
                      <span>{method.description}</span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">{t('card_number', 'Card Number')}</label>
                <input
                  type="text"
                  id="cardNumber"
                  placeholder={t('enter_card_number', 'Enter card number')}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">{t('expiry_date', 'Expiry Date')}</label>
                  <input
                    type="text"
                    id="expiryDate"
                    placeholder={t('enter_expiry', 'MM/YY')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cvv">{t('cvv', 'CVV')}</label>
                  <input
                    type="text"
                    id="cvv"
                    placeholder={t('enter_cvv', 'Enter CVV')}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="place-order-button">
                {t('place_order', 'Place Order')}
              </button>
              
              <button type="button" className="cancel-order-button">
                {t('cancel_order', 'Cancel')}
              </button>
            </div>
          </form>
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
        <div className="footer-content">
          <div className="footer-section">
            <h4>{t('customer_service', 'Customer Service')}</h4>
            <ul>
              <li><a href="/contact">{t('contact_us', 'Contact Us')}</a></li>
              <li><a href="/help">{t('help_center', 'Help Center')}</a></li>
              <li><a href="/returns">{t('returns_policy', 'Returns Policy')}</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>{t('about_us', 'About Us')}</h4>
            <ul>
              <li><a href="/about">{t('company_info', 'Company Information')}</a></li>
              <li><a href="/careers">{t('careers', 'Careers')}</a></li>
              <li><a href="/press">{t('press_room', 'Press Room')}</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>{t('legal', 'Legal')}</h4>
            <ul>
              <li><a href="/privacy">{t('privacy_policy', 'Privacy Policy')}</a></li>
              <li><a href="/terms">{t('terms_of_service', 'Terms of Service')}</a></li>
              <li><a href="/cookies">{t('cookie_policy', 'Cookie Policy')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>{t('footer_copyright', '© 2024 E-commerce Store. All rights reserved.')}</p>
        </div>
      </footer>
    </div>
  )
}

export default EcommerceComponent 