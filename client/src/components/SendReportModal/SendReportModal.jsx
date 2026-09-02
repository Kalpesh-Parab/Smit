import { useState } from 'react';
import { toast } from 'sonner';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Send, Loader2, Calendar, FileText } from 'lucide-react';
import './SendReportModal.scss';

export default function SendReportModal({
  isOpen,
  onClose,
  serviceName = '',
  filterParams = {},
  periodLabel = '',
}) {
  const { googleContacts } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleContactSelect = (e) => {
    const val = e.target.value;
    setRecipient(val);

    const match = googleContacts.find(
      (c) => c.name.toLowerCase() === val.toLowerCase(),
    );
    if (match && match.phone) {
      setPhone(match.phone.replace(/\s+/g, ''));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please specify a recipient WhatsApp number');
      return;
    }

    try {
      setSubmitting(true);
      toast.loading(
        `Compiling & sending PDF report to ${recipient || phone}...`,
      );

      const res = await api.post('/whatsapp/send-report', {
        recipientPhone: phone,
        service: serviceName,
        periodLabel,
        ...filterParams,
      });

      toast.dismiss();
      if (res.data.success) {
        toast.success('Report PDF successfully dispatched to WhatsApp!');
        onClose();
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to dispatch report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-card report-modal'>
        <div className='modal-header'>
          <div className='header-meta'>
            <FileText size={20} className='header-icon' />
            <h3>Send WhatsApp Audit Report</h3>
          </div>
          <button className='close-btn' onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className='report-summary-badge'>
          <Calendar size={14} />
          <span>
            Active Period: <strong>{periodLabel || 'This Month'}</strong>
          </span>
        </div>

        <form onSubmit={handleSend} className='modal-form'>
          <div className='form-group'>
            <label>Select Owner / Recipient Contact</label>
            <input
              list='contacts-list'
              type='text'
              placeholder='Search by name from Google Contacts...'
              value={recipient}
              onChange={handleContactSelect}
            />
            <datalist id='contacts-list'>
              {googleContacts.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.phone}
                </option>
              ))}
            </datalist>
          </div>

          <div className='form-group'>
            <label>WhatsApp Number *</label>
            <input
              type='tel'
              placeholder='e.g. 9876543210'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className='modal-actions'>
            <button type='button' className='cancel-btn' onClick={onClose}>
              Cancel
            </button>
            <button type='submit' className='submit-btn' disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className='spinner' />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Report PDF</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
