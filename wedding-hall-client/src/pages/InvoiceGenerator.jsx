import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Printer, Save } from 'lucide-react';
import InvoicePrintView from '../components/invoices/InvoicePrintView';
import { useSearchParams, useNavigate } from 'react-router-dom';

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

  // Direct internal costing
  const [internalCosting, setInternalCosting] = useState({
    cateringExpense: 0,
    hallMaintenance: 0,
    workerSalary: 0,
  });

  const [savedInvoice, setSavedInvoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories to populate selectors
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/hall-categories');
        const catList = res.data.data || [];
        setCategories(catList);

        // Prepopulate standard defaults if empty
        if (catList.length > 0 && items.length === 0) {
          const defaultItems = catList.slice(0, 4).map((c) => ({
            categoryId: c._id,
            name: c.name,
            billingType: c.billingType,
            rate: c.defaultRate,
            quantity: 1,
            total: c.defaultRate * 1,
          }));
          setItems(defaultItems);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (editId) {
      api.get(`/hall-invoices/${editId}`).then((res) => {
        const inv = res.data.data;
        if (inv) {
          setCustomer(inv.customer);
          setEventDetails({
            programName: inv.eventDetails.programName,
            date: new Date(inv.eventDetails.date).toISOString().split('T')[0],
            timeSlot: inv.eventDetails.timeSlot,
          });
          setItems(inv.items);
          setAdvancePaid(inv.billing.advancePaid);
          setInternalCosting(inv.internalCosting);
        }
      });
    }
  }, [editId]);

  const handleAddItemFromCategory = (catId) => {
    const selected = categories.find((c) => c._id === catId);
    if (!selected) return;

    setItems([
      ...items,
      {
        categoryId: selected._id,
        name: selected.name,
        billingType: selected.billingType,
        rate: selected.defaultRate,
        quantity: 1,
        total: selected.defaultRate * 1,
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

  // Financial calculations
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
    if (!customer.name || !customer.phone) {
      alert('Please fill customer details');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one line item');
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
          advancePaid: Number(advancePaid),
          balanceDue,
        },
        internalCosting: {
          ...internalCosting,
          netProfit,
        },
      };

      const res = await api.post('/hall-invoices', payload);
      setSavedInvoice(res.data.data);
      alert('Invoice created successfully!');
    } catch (err) {
      alert(
        'Error creating invoice: ' +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsSubmitting(false);
    }
    if (editId) {
      await api.put(`/hall-invoices/${editId}`, payload);
      alert('Invoice updated successfully!');
    } else {
      const res = await api.post('/hall-invoices', payload);
      setSavedInvoice(res.data.data);
      alert('Invoice created successfully!');
    }
    navigate('/dashboard');
  };

  return (
    <div className='space-y-6'>
      {/* Action Header */}
      <div className='flex items-center justify-between no-print'>
        <div>
          <h2 className='text-2xl font-bold text-slate-800'>
            Generate Wedding Hall Invoice
          </h2>
          <p className='text-slate-500 text-sm'>
            Bill catering, servers, decor, and calculate net margin.
          </p>
        </div>
        {savedInvoice && (
          <button
            onClick={() => window.print()}
            className='inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition'
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        )}
      </div>

      {/* Main Billing Form */}
      <form onSubmit={handleSubmit} className='space-y-6 no-print'>
        {/* Customer & Event Details */}
        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-xs font-semibold text-slate-600 mb-1'>
              Customer Name
            </label>
            <input
              type='text'
              required
              placeholder='e.g. Vishal Patil'
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
              className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-600 mb-1'>
              Customer Phone (WhatsApp)
            </label>
            <input
              type='tel'
              required
              placeholder='e.g. 9876543210'
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
              className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-600 mb-1'>
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
              className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-600 mb-1'>
              Event Date
            </label>
            <input
              type='date'
              required
              value={eventDetails.date}
              onChange={(e) =>
                setEventDetails({ ...eventDetails, date: e.target.value })
              }
              className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-600 mb-1'>
              Timing Slot
            </label>
            <input
              type='text'
              placeholder='e.g. 7:00 AM to 4:30 PM'
              value={eventDetails.timeSlot}
              onChange={(e) =>
                setEventDetails({ ...eventDetails, timeSlot: e.target.value })
              }
              className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'
            />
          </div>
        </div>

        {/* Dynamic Billing Items */}
        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold text-slate-800'>
              Billed Services & Items
            </h3>
            {categories.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) handleAddItemFromCategory(e.target.value);
                  e.target.value = '';
                }}
                className='px-3 py-1.5 border border-amber-300 text-amber-900 bg-amber-50 rounded-lg text-xs font-semibold focus:outline-none'
              >
                <option value=''>+ Add Item from Master</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} (₹{c.defaultRate})
                  </option>
                ))}
              </select>
            )}
          </div>

          <table className='min-w-full divide-y divide-slate-200 text-sm'>
            <thead>
              <tr className='text-left text-xs font-semibold text-slate-500'>
                <th className='py-2'>Item Name</th>
                <th className='py-2 w-28'>Rate (₹)</th>
                <th className='py-2 w-28'>Qty / Count</th>
                <th className='py-2 w-32 text-right'>Total (₹)</th>
                <th className='py-2 w-10'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className='py-2 pr-2'>
                    <input
                      type='text'
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, 'name', e.target.value)
                      }
                      className='w-full px-2 py-1 border border-slate-300 rounded text-sm'
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
                      className='w-full px-2 py-1 border border-slate-300 rounded text-sm'
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
                      className='w-full px-2 py-1 border border-slate-300 rounded text-sm'
                    />
                  </td>
                  <td className='py-2 text-right font-medium text-slate-900'>
                    ₹ {Number(item.total || 0).toLocaleString('en-IN')}
                  </td>
                  <td className='py-2 text-center'>
                    <button
                      type='button'
                      onClick={() => handleRemoveItem(index)}
                      className='text-rose-500 hover:text-rose-700'
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Direct Costs */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Internal Direct Costing */}
          <div className='bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3'>
            <h3 className='font-semibold text-slate-800 text-sm'>
              Direct Event Expenses (Internal)
            </h3>
            <div className='grid grid-cols-3 gap-3'>
              <div>
                <label className='block text-xs text-slate-500 mb-1'>
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
                  className='w-full px-3 py-1.5 border rounded text-sm bg-white'
                />
              </div>
              <div>
                <label className='block text-xs text-slate-500 mb-1'>
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
                  className='w-full px-3 py-1.5 border rounded text-sm bg-white'
                />
              </div>
              <div>
                <label className='block text-xs text-slate-500 mb-1'>
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
                  className='w-full px-3 py-1.5 border rounded text-sm bg-white'
                />
              </div>
            </div>
            <div className='pt-2 flex justify-between items-center text-xs text-slate-600 font-medium'>
              <span>Estimated Net Margin:</span>
              <span
                className={`text-sm font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
              >
                ₹ {netProfit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Customer Total & Balance */}
          <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3'>
            <div className='flex justify-between items-center text-sm font-medium'>
              <span className='text-slate-600'>Subtotal (Total Bill):</span>
              <span className='text-lg font-bold text-slate-900'>
                ₹ {subTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-slate-600'>Advance Paid:</span>
              <input
                type='number'
                min='0'
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                className='w-32 px-2 py-1 border border-slate-300 rounded text-right text-sm font-semibold text-emerald-700'
              />
            </div>
            <div className='pt-2 border-t flex justify-between items-center'>
              <span className='font-semibold text-slate-800'>
                Balance Remaining:
              </span>
              <span className='text-xl font-bold text-rose-600'>
                ₹ {balanceDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2'
        >
          <Save size={18} />{' '}
          {isSubmitting ? 'Saving Invoice...' : 'Generate & Save Invoice'}
        </button>
      </form>

      {/* Printable Invoice Component */}
      {savedInvoice && (
        <div className='mt-8'>
          <InvoicePrintView invoice={savedInvoice} />
        </div>
      )}
    </div>
  );
}
