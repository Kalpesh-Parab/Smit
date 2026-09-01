import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  PlusCircle,
  Search,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  TrendingDown,
  X,
  CreditCard,
} from 'lucide-react';
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from '../../services/api';
import './Expenses.scss';

const EXPENSE_CATEGORIES = [
  'Fuel / Diesel',
  'Maintenance & Repairs',
  'Driver / Operator Salary',
  'Insurance & Taxes',
  'Toll & Travel',
  'Other',
];

const PAYMENT_MODES = ['UPI / Online', 'Cash', 'Bank Transfer', 'Cheque'];

export default function Expenses({
  serviceName = 'ambulance',
  title = 'Expenses',
}) {
  const [expenses, setExpenses] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Fuel / Diesel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    assetReference: '',
    paymentMode: 'UPI / Online',
    notes: '',
  });

  // Fetch expenses and relevant service fleet assets
  const fetchExpensesAndAssets = async () => {
    try {
      setLoading(true);
      const [expenseRes, assetRes] = await Promise.all([
        getItems(`expenses?service=${serviceName}`),
        getItems(
          serviceName === 'generators'
            ? 'generators'
            : serviceName === 'towing-vans'
              ? 'towing-vans'
              : 'ambulances',
        ),
      ]);

      if (expenseRes.success) {
        setExpenses(expenseRes.data);
        setTotalSpend(expenseRes.totalSpend || 0);
      }
      if (assetRes.success) {
        setAssets(assetRes.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndAssets();
    handleCancelEdit();
  }, [serviceName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount === '') {
      toast.error('Please enter expense title and amount');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        const res = await updateItem('expenses', editingId, formData);
        if (res.success) {
          toast.success('Expense record updated');
          handleCancelEdit();
          fetchExpensesAndAssets();
        }
      } else {
        const res = await createItem('expenses', {
          ...formData,
          service: serviceName,
        });
        if (res.success) {
          toast.success('Expense added successfully');
          setFormData({
            title: '',
            category: 'Fuel / Diesel',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            assetReference: '',
            paymentMode: 'UPI / Online',
            notes: '',
          });
          fetchExpensesAndAssets();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (exp) => {
    setEditingId(exp._id);
    setFormData({
      title: exp.title || '',
      category: exp.category || 'Fuel / Diesel',
      amount: exp.amount ?? '',
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
      assetReference: exp.assetReference || '',
      paymentMode: exp.paymentMode || 'UPI / Online',
      notes: exp.notes || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Fuel / Diesel',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      assetReference: '',
      paymentMode: 'UPI / Online',
      notes: '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?'))
      return;
    try {
      const res = await deleteItem('expenses', id);
      if (res.success) {
        toast.success('Expense deleted');
        fetchExpensesAndAssets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.title?.toLowerCase().includes(search.toLowerCase()) ||
      exp.category?.toLowerCase().includes(search.toLowerCase()) ||
      exp.assetReference?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='expenses-page-container'>
      <div className='section-header'>
        <div className='header-meta'>
          <h2 className='section-title'>{title}</h2>
          <p className='section-subtitle'>
            Log operational, diesel, maintenance, and driver expenditures for{' '}
            {serviceName.replace('-', ' ')}.
          </p>
        </div>

        <div className='total-spend-pill'>
          <TrendingDown size={18} className='spend-icon' />
          <div className='spend-text'>
            <span>Total Expenditure</span>
            <strong>₹{totalSpend.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      {/* Expense Form */}
      <div className='expense-form-card'>
        <div className='card-header'>
          <div className='header-title'>
            {editingId ? <Edit3 size={18} /> : <PlusCircle size={18} />}
            <h3>{editingId ? 'Edit Expense Record' : 'Record New Expense'}</h3>
          </div>
          {editingId && (
            <button
              type='button'
              className='cancel-edit-btn'
              onClick={handleCancelEdit}
            >
              <X size={16} /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className='expense-form'>
          <div className='form-grid'>
            <div className='form-group'>
              <label>Expense Title / Description *</label>
              <input
                type='text'
                name='title'
                placeholder='e.g. Diesel Refill / Tyre Replacement'
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className='form-group'>
              <label>Expense Category *</label>
              <select
                name='category'
                value={formData.category}
                onChange={handleInputChange}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className='form-group'>
              <label>Amount (₹) *</label>
              <input
                type='number'
                name='amount'
                placeholder='₹ 0'
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className='form-grid secondary-grid'>
            <div className='form-group'>
              <label>Vehicle / Generator Reference</label>
              <input
                list='asset-options'
                name='assetReference'
                placeholder='Select or type asset'
                value={formData.assetReference}
                onChange={handleInputChange}
              />
              <datalist id='asset-options'>
                {assets.map((a) => (
                  <option key={a._id} value={a.vehicleNo || a.identifier}>
                    {a.vehicleModel ||
                      `${a.capacityKva} kVA ${a.mountedOn ? `(${a.mountedOn})` : ''}`}
                  </option>
                ))}
              </datalist>
            </div>

            <div className='form-group'>
              <label>Date *</label>
              <input
                type='date'
                name='date'
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className='form-group'>
              <label>Payment Mode</label>
              <select
                name='paymentMode'
                value={formData.paymentMode}
                onChange={handleInputChange}
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='form-group'>
            <label>Additional Notes / Bill Info</label>
            <input
              type='text'
              name='notes'
              placeholder='e.g. Paid at Indian Oil Petrol Pump'
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className='form-actions'>
            <button
              type='submit'
              className='submit-expense-btn'
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className='spinner' />
                  <span>Saving...</span>
                </>
              ) : editingId ? (
                'Update Expense'
              ) : (
                'Save Expense'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Expense History Table */}
      <div className='expense-history-card'>
        <div className='history-header'>
          <div className='title-area'>
            <h3>Expense Logs</h3>
            <span className='count-badge'>{expenses.length} Records</span>
          </div>

          <div className='search-box'>
            <Search size={16} className='search-icon' />
            <input
              type='text'
              placeholder='Search title, category, or vehicle...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className='loading-state'>
            <Loader2 size={28} className='spinner' />
            <p>Loading expense records...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className='empty-state'>
            <AlertCircle size={36} />
            <p>No expense logs found.</p>
          </div>
        ) : (
          <div className='table-responsive'>
            <table className='expenses-table'>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title & Asset</th>
                  <th>Category</th>
                  <th>Payment Mode</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th className='text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>{new Date(exp.date).toLocaleDateString('en-GB')}</td>
                    <td>
                      <div className='title-cell'>
                        <strong>{exp.title}</strong>
                        {exp.assetReference && (
                          <span className='asset-tag'>
                            {exp.assetReference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className='category-pill'>{exp.category}</span>
                    </td>
                    <td>
                      <div className='pay-mode'>
                        <CreditCard size={13} />
                        <span>{exp.paymentMode}</span>
                      </div>
                    </td>
                    <td className='amount-col'>
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className='notes-col'>{exp.notes || '—'}</td>
                    <td>
                      <div className='action-buttons'>
                        <button
                          className='action-btn edit'
                          title='Edit'
                          onClick={() => handleEdit(exp)}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className='action-btn delete'
                          title='Delete'
                          onClick={() => handleDelete(exp._id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
