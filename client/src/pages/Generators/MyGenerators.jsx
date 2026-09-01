import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Zap,
  Search,
  Loader2,
  AlertCircle,
  X,
  Radio,
} from 'lucide-react';
import { getItems, createItem, deleteItem } from '../../services/api';
import './MyGenerators.scss';

export default function MyGenerators() {
  const [generators, setGenerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    identifier: '',
    capacityKva: '',
    make: '',
    mountedOn: '',
    notes: '',
  });

  const fetchGenerators = async () => {
    try {
      setLoading(true);
      const res = await getItems('generators');
      if (res.success) {
        setGenerators(res.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch generators',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerators();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier.trim() || formData.capacityKva === '') {
      toast.error('Please enter both Identifier/Nickname and Capacity (kVA)');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createItem('generators', {
        ...formData,
        capacityKva: Number(formData.capacityKva),
      });

      if (res.success) {
        toast.success('Generator added successfully');
        setFormData({
          identifier: '',
          capacityKva: '',
          make: '',
          mountedOn: '',
          notes: '',
        });
        setIsModalOpen(false);
        fetchGenerators();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding generator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, identifier) => {
    if (!window.confirm(`Are you sure you want to delete "${identifier}"?`))
      return;

    try {
      const res = await deleteItem('generators', id);
      if (res.success) {
        toast.success(`Generator "${identifier}" deleted`);
        setGenerators((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to delete generator',
      );
    }
  };

  const filteredGenerators = generators.filter(
    (item) =>
      item.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.capacityKva.toString().includes(searchQuery) ||
      item.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mountedOn?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='service-page-container'>
      <div className='service-header'>
        <div className='header-text'>
          <h2 className='service-heading'>My Generators</h2>
          <p className='service-subtext'>
            Power capacity registry, portable sets, and vehicle mounts.
          </p>
        </div>
        <button
          className='add-generator-btn'
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          <span>Add Generator</span>
        </button>
      </div>

      <div className='toolbar-section'>
        <div className='search-bar'>
          <Search size={18} className='search-icon' />
          <input
            type='text'
            placeholder='Search by name, kVA, make, mount...'
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
          Total Machines: <strong>{generators.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className='state-container'>
          <Loader2 className='spinner' size={32} />
          <p>Loading generators inventory...</p>
        </div>
      ) : filteredGenerators.length === 0 ? (
        <div className='state-container empty'>
          <AlertCircle size={40} className='empty-icon' />
          <h3>No Generators Found</h3>
          <p>
            {searchQuery
              ? 'No generator units match your search keyword.'
              : 'Inventory is empty. Add your first generator unit to get started.'}
          </p>
        </div>
      ) : (
        <div className='generator-grid'>
          {filteredGenerators.map((gen) => (
            <div key={gen._id} className='generator-card'>
              <div className='card-top'>
                <div className='icon-wrapper'>
                  <Zap size={22} />
                </div>
                <button
                  className='delete-action-btn'
                  onClick={() => handleDelete(gen._id, gen.identifier)}
                  title='Delete Generator'
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className='card-info'>
                <div className='badge-row'>
                  <span className='capacity-badge'>{gen.capacityKva} kVA</span>
                  {gen.mountedOn && (
                    <span className='mount-badge'>{gen.mountedOn}</span>
                  )}
                </div>
                <h4 className='identifier-name'>{gen.identifier}</h4>
                {gen.make && <p className='make-text'>Make: {gen.make}</p>}
              </div>

              <div className='card-footer'>
                <span className='status-indicator'>
                  <Radio size={14} className='active-signal' /> Available Unit
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
              <h3>Add New Generator</h3>
              <button
                className='close-btn'
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className='modal-form'>
              <div className='form-group'>
                <label>Identifier / Nickname *</label>
                <input
                  type='text'
                  name='identifier'
                  placeholder='e.g. 13 kVA - Omni or Red Trolley'
                  value={formData.identifier}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className='form-grid'>
                <div className='form-group'>
                  <label>Power Capacity (kVA) *</label>
                  <input
                    type='number'
                    step='0.1'
                    name='capacityKva'
                    placeholder='e.g. 13 or 3.5'
                    value={formData.capacityKva}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Mounted On (Optional)</label>
                  <input
                    type='text'
                    name='mountedOn'
                    placeholder='e.g. Omni / Bolero / Trolley'
                    value={formData.mountedOn}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className='form-group'>
                <label>Manufacturer / Make (Optional)</label>
                <input
                  type='text'
                  name='make'
                  placeholder='e.g. Kirloskar / Cummins / Honda'
                  value={formData.make}
                  onChange={handleInputChange}
                />
              </div>

              <div className='form-group'>
                <label>Additional Notes / Remarks</label>
                <input
                  type='text'
                  name='notes'
                  placeholder='e.g. In-built fuel tank / Silent DG'
                  value={formData.notes}
                  onChange={handleInputChange}
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
                    'Add Generator'
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
