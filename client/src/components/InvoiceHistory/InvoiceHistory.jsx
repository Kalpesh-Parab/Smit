import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Search,
  Send,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  Download,
} from 'lucide-react';
import './InvoiceHistory.scss';

export default function InvoiceHistory({
  invoices = [],
  loading,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState('');
  const [sendingId, setSendingId] = useState(null);

  // 1. Download Vector PDF
  const handleDownloadPDF = (inv) => {
    try {
      window.open(
        `https://smit-x7hq.onrender.com/api/invoices/${inv._id}/pdf`,
        '_blank',
      );
    } catch {
      toast.error('Failed to open PDF');
    }
  };

  // 2. Dispatch PDF via WhatsApp Bot
  const handleSendWhatsAppPDF = async (inv) => {
    try {
      setSendingId(inv._id);
      toast.loading(`Sending PDF to ${inv.partyName}...`);

      const res = await axios.post(
        `https://smit-x7hq.onrender.com/api/whatsapp/send-invoice/${inv._id}`,
        {},
        { withCredentials: true },
      );

      toast.dismiss();
      if (res.data.success) {
        toast.success(`Invoice sent to ${inv.partyName} on WhatsApp!`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(
        error.response?.data?.message || 'Failed to send WhatsApp message',
      );
    } finally {
      setSendingId(null);
    }
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.partyName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.partyPhone?.includes(search),
  );

  return (
    <div className='invoice-history-card'>
      <div className='history-header'>
        <div className='title-area'>
          <h3>Invoice History</h3>
          <span className='count-badge'>{invoices.length} Total</span>
        </div>

        <div className='search-box'>
          <Search size={16} className='search-icon' />
          <input
            type='text'
            placeholder='Search party, invoice no, or phone...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className='loading-state'>
          <Loader2 size={28} className='spinner' />
          <p>Loading invoice records...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className='empty-state'>
          <AlertCircle size={36} />
          <p>No invoices found.</p>
        </div>
      ) : (
        <>
          {/* Desktop Tabular View (>= 769px) */}
          <div className='desktop-table-wrapper'>
            <table className='invoices-table'>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Party Details</th>
                  <th>Service Info</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th className='text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const details =
                    inv.serviceDetails instanceof Map
                      ? Object.fromEntries(inv.serviceDetails)
                      : inv.serviceDetails || {};

                  return (
                    <tr key={inv._id}>
                      <td className='font-mono font-semibold'>
                        {inv.invoiceNumber}
                      </td>
                      <td>{new Date(inv.date).toLocaleDateString('en-GB')}</td>
                      <td>
                        <div className='party-cell'>
                          <strong>{inv.partyName}</strong>
                          <span>{inv.partyPhone}</span>
                        </div>
                      </td>
                      <td>
                        <div className='details-cell'>
                          {details.vehicleNo && (
                            <span>Veh: {details.vehicleNo}</span>
                          )}
                          {details.generatorDetails && (
                            <span>{details.generatorDetails}</span>
                          )}
                          {details.duration && (
                            <span>Dur: {details.duration}</span>
                          )}
                          {details.location && (
                            <span>Loc: {details.location}</span>
                          )}
                        </div>
                      </td>
                      <td className='font-semibold'>₹{inv.totalBill}</td>
                      <td className='text-success'>₹{inv.paidAmount}</td>
                      <td
                        className={
                          inv.remainingAmount > 0
                            ? 'text-danger font-semibold'
                            : ''
                        }
                      >
                        ₹{inv.remainingAmount}
                      </td>
                      <td>
                        <span className={`status-pill ${inv.paymentStatus}`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <div className='action-buttons'>
                          <button
                            className='action-btn wa'
                            title='Send PDF on WhatsApp'
                            disabled={sendingId === inv._id}
                            onClick={() => handleSendWhatsAppPDF(inv)}
                          >
                            {sendingId === inv._id ? (
                              <Loader2 size={15} className='spinner' />
                            ) : (
                              <Send size={15} />
                            )}
                          </button>
                          <button
                            className='action-btn download'
                            title='View / Download PDF'
                            onClick={() => handleDownloadPDF(inv)}
                          >
                            <Download size={15} />
                          </button>
                          <button
                            className='action-btn edit'
                            title='Edit'
                            onClick={() => onEdit(inv)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className='action-btn delete'
                            title='Delete'
                            onClick={() => onDelete(inv._id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Zero-Scroll Two-Row Card Stack (<= 768px) */}
          <div className='mobile-invoices-list'>
            {filteredInvoices.map((inv) => {
              const details =
                inv.serviceDetails instanceof Map
                  ? Object.fromEntries(inv.serviceDetails)
                  : inv.serviceDetails || {};

              return (
                <div key={inv._id} className='mobile-invoice-row'>
                  {/* Top Segment: Invoice #, Date & Status */}
                  <div className='row-header'>
                    <div className='meta-left'>
                      <span className='inv-code'>{inv.invoiceNumber}</span>
                      <span className='inv-date'>
                        {new Date(inv.date).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <span className={`status-pill ${inv.paymentStatus}`}>
                      {inv.paymentStatus}
                    </span>
                  </div>

                  {/* Body Segment: Party & Service Specs */}
                  <div className='row-body'>
                    <div className='party-block'>
                      <strong>{inv.partyName}</strong>
                      <small>{inv.partyPhone}</small>
                    </div>

                    <div className='service-block'>
                      {details.vehicleNo && <span>{details.vehicleNo}</span>}
                      {details.generatorDetails && (
                        <span>{details.generatorDetails}</span>
                      )}
                      {details.duration && <span> • {details.duration}</span>}
                      {details.location && <small>{details.location}</small>}
                    </div>
                  </div>

                  {/* Financials & Action Buttons Row */}
                  <div className='row-footer'>
                    <div className='financials'>
                      <div className='f-col'>
                        <span>Total</span>
                        <strong>₹{inv.totalBill}</strong>
                      </div>
                      <div className='f-col'>
                        <span>Paid</span>
                        <strong className='text-success'>
                          ₹{inv.paidAmount}
                        </strong>
                      </div>
                      <div className='f-col'>
                        <span>Bal</span>
                        <strong
                          className={
                            inv.remainingAmount > 0 ? 'text-danger' : ''
                          }
                        >
                          ₹{inv.remainingAmount}
                        </strong>
                      </div>
                    </div>

                    <div className='action-buttons'>
                      <button
                        className='action-btn wa'
                        title='WhatsApp'
                        disabled={sendingId === inv._id}
                        onClick={() => handleSendWhatsAppPDF(inv)}
                      >
                        {sendingId === inv._id ? (
                          <Loader2 size={14} className='spinner' />
                        ) : (
                          <Send size={14} />
                        )}
                      </button>
                      <button
                        className='action-btn download'
                        title='Download'
                        onClick={() => handleDownloadPDF(inv)}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        className='action-btn edit'
                        title='Edit'
                        onClick={() => onEdit(inv)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className='action-btn delete'
                        title='Delete'
                        onClick={() => onDelete(inv._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
