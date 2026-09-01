import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  MessageSquare,
  X,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import './WhatsAppModal.scss';

export default function WhatsAppModal({ isOpen, onClose }) {
  const [status, setStatus] = useState({ connected: false, qrCode: null });
  const [initialLoading, setInitialLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = async (isManual = false) => {
    try {
      const res = await axios.get('http://localhost:5000/api/whatsapp/status', {
        withCredentials: true,
      });
      setStatus(res.data);
      if (isManual && res.data.connected) {
        toast.success('WhatsApp Bot is active and connected!');
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp status:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setInitialLoading(true);
      fetchStatus();
      // Poll quietly in background without triggering component-wide loader
      const interval = setInterval(() => {
        fetchStatus(false);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    if (
      !window.confirm(
        'Are you sure you want to disconnect this WhatsApp session?',
      )
    )
      return;
    try {
      setDisconnecting(true);
      await axios.post(
        'http://localhost:5000/api/whatsapp/logout',
        {},
        { withCredentials: true },
      );
      toast.success('Session disconnected. Ready to scan new QR.');
      fetchStatus(false);
    } catch (err) {
      toast.error('Failed to disconnect WhatsApp device.');
    } finally {
      setDisconnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='wa-modal-overlay'>
      <div className='wa-modal-card'>
        <div className='wa-modal-header'>
          <div className='title-group'>
            <MessageSquare className='wa-icon' size={20} />
            <h3>WhatsApp Bot Connection</h3>
          </div>
          <button className='btn-close' onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className='wa-modal-body'>
          {initialLoading && !status.qrCode && !status.connected ? (
            <div className='status-box'>
              <Loader2 className='spinner' size={32} />
              <p className='status-text'>Checking WhatsApp connection...</p>
            </div>
          ) : status.connected ? (
            <div className='status-box connected'>
              <CheckCircle2 size={48} className='check-icon' />
              <h4>WhatsApp Bot is Connected & Active!</h4>
              <p>
                Invoices and PDF receipts will be sent from your linked number.
              </p>
              <button
                className='btn-disconnect'
                onClick={handleLogout}
                disabled={disconnecting}
              >
                {disconnecting
                  ? 'Disconnecting...'
                  : 'Disconnect / Pair New Number'}
              </button>
            </div>
          ) : status.qrCode ? (
            <div className='status-box qr-container'>
              <p className='instruction'>
                Scan this QR code using WhatsApp on your phone:
              </p>

              <div className='qr-image-wrapper'>
                <img src={status.qrCode} alt='WhatsApp QR Code' />
              </div>

              <ol className='steps'>
                <li>Open WhatsApp on your mobile phone.</li>
                <li>
                  Tap <strong>Settings / Three Dots</strong> &gt;{' '}
                  <strong>Linked Devices</strong>.
                </li>
                <li>
                  Tap <strong>Link a Device</strong> and scan this QR code.
                </li>
              </ol>

              <button className='btn-refresh' onClick={() => fetchStatus(true)}>
                <RefreshCw size={15} /> Refresh Status
              </button>
            </div>
          ) : (
            <div className='status-box'>
              <Loader2 className='spinner' size={32} />
              <p className='status-text'>
                Generating fresh pairing QR code... Please wait.
              </p>
              <button className='btn-refresh' onClick={() => fetchStatus(true)}>
                <RefreshCw size={15} /> Check Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
