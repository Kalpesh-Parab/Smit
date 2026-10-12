import React, { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';

export default function InvoicePrintView({ invoice }) {
  const invoiceRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!invoice) return null;

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current || isDownloading) return;

    const toastId = toast.loading('Generating optimized PDF...');

    try {
      setIsDownloading(true);

      const filename = `${invoice.invoiceNumber || 'Invoice'}_${
        invoice.customer?.name?.replace(/\s+/g, '_') || 'Customer'
      }.pdf`;

      const options = {
        margin: [8, 8, 8, 8],
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          onclone: (clonedDoc) => {
            // Strip or convert modern oklch colors in the cloned tree to prevent html2canvas failure
            const elements = clonedDoc.querySelectorAll('*');
            elements.forEach((el) => {
              const computed = window.getComputedStyle(el);
              const colorProps = [
                'color',
                'backgroundColor',
                'borderColor',
                'outlineColor',
              ];
              colorProps.forEach((prop) => {
                const val = computed[prop];
                if (val && val.includes('oklch')) {
                  // Fall back to safe computed RGB/transparent defaults
                  el.style[prop] =
                    prop === 'backgroundColor' ? '#ffffff' : '#334155';
                }
              });
            });
          },
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
      };

      await html2pdf().set(options).from(invoiceRef.current).save();
      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Use the Print option.', {
        id: toastId,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className='max-w-3xl mx-auto'>
      {/* Top Action Bar */}
      <div className='flex justify-end mb-4 no-print'>
        <button
          type='button'
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed'
        >
          <Download size={16} />
          {isDownloading ? 'Compressing & Saving...' : 'Download PDF'}
        </button>
      </div>

      {/* Printable Invoice Container using explicit hex values for rock-solid parsing */}
      <div
        ref={invoiceRef}
        style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
        className='p-8 border border-slate-200 rounded-xl shadow-sm print:shadow-none print:border-none print:p-4'
      >
        {/* Header */}
        <div className='flex justify-between items-start border-b border-slate-200 pb-6'>
          <div>
            <h1
              style={{ color: '#d97706' }}
              className='text-2xl font-black tracking-wide'
            >
              SMIT WEDDING HALL
            </h1>
            <p style={{ color: '#64748b' }} className='text-xs mt-1'>
              Special Events, Receptions & Banquets
            </p>
            <p style={{ color: '#64748b' }} className='text-xs'>
              Contact: +91 98765 43210
            </p>
          </div>
          <div className='text-right'>
            <span
              style={{ color: '#94a3b8' }}
              className='text-xs font-bold uppercase'
            >
              Invoice Number
            </span>
            <p
              style={{ color: '#1e293b' }}
              className='font-mono text-base font-bold'
            >
              {invoice.invoiceNumber || 'INV-DRAFT'}
            </p>
            <p style={{ color: '#64748b' }} className='text-xs mt-1'>
              Date:{' '}
              {new Date(invoice.createdAt || Date.now()).toLocaleDateString(
                'en-IN',
              )}
            </p>
          </div>
        </div>

        {/* Customer & Event Details */}
        <div className='grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs'>
          <div>
            <p style={{ color: '#94a3b8' }} className='uppercase font-bold'>
              Billed To
            </p>
            <p
              style={{ color: '#0f172a' }}
              className='text-sm font-semibold mt-0.5'
            >
              {invoice.customer?.name}
            </p>
            <p style={{ color: '#475569' }}>{invoice.customer?.phone}</p>
          </div>
          <div className='text-right'>
            <p style={{ color: '#94a3b8' }} className='uppercase font-bold'>
              Event Details
            </p>
            <p
              style={{ color: '#0f172a' }}
              className='text-sm font-semibold mt-0.5'
            >
              {invoice.eventDetails?.programName}
            </p>
            <p style={{ color: '#475569' }}>
              {invoice.eventDetails?.date
                ? new Date(invoice.eventDetails.date).toLocaleDateString(
                    'en-IN',
                  )
                : '-'}{' '}
              ({invoice.eventDetails?.timeSlot || 'Full Day'})
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className='w-full my-6 text-xs divide-y divide-slate-200'>
          <thead>
            <tr style={{ color: '#64748b' }} className='font-bold uppercase'>
              <th className='py-2 text-left'>Item Description</th>
              <th className='py-2 text-right'>Rate (₹)</th>
              <th className='py-2 text-right'>Qty</th>
              <th className='py-2 text-right'>Amount (₹)</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {(invoice.items || []).map((item, idx) => (
              <tr key={idx} className='py-2'>
                <td className='py-2.5 font-medium'>{item.name}</td>
                <td className='py-2.5 text-right'>
                  ₹ {Number(item.rate || 0).toLocaleString('en-IN')}
                </td>
                <td className='py-2.5 text-right'>{item.quantity || 1}</td>
                <td className='py-2.5 text-right font-semibold'>
                  ₹ {Number(item.total || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className='border-t border-slate-200 pt-4 space-y-1.5 text-xs max-w-xs ml-auto'>
          <div className='flex justify-between' style={{ color: '#475569' }}>
            <span>Subtotal:</span>
            <span style={{ color: '#1e293b' }} className='font-semibold'>
              ₹ {Number(invoice.billing?.subTotal || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className='flex justify-between' style={{ color: '#047857' }}>
            <span>Advance Received:</span>
            <span className='font-semibold'>
              - ₹{' '}
              {Number(invoice.billing?.advancePaid || 0).toLocaleString(
                'en-IN',
              )}
            </span>
          </div>
          <div
            className='flex justify-between pt-2 border-t border-slate-200 text-sm font-bold'
            style={{ color: '#0f172a' }}
          >
            <span>Balance Due:</span>
            <span style={{ color: '#e11d48' }}>
              ₹{' '}
              {Number(invoice.billing?.balanceDue || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ color: '#94a3b8' }}
          className='mt-8 pt-4 border-t border-slate-200 text-center text-[10px]'
        >
          Thank you for choosing Smit Wedding Hall! Have a memorable
          celebration.
        </div>
      </div>
    </div>
  );
}
