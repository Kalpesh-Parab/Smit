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

  // 1. Download Tiny Vector PDF from Server (~5 KB)
  const handleDownloadPDF = (inv) => {
    try {
      window.open(
        `http://localhost:5000/api/invoices/${inv._id}/pdf`,
        '_blank',
      );
    } catch {
      toast.error('Failed to open PDF');
    }
  };

  // 2. Send PDF via WhatsApp Bot directly from backend
  const handleSendWhatsAppPDF = async (inv) => {
    try {
      setSendingId(inv._id);
      toast.loading(`Sending PDF to ${inv.partyName}...`);

      const res = await axios.post(
        `http://localhost:5000/api/whatsapp/send-invoice/${inv._id}`,
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
        <div className='table-responsive'>
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
      )}
    </div>
  );
}
