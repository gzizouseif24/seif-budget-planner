import React, { useState, useEffect } from 'react';
import { getCategories, deleteCategory as deleteCategoryService } from '../services/localStorageService';
import { X } from 'lucide-react';
import './CategoryListModal.css';

const CategoryListModal = ({ isOpen, onClose, onCategoryUpdated, onEditCategory }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = () => {
    setCategories(getCategories());
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Delete this category? This might affect existing transactions.')) {
      const success = deleteCategoryService(categoryId);
      if (success) {
        loadCategories();
        if (onCategoryUpdated) {
          onCategoryUpdated();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Categories</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {categories.length === 0 ? (
            <p className="no-categories-message">No categories yet.</p>
          ) : (
            <ul className="categories-list">
              {categories.map(category => (
                <li key={category.id} className="category-list-item">
                  <div className="category-info">
                    {category.emoji && <span className="category-emoji">{category.emoji}</span>}
                    <span className="category-name">{category.name}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(category.id)} 
                    className="btn-delete-icon"
                    aria-label="Delete category"
                  >
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryListModal;
