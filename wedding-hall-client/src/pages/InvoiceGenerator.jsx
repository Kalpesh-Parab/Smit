import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Printer, Save, ArrowLeft, Layers, User, Calendar, CreditCard, Banknote } from 'lucide-react';
import InvoicePrintView from '../components/invoices/InvoicePrintView';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function InvoiceGenerator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');

  const [categories, setCategories] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [eventDetails, setEventDetails] = useState({
    programName: 'Wedding Ceremony',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '7:00 AM - 4:30 PM',
  });

  const [items, setItems] = useState([]);
  const [advancePaid, setAdvancePaid] = useState(0);

  const [internalCosting, setInternalCosting] = useState({
    cateringExpense: 0,
    hallMaintenance: 0,
    workerSalary: 0,
  });

  const [savedInvoice, setSavedInvoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/hall-categories');
        const catList = res.data?.data || [];
        setCategories(catList);

        if (!editId && catList.length > 0 && items.length === 0) {
          const defaultItems = catList.slice(0, 4).map((c) => ({
            categoryId: c._id,
            name: c.name,
            billingType: c.billingType,
            rate: c.defaultRate || 0,
            quantity: 1,
            total: (c.defaultRate || 0) * 1,
          }));
          setItems(defaultItems);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load item categories');
      }
    };
    loadCategories();
  }, [editId]);

  useEffect(() => {
    if (!editId) return;

    const loadInvoice = async () => {
      try {
        const res = await api.get(`/hall-invoices/${editId}`);
        const inv = res.data?.data;
        if (inv) {
          setCustomer(inv.customer || { name: '', phone: '' });
          setEventDetails({
            programName: inv.eventDetails?.programName || '',
            date: inv.eventDetails?.date
              ? new Date(inv.eventDetails.date).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            timeSlot: inv.eventDetails?.timeSlot || '',
          });
          setItems(inv.items || []);
          setAdvancePaid(inv.billing?.advancePaid || 0);
          setInternalCosting(
            inv.internalCosting || {
              cateringExpense: 0,
              hallMaintenance: 0,
              workerSalary: 0,
            },
          );
          setSavedInvoice(inv);
        }
      } catch (err) {
        console.error('Error loading invoice:', err);
        toast.error('Failed to load invoice for editing');
      }
    };

    loadInvoice();
  }, [editId]);

  const handleAddItemFromCategory = (catId) => {
    const selected = categories.find((c) => c._id === catId);
    if (!selected) return;

    setItems((prev) => [
      ...prev,
      {
        categoryId: selected._id,
        name: selected.name,
        billingType: selected.billingType,
        rate: selected.defaultRate || 0,
        quantity: 1,
        total: (selected.defaultRate || 0) * 1,
      },
    ]);
  };

  const handleAddNewCustomItem = () => {
    setItems((prev) => [
      ...prev,
      {
        categoryId: null,
        name: '',
        billingType: 'FIXED',
        rate: 0,
        quantity: 1,
        total: 0,
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    const rate = Number(updated[index].rate) || 0;
    const qty = Number(updated[index].quantity) || 0;
    updated[index].total = rate * qty;
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subTotal = items.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0,
  );
  const balanceDue = Math.max(0, subTotal - (Number(advancePaid) || 0));
  const totalInternalExpense =
    Number(internalCosting.cateringExpense || 0) +
    Number(internalCosting.hallMaintenance || 0) +
    Number(internalCosting.workerSalary || 0);
  const netProfit = subTotal - totalInternalExpense;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customer.name.trim() || !customer.phone.trim()) {
      toast.error('Please enter customer name and phone');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customer,
        eventDetails,
        items,
        billing: {
          subTotal,
          advancePaid: Number(advancePaid) || 0,
          balanceDue,
        },
        internalCosting: {
          cateringExpense: Number(internalCosting.cateringExpense) || 0,
          hallMaintenance: Number(internalCosting.hallMaintenance) || 0,
          workerSalary: Number(internalCosting.workerSalary) || 0,
          netProfit,
        },
      };

      if (editId) {
        const res = await api.put(`/hall-invoices/${editId}`, payload);
        setSavedInvoice(res.data?.data);
        toast.success('Invoice updated successfully!');
      } else {
        const res = await api.post('/hall-invoices', payload);
        setSavedInvoice(res.data?.data);
        toast.success('Invoice created successfully!');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || 'Failed to save invoice',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-5 px-3 sm:px-6 py-4 max-w-7xl mx-auto'>
      {/* Top Bar */}
      <div className='flex items-center justify-between no-print gap-2'>
        <div className='flex items-center gap-2 sm:gap-3'>
          <Link
            to='/dashboard'
            className='p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition active:scale-95'
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className='text-lg sm:text-2xl font-bold text-slate-900'>
              {editId ? 'Edit Invoice' : 'New Invoice'}
            </h2>
            <p className='text-slate-500 text-xs hidden sm:block'>
              Manage catering, servers, halls, and profit metrics
            </p>
          </div>
        </div>

        {savedInvoice && (
          <button
            onClick={() => window.print()}
            className='inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-xs sm:text-sm font-medium'
          >
            <Printer size={16} /> Print
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className='space-y-5 no-print'>
        {/* Customer & Event Details */}
        <div className='bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4'>
          <h3 className='font-semibold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5'>
            <User size={16} className='text-amber-600' /> Client & Event Information
          </h3>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4'>
            <div>
              <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                Customer Name <span className='text-rose-500'>*</span>
              </label>
              <input
                type='text'
                required
                placeholder='e.g. Vishal Patil'
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition'
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                Phone / WhatsApp <span className='text-rose-500'>*</span>
              </label>
              <input
                type='tel'
                required
                placeholder='e.g. 9876543210'
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition'
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                Program / Event Name
              </label>
              <input
                type='text'
                required
                placeholder='e.g. Wedding & Reception'
                value={eventDetails.programName}
                onChange={(e) =>
                  setEventDetails({
                    ...eventDetails,
                    programName: e.target.value,
                  })
                }
                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition'
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                Event Date
              </label>
              <input
                type='date'
                required
                value={eventDetails.date}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, date: e.target.value })
                }
                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition'
              />
            </div>

            <div className='sm:col-span-2 lg:col-span-1'>
              <label className='block text-xs font-semibold text-slate-700 mb-1.5'>
                Timing Slot
              </label>
              <input
                type='text'
                placeholder='e.g. 7:00 AM to 4:30 PM'
                value={eventDetails.timeSlot}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, timeSlot: e.target.value })
                }
                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition'
              />
            </div>
          </div>
        </div>

        {/* Billed Items Section */}
        <div className='bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3'>
            <h3 className='font-semibold text-slate-800 text-sm flex items-center gap-2'>
              <Layers size={16} className='text-amber-600' /> Billed Services & Items ({items.length})
            </h3>
            <div className='flex flex-wrap items-center gap-2'>
              {categories.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAddItemFromCategory(e.target.value);
                    e.target.value = '';
                  }}
                  className='flex-1 sm:flex-none px-3 py-2 border border-amber-300 text-amber-900 bg-amber-50 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer'
                >
                  <option value=''>+ Add Preset Item</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} (₹{c.defaultRate})
                    </option>
                  ))}
                </select>
              )}
              <button
                type='button'
                onClick={handleAddNewCustomItem}
                className='flex-1 sm:flex-none px-3 py-2 border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-95 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition'
              >
                <Plus size={14} /> Custom Item
              </button>
            </div>
          </div>

          {/* Mobile Items Stack (< 640px) */}
          <div className='space-y-3 sm:hidden'>
            {items.map((item, index) => (
              <div
                key={index}
                className='bg-slate-50/70 p-3 rounded-lg border border-slate-200/90 space-y-2.5 relative'
              >
                <div className='flex items-start justify-between gap-2 pr-7'>
                  <div className='w-full'>
                    <label className='block text-[11px] font-semibold text-slate-500 mb-1'>
                      Item Name
                    </label>
                    <input
                      type='text'
                      value={item.name}
                      placeholder='Service / Item Name'
                      onChange={(e) =>
                        handleItemChange(index, 'name', e.target.value)
                      }
                      className='w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-amber-500'
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => handleRemoveItem(index)}
                    className='absolute top-3 right-3 p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className='grid grid-cols-3 gap-2 items-end pt-1'>
                  <div>
                    <label className='block text-[11px] font-semibold text-slate-500 mb-1'>
                      Rate (₹)
                    </label>
                    <input
                      type='number'
                      min='0'
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, 'rate', e.target.value)
                      }
                      className='w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm bg-white'
                    />
                  </div>
                  <div>
                    <label className='block text-[11px] font-semibold text-slate-500 mb-1'>
                      Qty
                    </label>
                    <input
                      type='number'
                      min='1'
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      className='w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm bg-white text-center'
                    />
                  </div>
                  <div className='text-right'>
                    <span className='block text-[11px] font-semibold text-slate-500 mb-1'>
                      Total
                    </span>
                    <span className='block py-1.5 text-xs font-bold text-slate-900'>
                      ₹ {Number(item.total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Table (>= 640px) */}
          <div className='hidden sm:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-slate-200 text-sm'>
              <thead>
                <tr className='text-left text-xs font-semibold text-slate-500'>
                  <th className='py-2.5'>Item / Service</th>
                  <th className='py-2.5 w-32'>Rate (₹)</th>
                  <th className='py-2.5 w-24 text-center'>Qty</th>
                  <th className='py-2.5 w-32 text-right'>Total (₹)</th>
                  <th className='py-2.5 w-12 text-center'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className='py-2 pr-2'>
                      <input
                        type='text'
                        value={item.name}
                        placeholder='Service Name'
                        onChange={(e) =>
                          handleItemChange(index, 'name', e.target.value)
                        }
                        className='w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm'
                      />
                    </td>
                    <td className='py-2 pr-2'>
                      <input
                        type='number'
                        min='0'
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(index, 'rate', e.target.value)
                        }
                        className='w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm'
                      />
                    </td>
                    <td className='py-2 pr-2'>
                      <input
                        type='number'
                        min='1'
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', e.target.value)
                        }
                        className='w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm text-center'
                      />
                    </td>
                    <td className='py-2 text-right font-medium text-slate-900'>
                      ₹ {Number(item.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className='py-2 text-center'>
                      <button
                        type='button'
                        onClick={() => handleRemoveItem(index)}
                        className='p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Costing & Billing Summary */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {/* Internal Costing */}
          <div className='bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-3'>
            <h3 className='font-semibold text-slate-800 text-sm flex items-center justify-between'>
              <span>Direct Event Costs (Internal)</span>
              <span className='text-xs font-normal text-slate-500'>Confidential</span>
            </h3>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div>
                <label className='block text-[11px] sm:text-xs text-slate-600 mb-1'>
                  Catering Cost
                </label>
                <input
                  type='number'
                  min='0'
                  value={internalCosting.cateringExpense}
                  onChange={(e) =>
                    setInternalCosting({
                      ...internalCosting,
                      cateringExpense: e.target.value,
                    })
                  }
                  className='w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white'
                />
              </div>
              <div>
                <label className='block text-[11px] sm:text-xs text-slate-600 mb-1'>
                  Hall Maintenance
                </label>
                <input
                  type='number'
                  min='0'
                  value={internalCosting.hallMaintenance}
                  onChange={(e) =>
                    setInternalCosting({
                      ...internalCosting,
                      hallMaintenance: e.target.value,
                    })
                  }
                  className='w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white'
                />
              </div>
              <div>
                <label className='block text-[11px] sm:text-xs text-slate-600 mb-1'>
                  Worker Salary
                </label>
                <input
                  type='number'
                  min='0'
                  value={internalCosting.workerSalary}
                  onChange={(e) =>
                    setInternalCosting({
                      ...internalCosting,
                      workerSalary: e.target.value,
                    })
                  }
                  className='w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white'
                />
              </div>
            </div>

            <div className='pt-2.5 border-t border-slate-200/80 flex justify-between items-center text-xs'>
              <span className='font-medium text-slate-600'>Estimated Net Profit:</span>
              <span
                className={`text-base font-bold ${
                  netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                ₹ {netProfit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Customer Bill Overview */}
          <div className='bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3.5 flex flex-col justify-between'>
            <div className='space-y-3'>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-slate-600 font-medium'>Subtotal (Total Billed):</span>
                <span className='text-lg font-bold text-slate-900'>
                  ₹ {subTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className='flex justify-between items-center text-sm gap-2'>
                <span className='text-slate-600 font-medium'>Advance Paid (₹):</span>
                <input
                  type='number'
                  min='0'
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  className='w-36 px-3 py-1.5 border border-slate-300 rounded-lg text-right text-sm font-bold text-emerald-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500'
                />
              </div>
            </div>

            <div className='pt-3 border-t border-slate-100 flex justify-between items-center'>
              <span className='font-semibold text-slate-800 text-sm'>
                Balance Due:
              </span>
              <span className='text-xl font-black text-rose-600'>
                ₹ {balanceDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base'
        >
          <Save size={18} />
          {isSubmitting
            ? 'Saving...'
            : editId
              ? 'Update Invoice'
              : 'Save & Generate Invoice'}
        </button>
      </form>

      {savedInvoice && (
        <div className='mt-8 pt-6 border-t border-slate-200'>
          <InvoicePrintView invoice={savedInvoice} />
        </div>
      )}
    </div>
  );
}