import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Wrench,
  Search,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { getItems, createItem, deleteItem } from '../../services/api';
import './MyTowingVans.scss';

export default function MyTowingVans() {
  const [towingVans, setTowingVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    vehicleNo: '',
    vehicleModel: '',
  });

  const fetchTowingVans = async () => {
    try {
      setLoading(true);
      const res = await getItems('towing-vans');
      if (res.success) {
        setTowingVans(res.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch towing vans',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTowingVans();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNo.trim() || !formData.vehicleModel.trim()) {
      toast.error('Please enter both Vehicle Number and Model');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createItem('towing-vans', formData);
      if (res.success) {
        toast.success('Towing van added successfully');
        setFormData({ vehicleNo: '', vehicleModel: '' });
        setIsModalOpen(false);
        fetchTowingVans();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding towing van');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, vehicleNo) => {
    if (!window.confirm(`Are you sure you want to delete ${vehicleNo}?`))
      return;

    try {
      const res = await deleteItem('towing-vans', id);
      if (res.success) {
        toast.success(`Towing van ${vehicleNo} deleted`);
        setTowingVans((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete towing van',
      );
    }
  };

  const filteredVans = towingVans.filter(
    (item) =>
      item.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='service-page-container'>
      <div className='service-header'>
        <div className='header-text'>
          <h2 className='service-heading'>My Towing Vans</h2>
          <p className='service-subtext'>
            Roadside recovery fleet, flatbeds, and towing trucks registry.
          </p>
        </div>
        <button
          className='add-vehicle-btn'
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          <span>Add Towing Van</span>
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
          Total Tow Trucks: <strong>{towingVans.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className='state-container'>
          <Loader2 className='spinner' size={32} />
          <p>Loading towing vans fleet...</p>
        </div>
      ) : filteredVans.length === 0 ? (
        <div className='state-container empty'>
          <AlertCircle size={40} className='empty-icon' />
          <h3>No Towing Vans Found</h3>
          <p>
            {searchQuery
              ? 'No vehicles match your search criteria.'
              : 'Fleet is empty. Add your first towing truck to get started.'}
          </p>
        </div>
      ) : (
        <div className='vehicle-grid'>
          {filteredVans.map((van) => (
            <div key={van._id} className='vehicle-card'>
              <div className='card-top'>
                <div className='icon-wrapper'>
                  <Wrench size={22} />
                </div>
                <button
                  className='delete-action-btn'
                  onClick={() => handleDelete(van._id, van.vehicleNo)}
                  title='Delete Vehicle'
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className='card-info'>
                <span className='plate-badge'>{van.vehicleNo}</span>
                <h4 className='model-name'>{van.vehicleModel}</h4>
              </div>

              <div className='card-footer'>
                <span className='status-indicator'>
                  <span className='dot'></span> Operational Unit
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
              <h3>Add New Towing Van</h3>
              <button
                className='close-btn'
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className='modal-form'>
              <div className='form-group'>
                <label>Vehicle Number *</label>
                <input
                  type='text'
                  name='vehicleNo'
                  placeholder='e.g. MH 12 CD 5678'
                  value={formData.vehicleNo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className='form-group'>
                <label>Vehicle Model / Type *</label>
                <input
                  type='text'
                  name='vehicleModel'
                  placeholder='e.g. Tata 407 Flatbed / Crane Tow'
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
                    'Add Towing Van'
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
