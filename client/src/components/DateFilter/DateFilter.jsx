import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import './DateFilter.scss';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function DateFilter({ onFilterChange }) {
  const currentYear = new Date().getFullYear();
  const [filterType, setFilterType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleTypeChange = (type) => {
    setFilterType(type);
    if (type === 'all') {
      onFilterChange({ filterType: 'all' });
    } else if (type === 'this-month') {
      onFilterChange({ filterType: 'this-month' });
    } else if (type === 'last-month') {
      onFilterChange({ filterType: 'last-month' });
    } else if (type === 'custom-month') {
      onFilterChange({
        filterType: 'custom-month',
        month: selectedMonth,
        year: selectedYear,
      });
    }
  };

  const handleMonthChange = (e) => {
    const m = parseInt(e.target.value, 10);
    setSelectedMonth(m);
    onFilterChange({
      filterType: 'custom-month',
      month: m,
      year: selectedYear,
    });
  };

  const handleYearChange = (e) => {
    const y = parseInt(e.target.value, 10);
    setSelectedYear(y);
    onFilterChange({
      filterType: 'custom-month',
      month: selectedMonth,
      year: y,
    });
  };

  return (
    <div className='date-filter-container'>
      <div className='filter-pill-group'>
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => handleTypeChange('all')}
        >
          All Time
        </button>
        <button
          className={`filter-btn ${filterType === 'this-month' ? 'active' : ''}`}
          onClick={() => handleTypeChange('this-month')}
        >
          This Month
        </button>
        <button
          className={`filter-btn ${filterType === 'last-month' ? 'active' : ''}`}
          onClick={() => handleTypeChange('last-month')}
        >
          Last Month
        </button>
        <button
          className={`filter-btn ${filterType === 'custom-month' ? 'active' : ''}`}
          onClick={() => handleTypeChange('custom-month')}
        >
          <Calendar size={14} />
          <span>Select Month</span>
        </button>
      </div>

      {filterType === 'custom-month' && (
        <div className='custom-dropdowns'>
          <select value={selectedMonth} onChange={handleMonthChange}>
            {MONTHS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>

          <select value={selectedYear} onChange={handleYearChange}>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
