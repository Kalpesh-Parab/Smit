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
  Calendar,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import InvoicePrintView from '../components/invoices/InvoicePrintView';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hall-invoices');
      setInvoices(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className='flex flex-col gap-2.5 p-1'>
          <span className='text-sm font-semibold text-slate-800'>
            Delete this invoice permanently?
          </span>
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => toast.dismiss(t.id)}
              className='px-3 py-1.5 text-xs border border-slate-300 rounded-md font-medium text-slate-600 hover:bg-slate-50 transition'
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/hall-invoices/${id}`);
                  setInvoices((prev) => prev.filter((inv) => inv._id !== id));
                  toast.success('Invoice deleted successfully');
                } catch (err) {
                  toast.error(
                    'Failed to delete invoice: ' +
                      (err.response?.data?.message || err.message),
                  );
                }
              }}
              className='px-3 py-1.5 text-xs bg-rose-600 text-white rounded-md font-medium hover:bg-rose-700 transition'
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 6000 },
    );
  };

  const handleSendWhatsApp = (inv) => {
    const pdfSection = inv.pdfUrl
      ? `\n📄 *Download PDF Invoice:* ${inv.pdfUrl}\n`
      : '';

    const text = encodeURIComponent(
      `*Smit Wedding Hall - Invoice Summary*\n` +
        `Invoice: ${inv.invoiceNumber}\n` +
        `Customer: ${inv.customer.name}\n` +
        `Event: ${inv.eventDetails.programName} (${new Date(
          inv.eventDetails.date,
        ).toLocaleDateString('en-IN')})\n` +
        `Total Bill: ₹${(inv.billing?.subTotal || 0).toLocaleString('en-IN')}\n` +
        `Advance Paid: ₹${(inv.billing?.advancePaid || 0).toLocaleString('en-IN')}\n` +
        `Balance Due: ₹${(inv.billing?.balanceDue || 0).toLocaleString('en-IN')}\n` +
        pdfSection +
        `\nThank you for booking with us!`,
    );

    const cleanPhone = (inv.customer.phone || '')
      .replace(/\D/g, '')
      .replace(/^0/, '');
    const phoneWithCountry = cleanPhone.startsWith('91')
      ? cleanPhone
      : `91${cleanPhone}`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

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

  const getStatusBadge = (status) => {
    const base = 'px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block';
    if (status === 'PAID') return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`;
    if (status === 'PARTIALLY_PAID') return `${base} bg-amber-50 text-amber-700 border border-amber-200`;
    return `${base} bg-rose-50 text-rose-700 border border-rose-200`;
  };

  return (
    <div className='space-y-5 px-3 sm:px-6 py-4 max-w-7xl mx-auto'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print'>
        <div>
          <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-slate-900'>
            Wedding Hall Dashboard
          </h2>
          <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
            Bookings, payments, and net profit margins
          </p>
        </div>
        <Link
          to='/invoices/new'
          className='inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition shadow-sm w-full sm:w-auto'
        >
          <Plus size={18} /> Create New Invoice
        </Link>
      </div>

      {/* Stats Cards: 2 cols on mobile, 4 on desktop */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 no-print'>
        <div className='bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider'>
              Total Billed
            </span>
            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center'>
              <DollarSign size={18} />
            </div>
          </div>
          <p className='text-lg sm:text-2xl font-bold text-slate-900 mt-2 truncate'>
            ₹ {totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className='bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider'>
              Advance
            </span>
            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center'>
              <Wallet size={18} />
            </div>
          </div>
          <p className='text-lg sm:text-2xl font-bold text-emerald-600 mt-2 truncate'>
            ₹ {totalAdvance.toLocaleString('en-IN')}
          </p>
        </div>

        <div className='bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider'>
              Balance Due
            </span>
            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center'>
              <Clock size={18} />
            </div>
          </div>
          <p className='text-lg sm:text-2xl font-bold text-rose-600 mt-2 truncate'>
            ₹ {totalBalanceDue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className='bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider'>
              Net Margin
            </span>
            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center'>
              <TrendingUp size={18} />
            </div>
          </div>
          <p className='text-lg sm:text-2xl font-bold text-blue-600 mt-2 truncate'>
            ₹ {totalNetProfit.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Invoices List / Card Container */}
      <div className='bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden no-print'>
        <div className='px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50'>
          <div className='flex items-center gap-2'>
            <FileText size={18} className='text-slate-500' />
            <h3 className='font-semibold text-slate-800 text-sm sm:text-base'>
              Invoices
            </h3>
          </div>
          <span className='px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold'>
            {invoices.length}
          </span>
        </div>

        {/* Loading / Empty States */}
        {loading ? (
          <div className='text-center py-12 text-slate-400 text-sm'>
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className='text-center py-12 px-4 text-slate-500 text-sm'>
            <p className='font-medium text-slate-700'>No invoices generated yet</p>
            <p className='text-xs text-slate-400 mt-1'>
              Tap &quot;Create New Invoice&quot; to begin your first billing.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile / Tablet Cards (< 768px) */}
            <div className='divide-y divide-slate-100 md:hidden'>
              {invoices.map((inv) => (
                <div key={inv._id} className='p-4 space-y-3 hover:bg-slate-50/60 transition'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <span className='font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200'>
                        {inv.invoiceNumber}
                      </span>
                      <h4 className='font-semibold text-slate-900 text-base mt-1.5'>
                        {inv.customer?.name || 'Unnamed Client'}
                      </h4>
                      <p className='text-xs text-slate-500 flex items-center gap-1 mt-0.5'>
                        <Phone size={12} className='text-slate-400' />
                        {inv.customer?.phone || 'No phone'}
                      </p>
                    </div>
                    <span className={getStatusBadge(inv.billing?.paymentStatus)}>
                      {inv.billing?.paymentStatus || 'UNPAID'}
                    </span>
                  </div>

                  <div className='text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 space-y-1'>
                    <div className='flex justify-between items-center'>
                      <span className='text-slate-500'>Program:</span>
                      <span className='font-medium text-slate-800 truncate max-w-[180px]'>
                        {inv.eventDetails?.programName || 'Standard Event'}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-slate-500'>Date:</span>
                      <span className='font-medium text-slate-700 flex items-center gap-1'>
                        <Calendar size={12} />
                        {inv.eventDetails?.date
                          ? new Date(inv.eventDetails.date).toLocaleDateString('en-IN')
                          : '-'}
                      </span>
                    </div>
                  </div>

                  <div className='flex justify-between items-center pt-1 border-t border-slate-100 text-xs'>
                    <div>
                      <span className='text-slate-500 block text-[11px]'>Total Bill</span>
                      <span className='font-bold text-slate-900 text-sm'>
                        ₹ {(inv.billing?.subTotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className='text-right'>
                      <span className='text-slate-500 block text-[11px]'>Balance Due</span>
                      <span className='font-bold text-rose-600 text-sm'>
                        ₹ {(inv.billing?.balanceDue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Actions Grid */}
                  <div className='grid grid-cols-4 gap-2 pt-2 border-t border-slate-100'>
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className='flex items-center justify-center gap-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition'
                    >
                      <Printer size={14} /> Print
                    </button>
                    <button
                      onClick={() => handleSendWhatsApp(inv)}
                      className='flex items-center justify-center gap-1 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg active:scale-95 transition'
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>
                    <Link
                      to={`/invoices/new?edit=${inv._id}`}
                      className='flex items-center justify-center gap-1 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg active:scale-95 transition'
                    >
                      <Edit size={14} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(inv._id)}
                      className='flex items-center justify-center gap-1 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg active:scale-95 transition'
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Landscape Table (>= 768px) */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='min-w-full divide-y divide-slate-200 text-sm'>
                <thead className='bg-slate-50 text-slate-600 text-xs font-semibold'>
                  <tr>
                    <th className='px-4 lg:px-6 py-3.5 text-left'>Invoice</th>
                    <th className='px-4 lg:px-6 py-3.5 text-left'>Customer</th>
                    <th className='px-4 lg:px-6 py-3.5 text-left'>Program</th>
                    <th className='px-4 lg:px-6 py-3.5 text-left'>Date</th>
                    <th className='px-4 lg:px-6 py-3.5 text-right'>Total</th>
                    <th className='px-4 lg:px-6 py-3.5 text-right'>Balance Due</th>
                    <th className='px-4 lg:px-6 py-3.5 text-center'>Status</th>
                    <th className='px-4 lg:px-6 py-3.5 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {invoices.map((inv) => (
                    <tr key={inv._id} className='hover:bg-slate-50/80 transition'>
                      <td className='px-4 lg:px-6 py-4 font-mono font-bold text-slate-800 text-xs'>
                        {inv.invoiceNumber}
                      </td>
                      <td className='px-4 lg:px-6 py-4'>
                        <p className='font-semibold text-slate-900'>
                          {inv.customer?.name}
                        </p>
                        <p className='text-xs text-slate-500'>
                          {inv.customer?.phone}
                        </p>
                      </td>
                      <td className='px-4 lg:px-6 py-4 text-slate-700 max-w-[150px] truncate'>
                        {inv.eventDetails?.programName}
                      </td>
                      <td className='px-4 lg:px-6 py-4 text-slate-600 text-xs whitespace-nowrap'>
                        {inv.eventDetails?.date
                          ? new Date(inv.eventDetails.date).toLocaleDateString('en-IN')
                          : '-'}
                      </td>
                      <td className='px-4 lg:px-6 py-4 text-right font-medium text-slate-900 whitespace-nowrap'>
                        ₹ {(inv.billing?.subTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className='px-4 lg:px-6 py-4 text-right font-semibold text-rose-600 whitespace-nowrap'>
                        ₹ {(inv.billing?.balanceDue || 0).toLocaleString('en-IN')}
                      </td>
                      <td className='px-4 lg:px-6 py-4 text-center whitespace-nowrap'>
                        <span className={getStatusBadge(inv.billing?.paymentStatus)}>
                          {inv.billing?.paymentStatus || 'UNPAID'}
                        </span>
                      </td>
                      <td className='px-4 lg:px-6 py-4 text-right whitespace-nowrap'>
                        <div className='inline-flex items-center gap-1'>
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
                            className='p-1.5 inline-block text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition'
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Print View Modal */}
      {selectedInvoice && (
        <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto'>
          <div className='bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full p-4 sm:p-6 relative max-h-[92vh] flex flex-col shadow-2xl'>
            <div className='flex items-center justify-between pb-3 border-b border-slate-100 mb-4 no-print'>
              <h3 className='font-bold text-slate-800 text-sm sm:text-base'>
                Print Preview: {selectedInvoice.invoiceNumber}
              </h3>
              <div className='flex gap-2'>
                <button
                  onClick={() => window.print()}
                  className='inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-amber-700 transition'
                >
                  <Printer size={15} /> Print
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className='px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition'
                >
                  Close
                </button>
              </div>
            </div>
            <div className='overflow-y-auto flex-1 pr-1'>
              <InvoicePrintView invoice={selectedInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}