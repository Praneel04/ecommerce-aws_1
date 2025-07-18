import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Amplify } from 'aws-amplify';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import awsConfig from './aws-config';

// Configure AWS Amplify
Amplify.configure(awsConfig);

// Types
interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  inventory: number;
  sellerId: string;
  status: string;
  images?: string[];
  category?: string;
  tags?: string[];
}

interface CartItem extends Product {
  quantity: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Main App Component with Authentication
function AppContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'products' | 'cart'>('products');
  const { user, logout } = useAuth();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      if ((response.data as any).success) {
        setProducts((response.data as any).data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="product-card">
      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.title} />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <p className="product-category">Category: {product.category}</p>
        <p className="product-inventory">In Stock: {product.inventory}</p>
        <div className="product-tags">
          {product.tags?.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <button 
          className="add-to-cart-btn"
          onClick={() => addToCart(product)}
          disabled={product.inventory <= 0}
        >
          {product.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );

  const CartView = () => (
    <div className="cart-view">
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <h4>{item.title}</h4>
              <p>${item.price.toFixed(2)} each</p>
              <div className="quantity-controls">
                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                <span>Quantity: {item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <div className="cart-total">
            <h3>Total: ${getTotalPrice().toFixed(2)}</h3>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="App">
      <header className="app-header">
        <h1>🛒 Medusa Serverless MVP</h1>
        <nav className="nav">
          <button 
            className={currentView === 'products' ? 'active' : ''}
            onClick={() => setCurrentView('products')}
          >
            Products
          </button>
          <button 
            className={currentView === 'cart' ? 'active' : ''}
            onClick={() => setCurrentView('cart')}
          >
            Cart ({cart.length})
          </button>
          <div className="user-info">
            <span>Welcome, {user?.firstName || user?.email}!</span>
            <span className="user-role">({user?.role})</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </nav>
      </header>

      <main className="main-content">
        {currentView === 'products' && (
          <div className="products-view">
            <h2>Products</h2>
            {isLoading ? (
              <p>Loading products...</p>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'cart' && <CartView />}
      </main>

      <footer className="app-footer">
        <p>
          🚀 Powered by AWS Lambda + S3 + CloudFront + Cognito | 
          API: {API_BASE_URL} | 
          Step 4: AWS Cognito Authentication
        </p>
      </footer>
    </div>
  );
}

// Authentication Wrapper Component
function AuthenticatedApp() {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <header className="app-header">
          <h1>🛒 Medusa Serverless MVP</h1>
        </header>
        <main className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            {authMode === 'login' ? (
              <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        </main>
      </div>
    );
  }

  return <AppContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
