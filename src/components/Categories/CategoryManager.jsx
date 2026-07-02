import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { IoAddOutline, IoTrashOutline, IoPricetagOutline } from 'react-icons/io5';
import Button from '../common/Button';
import Card from '../common/Card';

export const CategoryManager = () => {
  const { categories, transactions, addCategory, deleteCategory, showToast } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState('expense'); // expense | income
  const [icon, setIcon] = useState('🍕');
  const [color, setColor] = useState('#7C3AED');

  const emojiPresets = ['🍕', '🚗', '🏠', '🎬', '🛍️', '🏥', '💼', '💻', '📈', '💰', '🎓', '🎁', '✈️', '🏋️', '🔌', '🏷️'];
  const colorPresets = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#8B5CF6'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter a category name', 'warning');
      return;
    }

    // Check if category name already exists (case insensitive)
    const exists = categories.some((c) => c.name.toLowerCase() === name.toLowerCase().trim());
    if (exists) {
      showToast(`Category "${name}" already exists!`, 'error');
      return;
    }

    addCategory({
      name: name.trim(),
      type,
      icon,
      color
    });

    showToast(`Category "${name}" created!`, 'success');
    setName('');
  };

  const handleDelete = (id, catName) => {
    // Count transactions linked to category
    const count = transactions.filter((t) => t.category.toLowerCase() === catName.toLowerCase()).length;
    
    let confirmMsg = `Are you sure you want to delete category "${catName}"?`;
    if (count > 0) {
      confirmMsg = `WARNING: Category "${catName}" is linked to ${count} transaction(s). Deleting it will leave these transactions uncategorized. Proceed?`;
    }

    if (window.confirm(confirmMsg)) {
      deleteCategory(id);
      showToast(`Deleted category "${catName}"`, 'info');
    }
  };

  return (
    <div className="category-manager-section grid-2-columns gap-lg">
      {/* Create Category Form */}
      <Card className="category-form-card flex-column gap-md">
        <h3 className="chart-card-title flex-center gap-sm">
          <IoPricetagOutline /> Add Category
        </h3>
        
        <form onSubmit={handleSubmit} className="flex-column gap-md">
          {/* Category Type */}
          <div className="form-group">
            <label className="form-label">Category Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-select"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Travel, Bonus"
              className="form-input"
              required
            />
          </div>

          {/* Emoji Preset Selection */}
          <div className="form-group">
            <label className="form-label">Pick Icon: {icon}</label>
            <div className="emojis-picker-grid">
              {emojiPresets.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`emoji-selector-btn ${icon === em ? 'selected-emoji' : ''}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Color Presets */}
          <div className="form-group">
            <label className="form-label font-bold">Pick Color Theme</label>
            <div className="presets-wrapper flex-center gap-sm">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-preset-dot ${color === c ? 'active-preset' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="custom-color-input"
                title="Custom Color"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" icon={IoAddOutline} className="w-100">
            Create Category
          </Button>
        </form>
      </Card>

      {/* Categories Grid List */}
      <div className="categories-list-wrapper flex-column gap-md">
        <h3 className="section-subtitle">Active Categories ({categories.length})</h3>
        
        <div className="categories-scroll-grid">
          {categories.map((cat) => {
            const count = transactions.filter((t) => t.category.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <Card key={cat.id} className="category-item-card flex-between">
                <div className="cat-card-left flex-center gap-md">
                  <div
                    className="cat-icon-wrapper flex-center"
                    style={{ backgroundColor: `${cat.color}1A`, border: `1px solid ${cat.color}30` }}
                  >
                    <span className="cat-icon-symbol">{cat.icon}</span>
                  </div>
                  <div className="cat-title-details flex-column">
                    <span className="cat-title-name font-bold">{cat.name}</span>
                    <span className="cat-title-usage text-xs text-muted">
                      {count} transaction(s) | Type: <span className="capitalize">{cat.type}</span>
                    </span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="action-icon-btn action-delete-btn"
                  icon={IoTrashOutline}
                  title="Delete Category"
                />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
