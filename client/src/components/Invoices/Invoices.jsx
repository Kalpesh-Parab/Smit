import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from '../../services/api';
import CreateInvoice from '../CreateInvoice/CreateInvoice';
import InvoiceHistory from '../InvoiceHistory/InvoiceHistory';
import './Invoices.scss';

export default function Invoices({
  serviceName = 'ambulance',
  title = 'Invoices',
}) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Fetch invoices for this specific service
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getItems(`invoices?service=${serviceName}`);
      if (res.success) {
        setInvoices(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    setEditingInvoice(null);
  }, [serviceName]);

  const handleSaveInvoice = async (formData) => {
    try {
      if (editingInvoice) {
        const res = await updateItem('invoices', editingInvoice._id, formData);
        if (res.success) {
          toast.success('Invoice updated successfully');
          setEditingInvoice(null);
          fetchInvoices();
        }
      } else {
        const res = await createItem('invoices', {
          ...formData,
          service: serviceName,
        });
        if (res.success) {
          toast.success('Invoice created successfully');
          fetchInvoices();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save invoice');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?'))
      return;
    try {
      const res = await deleteItem('invoices', id);
      if (res.success) {
        toast.success('Invoice deleted successfully');
        setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    }
  };

  return (
    <div className='invoices-page-container'>
      <div className='section-header'>
        <h2 className='section-title'>{title}</h2>
        <p className='section-subtitle'>
          Create, edit, and send billing records for{' '}
          {serviceName.replace('-', ' ')}.
        </p>
      </div>

      <CreateInvoice
        serviceName={serviceName}
        editingInvoice={editingInvoice}
        onCancelEdit={() => setEditingInvoice(null)}
        onSubmit={handleSaveInvoice}
      />

      <InvoiceHistory
        invoices={invoices}
        loading={loading}
        onEdit={(inv) => setEditingInvoice(inv)}
        onDelete={handleDeleteInvoice}
      />
    </div>
  );
}
