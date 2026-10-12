import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

const BILLING_TYPES = [
  { value: 'FIXED', label: 'Fixed / Lump Sum' },
  { value: 'PER_PERSON', label: 'Per Person' },
  { value: 'PER_PLATE', label: 'Per Plate' },
  { value: 'PER_GLASS', label: 'Per Glass' },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [billingType, setBillingType] = useState('FIXED');
  const [defaultRate, setDefaultRate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editRate, setEditRate] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hall-categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await api.post('/hall-categories', {
        name: name.trim(),
        billingType,
        defaultRate: Number(defaultRate) || 0,
      });
      setCategories([res.data.data, ...categories]);
      setName('');
      setDefaultRate('');
      setBillingType('FIXED');
    } catch (err) {
      alert(
        'Error creating category: ' +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleUpdateRate = async (id) => {
    try {
      const res = await api.put(`/hall-categories/${id}`, {
        defaultRate: Number(editRate) || 0,
      });
      setCategories(categories.map((c) => (c._id === id ? res.data.data : c)));
      setEditingId(null);
    } catch (err) {
      alert(
        'Error updating rate: ' + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this category?')) return;
    try {
      await api.delete(`/hall-categories/${id}`);
      setCategories(categories.filter((c) => c._id !== id));
    } catch (err) {
      alert(
        'Error deleting category: ' +
          (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-slate-800'>
          Category & Pricing Master
        </h2>
        <p className='text-slate-500 text-sm'>
          Set default charges for hall rentals, catering, welcome drinks,
          servers, and decor.
        </p>
      </div>

      {/* Add New Category Form */}
      <form
        onSubmit={handleAddCategory}
        className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end'
      >
        <div className='md:col-span-1'>
          <label className='block text-xs font-semibold text-slate-600 mb-1'>
            Category Name
          </label>
          <input
            type='text'
            required
            placeholder='e.g. Welcome Drinks'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'
          />
        </div>

        <div>
          <label className='block text-xs font-semibold text-slate-600 mb-1'>
            Billing Basis
          </label>
          <select
            value={billingType}
            onChange={(e) => setBillingType(e.target.value)}
            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white'
          >
            {BILLING_TYPES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-xs font-semibold text-slate-600 mb-1'>
            Default Rate (₹)
          </label>
          <input
            type='number'
            min='0'
            placeholder='0'
            value={defaultRate}
            onChange={(e) => setDefaultRate(e.target.value)}
            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'
          />
        </div>

        <div>
          <button
            type='submit'
            className='w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition'
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
      </form>

      {/* Categories Table */}
      <div className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
        <table className='min-w-full divide-y divide-slate-200 text-sm'>
          <thead className='bg-slate-50'>
            <tr>
              <th className='px-6 py-3 text-left font-semibold text-slate-700'>
                Category Name
              </th>
              <th className='px-6 py-3 text-left font-semibold text-slate-700'>
                Billing Type
              </th>
              <th className='px-6 py-3 text-left font-semibold text-slate-700'>
                Default Rate
              </th>
              <th className='px-6 py-3 text-right font-semibold text-slate-700'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {loading ? (
              <tr>
                <td colSpan='4' className='text-center py-6 text-slate-400'>
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan='4' className='text-center py-6 text-slate-400'>
                  No categories added yet. Add one above.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className='hover:bg-slate-50'>
                  <td className='px-6 py-4 font-medium text-slate-900'>
                    {cat.name}
                  </td>
                  <td className='px-6 py-4 text-slate-600'>
                    <span className='px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs'>
                      {cat.billingType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-slate-900'>
                    {editingId === cat._id ? (
                      <div className='flex items-center gap-2'>
                        <input
                          type='number'
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className='w-24 px-2 py-1 border border-amber-500 rounded text-sm focus:outline-none'
                        />
                        <button
                          onClick={() => handleUpdateRate(cat._id)}
                          className='text-emerald-600 hover:text-emerald-700'
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className='text-slate-400 hover:text-slate-600'
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <span>₹ {cat.defaultRate.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className='px-6 py-4 text-right space-x-3'>
                    {editingId !== cat._id && (
                      <button
                        onClick={() => {
                          setEditingId(cat._id);
                          setEditRate(cat.defaultRate);
                        }}
                        className='text-amber-600 hover:text-amber-800 text-xs font-medium'
                      >
                        <Edit2 size={16} className='inline mr-1' /> Edit Rate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className='text-rose-600 hover:text-rose-800 text-xs font-medium'
                    >
                      <Trash2 size={16} className='inline mr-1' /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
