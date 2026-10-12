import React from 'react';

export default function InvoicePrintView({ invoice }) {
  if (!invoice) return null;

  return (
    <div className='bg-white p-8 max-w-3xl mx-auto border border-slate-200 rounded-xl shadow-sm text-slate-900'>
      {/* Header */}
      <div className='flex justify-between items-start border-b pb-6'>
        <div>
          <h1 className='text-2xl font-black text-amber-600 tracking-wide'>
            SMIT WEDDING HALL
          </h1>
          <p className='text-xs text-slate-500 mt-1'>
            Special Events, Receptions & Banquets
          </p>
          <p className='text-xs text-slate-500'>Contact: +91 98765 43210</p>
        </div>
        <div className='text-right'>
          <span className='text-xs font-bold uppercase text-slate-400'>
            Invoice Number
          </span>
          <p className='font-mono text-base font-bold text-slate-800'>
            {invoice.invoiceNumber}
          </p>
          <p className='text-xs text-slate-500 mt-1'>
            Date:{' '}
            {new Date(invoice.createdAt || Date.now()).toLocaleDateString(
              'en-IN',
            )}
          </p>
        </div>
      </div>

      {/* Customer & Event Details */}
      <div className='grid grid-cols-2 gap-4 py-4 border-b text-xs'>
        <div>
          <p className='text-slate-400 uppercase font-bold'>Billed To</p>
          <p className='text-sm font-semibold text-slate-900 mt-0.5'>
            {invoice.customer.name}
          </p>
          <p className='text-slate-600'>{invoice.customer.phone}</p>
        </div>
        <div className='text-right'>
          <p className='text-slate-400 uppercase font-bold'>Event Details</p>
          <p className='text-sm font-semibold text-slate-900 mt-0.5'>
            {invoice.eventDetails.programName}
          </p>
          <p className='text-slate-600'>
            {new Date(invoice.eventDetails.date).toLocaleDateString('en-IN')} (
            {invoice.eventDetails.timeSlot})
          </p>
        </div>
      </div>

      {/* Table */}
      <table className='w-full my-6 text-xs divide-y divide-slate-200'>
        <thead>
          <tr className='text-slate-500 font-bold uppercase'>
            <th className='py-2 text-left'>Item Description</th>
            <th className='py-2 text-right'>Rate (₹)</th>
            <th className='py-2 text-right'>Qty</th>
            <th className='py-2 text-right'>Amount (₹)</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100'>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className='py-2'>
              <td className='py-2.5 font-medium'>{item.name}</td>
              <td className='py-2.5 text-right'>
                ₹ {Number(item.rate).toLocaleString('en-IN')}
              </td>
              <td className='py-2.5 text-right'>{item.quantity}</td>
              <td className='py-2.5 text-right font-semibold'>
                ₹ {Number(item.total).toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className='border-t pt-4 space-y-1.5 text-xs max-w-xs ml-auto'>
        <div className='flex justify-between text-slate-600'>
          <span>Subtotal:</span>
          <span className='font-semibold text-slate-800'>
            ₹ {Number(invoice.billing.subTotal).toLocaleString('en-IN')}
          </span>
        </div>
        <div className='flex justify-between text-emerald-700'>
          <span>Advance Received:</span>
          <span className='font-semibold'>
            - ₹ {Number(invoice.billing.advancePaid).toLocaleString('en-IN')}
          </span>
        </div>
        <div className='flex justify-between pt-2 border-t text-sm font-bold text-slate-900'>
          <span>Balance Due:</span>
          <span className='text-rose-600'>
            ₹ {Number(invoice.billing.balanceDue).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className='mt-8 pt-4 border-t text-center text-[10px] text-slate-400'>
        Thank you for choosing Smit Wedding Hall! Have a memorable celebration.
      </div>
    </div>
  );
}
