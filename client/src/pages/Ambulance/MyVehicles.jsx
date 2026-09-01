import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Truck,
  Search,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { getItems, createItem, deleteItem } from '../../services/api';
import './MyVehicles.scss';

export default function MyVehicles() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    vehicleNo: '',
    vehicleModel: '',
  });

  // Fetch list
  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const res = await getItems('ambulances');
      if (res.success) {
        setAmbulances(res.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch ambulances',
      );
    } finally {
      setLoading(false);
    }
  };

  // Create new
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await createItem('ambulances', formData);
      if (res.success) {
        toast.success('Ambulance added successfully');
        setFormData({ vehicleNo: '', vehicleModel: '' });
        setIsModalOpen(false);
        fetchAmbulances();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id, vehicleNo) => {
    if (!window.confirm(`Are you sure you want to delete ${vehicleNo}?`))
      return;
    try {
      const res = await deleteItem('ambulances', id);
      if (res.success) {
        toast.success(`Vehicle ${vehicleNo} deleted`);
        setAmbulances((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredAmbulances = ambulances.filter(
    (item) =>
      item.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='service-page-container'>
      <div className='service-header'>
        <div className='header-text'>
          <h2 className='service-heading'>My Ambulances</h2>
          <p className='service-subtext'>
            Active fleet status, emergency units, and vehicle registry.
          </p>
        </div>
        <button
          className='add-vehicle-btn'
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          <span>Add Ambulance</span>
        </button>
      </div>

      <div className='toolbar-section'>
        <div className='search-bar'>
          <Search size={18} className='search-icon' />
          <input
            type='text'
            placeholder='Search by vehicle no. or model...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className='clear-btn' onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className='fleet-count-badge'>
          Total Fleet: <strong>{ambulances.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className='state-container'>
          <Loader2 className='spinner' size={32} />
          <p>Loading ambulances fleet...</p>
        </div>
      ) : filteredAmbulances.length === 0 ? (
        <div className='state-container empty'>
          <AlertCircle size={40} className='empty-icon' />
          <h3>No Ambulances Found</h3>
          <p>
            {searchQuery
              ? 'No vehicles match your search criteria.'
              : 'Your fleet is empty. Add your first ambulance to get started.'}
          </p>
        </div>
      ) : (
        <div className='vehicle-grid'>
          {filteredAmbulances.map((ambulance) => (
            <div key={ambulance._id} className='vehicle-card'>
              <div className='card-top'>
                <div className='icon-wrapper'>
                  <Truck size={22} />
                </div>
                <button
                  className='delete-action-btn'
                  onClick={() =>
                    handleDelete(ambulance._id, ambulance.vehicleNo)
                  }
                  title='Delete Vehicle'
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className='card-info'>
                <span className='plate-badge'>{ambulance.vehicleNo}</span>
                <h4 className='model-name'>{ambulance.vehicleModel}</h4>
              </div>

              <div className='card-footer'>
                <span className='status-indicator'>
                  <span className='dot'></span> Active Unit
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h3>Add New Ambulance</h3>
              <button
                className='close-btn'
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className='modal-form'>
              <div className='form-group'>
                <label>Vehicle Number</label>
                <input
                  type='text'
                  name='vehicleNo'
                  placeholder='e.g. MH 12 AB 1234'
                  value={formData.vehicleNo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className='form-group'>
                <label>Vehicle Model / Type</label>
                <input
                  type='text'
                  name='vehicleModel'
                  placeholder='e.g. Force Traveller / ICU'
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className='modal-actions'>
                <button
                  type='button'
                  className='cancel-btn'
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='submit-btn'
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className='spinner' />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Add Vehicle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
