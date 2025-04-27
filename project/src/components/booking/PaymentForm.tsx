import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, CheckSquare, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  paymentMethod: 'card' | 'upi';
  onSubmit: (data: any) => void;
  amount: number;
  error: string | null;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  paymentMethod, 
  onSubmit, 
  amount,
  error
}) => {
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // UPI form state
  const [upiId, setUpiId] = useState('');

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const input = value.replace(/\D/g, '');
    const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    validateField('cardNumber', formatted);
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...formErrors };
    
    switch (field) {
      case 'cardNumber':
        if (!value.trim()) {
          newErrors.cardNumber = 'Card number is required';
        } else if (value.replace(/\s/g, '').length < 16) {
          newErrors.cardNumber = 'Card number must be 16 digits';
        } else {
          delete newErrors.cardNumber;
        }
        break;
        
      case 'cardName':
        if (!value.trim()) {
          newErrors.cardName = 'Name is required';
        } else {
          delete newErrors.cardName;
        }
        break;
        
      case 'expiryMonth':
        if (!value) {
          newErrors.expiryMonth = 'Required';
        } else {
          delete newErrors.expiryMonth;
        }
        break;
        
      case 'expiryYear':
        if (!value) {
          newErrors.expiryYear = 'Required';
        } else {
          delete newErrors.expiryYear;
        }
        break;
        
      case 'cvv':
        if (!value.trim()) {
          newErrors.cvv = 'CVV is required';
        } else if (value.length < 3) {
          newErrors.cvv = 'Invalid CVV';
        } else {
          delete newErrors.cvv;
        }
        break;
        
      case 'upiId':
        if (!value.trim()) {
          newErrors.upiId = 'UPI ID is required';
        } else if (!value.includes('@')) {
          newErrors.upiId = 'Invalid UPI ID format';
        } else {
          delete newErrors.upiId;
        }
        break;
    }
    
    setFormErrors(newErrors);
  };

  const validateCardForm = () => {
    validateField('cardNumber', cardNumber);
    validateField('cardName', cardName);
    validateField('expiryMonth', expiryMonth);
    validateField('expiryYear', expiryYear);
    validateField('cvv', cvv);
    
    return !formErrors.cardNumber && !formErrors.cardName && 
           !formErrors.expiryMonth && !formErrors.expiryYear && !formErrors.cvv;
  };

  const validateUpiForm = () => {
    validateField('upiId', upiId);
    return !formErrors.upiId;
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateCardForm()) {
      onSubmit({
        type: 'card',
        cardNumber,
        cardName,
        expiry: `${expiryMonth}/${expiryYear}`,
        cvv
      });
    }
  };

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateUpiForm()) {
      onSubmit({
        type: 'upi',
        upiId
      });
    }
  };

  // Get card type based on first digits
  const getCardType = (number: string) => {
    const digits = number.replace(/\D/g, '');
    
    if (digits.startsWith('4')) {
      return 'Visa';
    } else if (/^5[1-5]/.test(digits)) {
      return 'Mastercard';
    } else if (/^3[47]/.test(digits)) {
      return 'Amex';
    }
    
    return null;
  };

  // Generate years for expiry dropdown (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  // Show demo card numbers and UPI IDs
  const demoCards = [
    { type: 'Visa', number: '4111 1111 1111 1111' },
    { type: 'Mastercard', number: '5555 5555 5555 4444' },
    { type: 'Amex', number: '3782 822463 10005' }
  ];

  const demoUpiIds = [
    'example@upi', 'demo@okaxis', 'test@ybl'
  ];

  return (
    <div>
      {paymentMethod === 'card' ? (
        <form onSubmit={handleCardSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="input-field pr-10"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {getCardType(cardNumber) || <CreditCard size={18} />}
              </span>
            </div>
            {formErrors.cardNumber && (
              <p className="mt-1 text-xs text-error">{formErrors.cardNumber}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name on Card
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => {
                setCardName(e.target.value);
                validateField('cardName', e.target.value);
              }}
              className="input-field"
              placeholder="John Smith"
            />
            {formErrors.cardName && (
              <p className="mt-1 text-xs text-error">{formErrors.cardName}</p>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Expiry Date
              </label>
              <div className="flex gap-2">
                <select
                  value={expiryMonth}
                  onChange={(e) => {
                    setExpiryMonth(e.target.value);
                    validateField('expiryMonth', e.target.value);
                  }}
                  className="input-field flex-1"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={expiryYear}
                  onChange={(e) => {
                    setExpiryYear(e.target.value);
                    validateField('expiryYear', e.target.value);
                  }}
                  className="input-field flex-1"
                >
                  <option value="">Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {(formErrors.expiryMonth || formErrors.expiryYear) && (
                <p className="mt-1 text-xs text-error">
                  {formErrors.expiryMonth || formErrors.expiryYear}
                </p>
              )}
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                CVV
              </label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => {
                  setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                  validateField('cvv', e.target.value);
                }}
                className="input-field"
                placeholder="123"
                maxLength={4}
              />
              {formErrors.cvv && (
                <p className="mt-1 text-xs text-error">{formErrors.cvv}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center"
            >
              {error ? (
                <>Retry Payment • ₹{amount.toFixed(2)}</>
              ) : (
                <>Pay Now • ₹{amount.toFixed(2)}</>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              For demo, use any of these card numbers:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {demoCards.map((card, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-xs bg-background-dark px-2 py-1 rounded hover:bg-gray-700"
                  onClick={() => setCardNumber(card.number)}
                >
                  {card.type}: {card.number}
                </button>
              ))}
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleUpiSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              UPI ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  validateField('upiId', e.target.value);
                }}
                className="input-field pr-10"
                placeholder="yourname@upi"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Smartphone size={18} />
              </span>
            </div>
            {formErrors.upiId && (
              <p className="mt-1 text-xs text-error">{formErrors.upiId}</p>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center"
            >
              {error ? (
                <>Retry Payment • ₹{amount.toFixed(2)}</>
              ) : (
                <>Pay Now • ₹{amount.toFixed(2)}</>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              For demo, use any of these UPI IDs:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {demoUpiIds.map((id, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-xs bg-background-dark px-2 py-1 rounded hover:bg-gray-700"
                  onClick={() => setUpiId(id)}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;