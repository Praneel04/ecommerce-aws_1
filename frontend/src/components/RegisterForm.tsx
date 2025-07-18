import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './AuthComponents.css';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'buyer' as 'buyer' | 'seller',
    sellerCompany: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  
  const { register, confirmRegistration } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate seller company if role is seller
    if (formData.role === 'seller' && !formData.sellerCompany.trim()) {
      setError('Company name is required for sellers');
      return;
    }

    setIsLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      sellerCompany: formData.role === 'seller' ? formData.sellerCompany : undefined,
    });

    if (result.success) {
      setShowConfirmation(true);
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setIsLoading(false);
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await confirmRegistration(formData.email, confirmationCode);
    
    if (result.success) {
      // Auto-login after successful confirmation
      onSwitchToLogin();
    } else {
      setError(result.error || 'Verification failed');
    }
    
    setIsLoading(false);
  };

  if (showConfirmation) {
    return (
      <div className="auth-form">
        <h2>Verify Your Email</h2>
        <p>We've sent a verification code to <strong>{formData.email}</strong></p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleConfirmation}>
          <div className="form-group">
            <label htmlFor="confirmationCode">Verification Code</label>
            <input
              type="text"
              id="confirmationCode"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter the 6-digit code"
              maxLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button primary"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        
        <div className="auth-switch">
          <button 
            type="button" 
            className="link-button"
            onClick={() => setShowConfirmation(false)}
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2>Create Your Account</h2>
      <p>Join Medusa Serverless as a buyer or seller</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="John"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Doe"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            placeholder="john@example.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            disabled={isLoading}
          >
            <option value="buyer">Buyer - Browse and purchase products</option>
            <option value="seller">Seller - Sell products and manage inventory</option>
          </select>
        </div>
        
        {formData.role === 'seller' && (
          <div className="form-group">
            <label htmlFor="sellerCompany">Company Name</label>
            <input
              type="text"
              id="sellerCompany"
              name="sellerCompany"
              value={formData.sellerCompany}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Your Company Name"
            />
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Min 8 characters"
              minLength={8}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Repeat password"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="auth-button primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="auth-switch">
        <p>
          Already have an account?{' '}
          <button 
            type="button" 
            className="link-button"
            onClick={onSwitchToLogin}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
