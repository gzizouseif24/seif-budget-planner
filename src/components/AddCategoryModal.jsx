import React, { useState, useEffect } from 'react';
import { getCategories, addCategory } from '../services/localStorageService';
import { X } from 'lucide-react';
import './AddCategoryModal.css';

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [color, setColor] = useState('#000000');
  const [emoji, setEmoji] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setType('expense');
    setColor('#000000');
    setEmoji('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name cannot be empty.');
      return;
    }

    const categories = getCategories();
    const trimmedNameLower = name.trim().toLowerCase();
    if (categories.some(cat => cat.name.toLowerCase() === trimmedNameLower)) {
      setError('A category with this name already exists.');
      return;
    }

    const categoryData = {
      id: null,
      name: name.trim(),
      type,
      color,
      emoji: emoji.trim(),
    };

    addCategory(categoryData);
    
    if (onCategoryAdded) {
      onCategoryAdded();
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-category-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close-btn" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 100, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>
          <X size={20} />
        </button>
        <div className="modal-header">
          <h3>Add New Category</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <p className="form-error">{error}</p>}
          
          <div className="form-group">
            <label htmlFor="catName">Name:</label>
            <input 
              type="text" 
              id="catName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="catType">Type:</label>
            <select 
              id="catType" 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="catColor">Color:</label>
            <input 
              type="color" 
              id="catColor" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="catEmoji">Emoji (Optional):</label>
            <input
              type="text"
              id="catEmoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="e.g., 🛒"
              maxLength="2"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
