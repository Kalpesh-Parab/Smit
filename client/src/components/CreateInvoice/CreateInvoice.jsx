import { useState, useEffect } from 'react';
import { getItems } from '../../services/api';
import { PlusCircle, Edit3, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CreateInvoice.scss';

export default function CreateInvoice({
  serviceName,
  editingInvoice,
  onCancelEdit,
  onSubmit,
}) {
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    partyName: '',
    partyPhone: '',
    date: new Date().toISOString().split('T')[0],
    totalBill: '',
    paidAmount: '',
    notes: '',
    serviceDetails: {},
  });

  // Fetch specific asset list depending on active service
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const endpoint =
          serviceName === 'generators'
            ? 'generators'
            : serviceName === 'towing-vans'
              ? 'towing-vans'
              : 'ambulances';
        const res = await getItems(endpoint);
        if (res.success) {
          setAssets(res.data);
        }
      } catch (err) {
        setAssets([]);
      }
    };
    fetchAssets();
  }, [serviceName]);

  // Sync state if editing an existing invoice
  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        partyName: editingInvoice.partyName || '',
        partyPhone: editingInvoice.partyPhone || '',
        date: editingInvoice.date
          ? new Date(editingInvoice.date).toISOString().split('T')[0]
          : '',
        totalBill: editingInvoice.totalBill ?? '',
        paidAmount: editingInvoice.paidAmount ?? '',
        notes: editingInvoice.notes || '',
        serviceDetails:
          editingInvoice.serviceDetails instanceof Map
            ? Object.fromEntries(editingInvoice.serviceDetails)
            : editingInvoice.serviceDetails || {},
      });
    } else {
      setFormData({
        partyName: '',
        partyPhone: '',
        date: new Date().toISOString().split('T')[0],
        totalBill: '',
        paidAmount: '',
        notes: '',
        serviceDetails: {},
      });
    }
  }, [editingInvoice, serviceName]);

  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceDetailChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      serviceDetails: {
        ...prev.serviceDetails,
        [key]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!editingInvoice) {
      setFormData({
        partyName: '',
        partyPhone: '',
        date: new Date().toISOString().split('T')[0],
        totalBill: '',
        paidAmount: '',
        notes: '',
        serviceDetails: {},
      });
    }
  };

  const remainingCalc = Math.max(
    0,
    (Number(formData.totalBill) || 0) - (Number(formData.paidAmount) || 0),
  );

  const { googleContacts } = useAuth();
  return (
    <div className='create-invoice-card'>
      <div className='card-header'>
        <div className='header-title'>
          {editingInvoice ? <Edit3 size={18} /> : <PlusCircle size={18} />}
          <h3>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</h3>
        </div>
        {editingInvoice && (
          <button
            type='button'
            className='cancel-edit-btn'
            onClick={onCancelEdit}
          >
            <X size={16} /> Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className='invoice-form'>
        {/* Core Customer Info */}
        <div className='form-grid'>
          <div className='form-group'>
            <label>Party / Customer Name *</label>
            <input
              list='google-contacts-list'
              type='text'
              name='partyName'
              placeholder='e.g. Ramesh Patil'
              value={formData.partyName}
              onChange={(e) => {
                handleBaseChange(e);
                // Auto-fill phone if selecting matching contact
                const match = googleContacts.find(
                  (c) => c.name.toLowerCase() === e.target.value.toLowerCase(),
                );
                if (match && match.phone) {
                  setFormData((prev) => ({
                    ...prev,
                    partyPhone: match.phone.replace(/\s+/g, ''),
                  }));
                }
              }}
              required
            />
            <datalist id='google-contacts-list'>
              {googleContacts.map((c, idx) => (
                <option key={idx} value={c.name}>
                  {c.phone}
                </option>
              ))}
            </datalist>
          </div>

          <div className='form-group'>
            <label>WhatsApp / Phone Number *</label>
            <input
              type='tel'
              name='partyPhone'
              placeholder='e.g. 9876543210'
              value={formData.partyPhone}
              onChange={handleBaseChange}
              required
            />
          </div>

          <div className='form-group'>
            <label>Date *</label>
            <input
              type='date'
              name='date'
              value={formData.date}
              onChange={handleBaseChange}
              required
            />
          </div>
        </div>

        {/* Service-Specific Dynamic Inputs */}
        <div className='form-grid dynamic-grid'>
          {/* Ambulance Fields */}
          {serviceName === 'ambulance' && (
            <>
              <div className='form-group'>
                <label>Vehicle No. *</label>
                <input
                  list='ambulance-list'
                  placeholder='Select or enter vehicle no.'
                  value={formData.serviceDetails.vehicleNo || ''}
                  onChange={(e) =>
                    handleServiceDetailChange('vehicleNo', e.target.value)
                  }
                  required
                />
                <datalist id='ambulance-list'>
                  {assets.map((v) => (
                    <option key={v._id} value={v.vehicleNo}>
                      {v.vehicleModel}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className='form-group'>
                <label>Location / Destination</label>
                <input
                  type='text'
                  placeholder='e.g. Pune to Mumbai'
                  value={formData.serviceDetails.location || ''}
                  onChange={(e) =>
                    handleServiceDetailChange('location', e.target.value)
                  }
                />
              </div>

              <div className='form-group'>
                <label>Base Rent (₹)</label>
                <input
                  type='number'
                  placeholder='₹ Base Rent'
                  value={formData.serviceDetails.rent || ''}
                  onChange={(e) =>
                    handleServiceDetailChange('rent', e.target.value)
                  }
                />
              </div>
            </>
          )}

          {/* Generator Fields */}
          {serviceName === 'generators' && (
            <>
              <div className='form-group'>
                <label>Generator Machine / Identifier *</label>
                <input
                  list='generator-list'
                  placeholder='Select or enter machine (e.g. 13 kVA - Omni)'
                  value={formData.serviceDetails.generatorDetails || ''}
                  onChange={(e) =>
                    handleServiceDetailChange(
                      'generatorDetails',
                      e.target.value,
                    )
                  }
                  required
                />
                <datalist id='generator-list'>
                  {assets.map((g) => (
                    <option key={g._id} value={g.identifier}>
                      {g.capacityKva} kVA{' '}
                      {g.mountedOn ? `(${g.mountedOn})` : ''}{' '}
                      {g.make ? `• ${g.make}` : ''}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className='form-group'>
                <label>Operational Duration (Hours / Days)</label>
                <input
                  type='text'
                  placeholder='e.g. 2 Days / 12 Hours'
                  value={formData.serviceDetails.duration || ''}
                  onChange={(e) =>
                    handleServiceDetailChange('duration', e.target.value)
                  }
                />
              </div>

              <div className='form-group'>
                <label>Rent per Unit / Rate (₹)</label>
                <input
                  type='number'
                  placeholder='₹ Rate'
                  value={formData.serviceDetails.ratePerUnit || ''}
                  onChange={(e) =>
                    handleServiceDetailChange('ratePerUnit', e.target.value)
                  }
                />
              </div>
            </>
          )}

          {/* Towing Van Fields */}
          {serviceName === 'towing-vans' && (
            <>
              <div className='form-group'>
                <label>Towing Vehicle No. *</label>
                <input
                  list='towing-list'
                  placeholder='Select or enter vehicle no.'
                  value={formData.serviceDetails.vehicleNo || ''}
                  onChange={(e) =>
                    handleServiceDetailChange('vehicleNo', e.target.value)
                  }
                  required
                />
                <datalist id='towing-list'>
                  {assets.map((v) => (
                    <option key={v._id} value={v.vehicleNo}>
                      {v.vehicleModel}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className='form-group'>
                <label>Pickup & Drop Location</label>
                <input
                  type='text'
                  placeholder='e.g. Highway Toll to Workshop'
                  value={formData.serviceDetails.location || ''}
                  onChange={(e) =>
                    handleServiceDetailChange('location', e.target.value)
                  }
                />
              </div>
            </>
          )}
        </div>

        {/* Financial Details */}
        <div className='form-grid finance-grid'>
          <div className='form-group'>
            <label>Total Bill Amount (₹) *</label>
            <input
              type='number'
              name='totalBill'
              placeholder='0'
              value={formData.totalBill}
              onChange={handleBaseChange}
              required
            />
          </div>

          <div className='form-group'>
            <label>Paid Amount (₹)</label>
            <input
              type='number'
              name='paidAmount'
              placeholder='0'
              value={formData.paidAmount}
              onChange={handleBaseChange}
            />
          </div>

          <div className='form-group'>
            <label>Remaining Balance (₹)</label>
            <input
              type='number'
              value={remainingCalc}
              readOnly
              className='readonly-input'
            />
          </div>
        </div>

        <div className='form-group'>
          <label>Additional Notes / Remarks</label>
          <input
            type='text'
            name='notes'
            placeholder='e.g. Payment via UPI / Advance Received'
            value={formData.notes}
            onChange={handleBaseChange}
          />
        </div>

        <div className='form-actions'>
          <button type='submit' className='submit-invoice-btn'>
            {editingInvoice ? 'Update Invoice' : 'Generate & Save Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
