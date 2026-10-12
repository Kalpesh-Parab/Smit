import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  TrendingUp,
  DollarSign,
  Clock,
  Wallet,
  Plus,
  Printer,
  MessageSquare,
  Trash2,
  Edit,
} from 'lucide-react';
import InvoicePrintView from '../components/invoices/InvoicePrintView';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hall-invoices');
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?'))
      return;
    try {
      await api.delete(`/hall-invoices/${id}`);
      setInvoices(invoices.filter((inv) => inv._id !== id));
    } catch (err) {
      alert(
        'Failed to delete invoice: ' +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleSendWhatsApp = (inv) => {
    const text = encodeURIComponent(
      `*Smit Wedding Hall - Invoice Summary*\n` +
        `Invoice: ${inv.invoiceNumber}\n` +
        `Customer: ${inv.customer.name}\n` +
        `Event: ${inv.eventDetails.programName} (${new Date(inv.eventDetails.date).toLocaleDateString('en-IN')})\n` +
        `Total Bill: ₹${inv.billing.subTotal.toLocaleString('en-IN')}\n` +
        `Advance Paid: ₹${inv.billing.advancePaid.toLocaleString('en-IN')}\n` +
        `Balance Due: ₹${inv.billing.balanceDue.toLocaleString('en-IN')}\n\n` +
        `Thank you for booking with us!`,
    );
    window.open(`https://wa.me/91${inv.customer.phone}?text=${text}`, '_blank');
  };

  // Metrics calculations
  const totalRevenue = invoices.reduce(
    (s, i) => s + (i.billing?.subTotal || 0),
    0,
  );
  const totalAdvance = invoices.reduce(
    (s, i) => s + (i.billing?.advancePaid || 0),
    0,
  );
  const totalBalanceDue = invoices.reduce(
    (s, i) => s + (i.billing?.balanceDue || 0),
    0,
  );
  const totalNetProfit = invoices.reduce(
    (s, i) => s + (i.internalCosting?.netProfit || 0),
    0,
  );

  return (
    <div className='space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print'>
        <div>
          <h2 className='text-2xl font-bold text-slate-800'>
            Wedding Hall Dashboard
          </h2>
          <p className='text-sm text-slate-500'>
            Monitor all bookings, payments, and margins
          </p>
        </div>
        <Link
          to='/invoices/new'
          className='inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition shadow-sm'
        >
          <Plus size={16} /> Create Invoice
        </Link>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print'>
        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-slate-500 uppercase'>
              Total Billed
            </p>
            <p className='text-2xl font-bold text-slate-900 mt-1'>
              ₹ {totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className='w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center'>
            <DollarSign size={20} />
          </div>
        </div>

        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-slate-500 uppercase'>
              Advance Collected
            </p>
            <p className='text-2xl font-bold text-emerald-600 mt-1'>
              ₹ {totalAdvance.toLocaleString('en-IN')}
            </p>
          </div>
          <div className='w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center'>
            <Wallet size={20} />
          </div>
        </div>

        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-slate-500 uppercase'>
              Balance Due
            </p>
            <p className='text-2xl font-bold text-rose-600 mt-1'>
              ₹ {totalBalanceDue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className='w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center'>
            <Clock size={20} />
          </div>
        </div>

        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-slate-500 uppercase'>
              Net Margin (Profit)
            </p>
            <p className='text-2xl font-bold text-blue-600 mt-1'>
              ₹ {totalNetProfit.toLocaleString('en-IN')}
            </p>
          </div>
          <div className='w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center'>
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden no-print'>
        <div className='p-4 border-b border-slate-200 font-semibold text-slate-800'>
          Generated Invoices ({invoices.length})
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-slate-200 text-sm'>
            <thead className='bg-slate-50 text-slate-600 text-xs font-semibold'>
              <tr>
                <th className='px-6 py-3 text-left'>Invoice No</th>
                <th className='px-6 py-3 text-left'>Customer</th>
                <th className='px-6 py-3 text-left'>Program</th>
                <th className='px-6 py-3 text-left'>Date</th>
                <th className='px-6 py-3 text-right'>Total Bill</th>
                <th className='px-6 py-3 text-right'>Balance Due</th>
                <th className='px-6 py-3 text-center'>Status</th>
                <th className='px-6 py-3 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {loading ? (
                <tr>
                  <td colSpan='8' className='text-center py-8 text-slate-400'>
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan='8' className='text-center py-8 text-slate-400'>
                    No invoices generated yet. Click "Create Invoice" above.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className='hover:bg-slate-50 transition'>
                    <td className='px-6 py-4 font-mono font-bold text-slate-800'>
                      {inv.invoiceNumber}
                    </td>
                    <td className='px-6 py-4'>
                      <p className='font-semibold text-slate-900'>
                        {inv.customer.name}
                      </p>
                      <p className='text-xs text-slate-500'>
                        {inv.customer.phone}
                      </p>
                    </td>
                    <td className='px-6 py-4 text-slate-700'>
                      {inv.eventDetails.programName}
                    </td>
                    <td className='px-6 py-4 text-slate-600 text-xs'>
                      {new Date(inv.eventDetails.date).toLocaleDateString(
                        'en-IN',
                      )}
                    </td>
                    <td className='px-6 py-4 text-right font-medium text-slate-900'>
                      ₹ {inv.billing.subTotal.toLocaleString('en-IN')}
                    </td>
                    <td className='px-6 py-4 text-right font-semibold text-rose-600'>
                      ₹ {inv.billing.balanceDue.toLocaleString('en-IN')}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          inv.billing.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.billing.paymentStatus === 'PARTIALLY_PAID'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.billing.paymentStatus}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right space-x-2'>
                      <button
                        title='Print / View'
                        onClick={() => setSelectedInvoice(inv)}
                        className='p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition'
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        title='Send on WhatsApp'
                        onClick={() => handleSendWhatsApp(inv)}
                        className='p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition'
                      >
                        <MessageSquare size={16} />
                      </button>
                      <Link
                        title='Edit Invoice'
                        to={`/invoices/new?edit=${inv._id}`}
                        className=' inline-block text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition'
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        title='Delete'
                        onClick={() => handleDelete(inv._id)}
                        className='p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Overlay View */}
      {selectedInvoice && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto'>
          <div className='bg-white rounded-2xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-end gap-3 mb-4 no-print'>
              <button
                onClick={() => window.print()}
                className='inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700'
              >
                <Printer size={16} /> Print
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className='px-4 py-2 border rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                Close
              </button>
            </div>
            <InvoicePrintView invoice={selectedInvoice} />
          </div>
        </div>
      )}
    </div>
  );
}
