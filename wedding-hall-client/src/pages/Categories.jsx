import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, Check, X, Tag, IndianRupee } from 'lucide-react';

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
      {/* Title */}
      <div>
        <h2 className='text-xl sm:text-2xl font-bold text-slate-800 tracking-tight'>
          Category & Pricing Master
        </h2>
        <p className='text-slate-500 text-xs sm:text-sm mt-0.5'>
          Set default charges for hall rentals, catering, welcome drinks,
          servers, and decor.
        </p>
      </div>

      {/* Add Category Card / Form */}
      <div className='bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm'>
        <h3 className='text-sm font-semibold text-slate-800 mb-3.5 flex items-center gap-2'>
          <Tag size={16} className='text-amber-600' />
          <span>Add New Category Item</span>
        </h3>

        <form
          onSubmit={handleAddCategory}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-end'
        >
          <div>
            <label className='block text-xs font-semibold text-slate-600 mb-1'>
              Category Name
            </label>
            <input
              type='text'
              required
              placeholder='e.g. Welcome Drinks'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-3.5 py-2.5 bg-slate-50 sm:bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-600 mb-1'>
              Billing Basis
            </label>
            <select
              value={billingType}
              onChange={(e) => setBillingType(e.target.value)}
              className='w-full px-3.5 py-2.5 bg-slate-50 sm:bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition'
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
            <div className='relative'>
              <span className='absolute left-3.5 top-2.5 text-slate-400 font-medium text-sm'>
                ₹
              </span>
              <input
                type='number'
                min='0'
                placeholder='0'
                value={defaultRate}
                onChange={(e) => setDefaultRate(e.target.value)}
                className='w-full pl-8 pr-3.5 py-2.5 bg-slate-50 sm:bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition'
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              className='w-full h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition shadow-sm'
            >
              <Plus size={18} />
              <span>Add Category</span>
            </button>
          </div>
        </form>
      </div>

      {/* Categories Presentation */}
      <div className='bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-slate-100 flex items-center justify-between'>
          <h3 className='font-semibold text-sm sm:text-base text-slate-800'>
            Active Master Categories ({categories.length})
          </h3>
          <span className='text-xs text-slate-400'>Auto-applies in bills</span>
        </div>

        {/* 1. Mobile Cards View (Hidden on medium/desktop screens) */}
        <div className='block md:hidden divide-y divide-slate-100'>
          {loading ? (
            <div className='p-6 text-center text-sm text-slate-400'>
              Loading master rates...
            </div>
          ) : categories.length === 0 ? (
            <div className='p-6 text-center text-sm text-slate-400'>
              No categories found. Add one above.
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat._id} className='p-4 space-y-2.5'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <h4 className='font-semibold text-slate-900 text-sm leading-tight'>
                      {cat.name}
                    </h4>
                    <span className='inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium uppercase tracking-wider'>
                      {cat.billingType.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center gap-1'>
                    {editingId !== cat._id && (
                      <button
                        onClick={() => {
                          setEditingId(cat._id);
                          setEditRate(cat.defaultRate);
                        }}
                        className='p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition'
                        aria-label='Edit'
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className='p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition'
                      aria-label='Delete'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Price Row / Inline Editor */}
                <div className='flex items-center justify-between pt-1'>
                  <span className='text-xs text-slate-500 font-medium'>
                    Standard Rate:
                  </span>
                  {editingId === cat._id ? (
                    <div className='flex items-center gap-1.5'>
                      <div className='relative'>
                        <span className='absolute left-2.5 top-1.5 text-xs text-slate-400'>
                          ₹
                        </span>
                        <input
                          type='number'
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className='w-28 pl-6 pr-2 py-1.5 border border-amber-500 rounded-lg text-sm font-semibold focus:outline-none'
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => handleUpdateRate(cat._id)}
                        className='p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition'
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className='p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition'
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className='text-sm font-bold text-slate-900'>
                      ₹ {cat.defaultRate.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. Desktop & Tablet Table View (Hidden on mobile phones) */}
        <div className='hidden md:block overflow-x-auto'>
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
                  <tr
                    key={cat._id}
                    className='hover:bg-slate-50/70 transition-colors'
                  >
                    <td className='px-6 py-4 font-semibold text-slate-900'>
                      {cat.name}
                    </td>
                    <td className='px-6 py-4 text-slate-600'>
                      <span className='px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium'>
                        {cat.billingType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-slate-900 font-medium'>
                      {editingId === cat._id ? (
                        <div className='flex items-center gap-2'>
                          <input
                            type='number'
                            value={editRate}
                            onChange={(e) => setEditRate(e.target.value)}
                            className='w-28 px-2.5 py-1.5 border border-amber-500 rounded-lg text-sm focus:outline-none'
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateRate(cat._id)}
                            className='p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded'
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className='p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded'
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <span>₹ {cat.defaultRate.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-right space-x-2'>
                      {editingId !== cat._id && (
                        <button
                          onClick={() => {
                            setEditingId(cat._id);
                            setEditRate(cat.defaultRate);
                          }}
                          className='px-2.5 py-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold transition'
                        >
                          <Edit2 size={14} className='inline mr-1' /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className='px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition'
                      >
                        <Trash2 size={14} className='inline mr-1' /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
