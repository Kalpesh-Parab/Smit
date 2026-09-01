import { useState } from 'react';
import { Calendar, Filter, CalendarDays } from 'lucide-react';
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
  const todayStr = new Date().toISOString().split('T')[0];

  // Default selection: This Month
  const [filterType, setFilterType] = useState('this-month');
  const [selectedDay, setSelectedDay] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [customRange, setCustomRange] = useState({
    startDate: todayStr,
    endDate: todayStr,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleTypeChange = (type) => {
    setFilterType(type);
    if (type === 'this-month') {
      onFilterChange({ filterType: 'this-month' });
    } else if (type === 'last-month') {
      onFilterChange({ filterType: 'last-month' });
    } else if (type === 'single-day') {
      onFilterChange({ filterType: 'single-day', singleDate: selectedDay });
    } else if (type === 'custom-month') {
      onFilterChange({
        filterType: 'custom-month',
        month: selectedMonth,
        year: selectedYear,
      });
    } else if (type === 'custom-range') {
      onFilterChange({
        filterType: 'custom-range',
        startDate: customRange.startDate,
        endDate: customRange.endDate,
      });
    } else if (type === 'all') {
      onFilterChange({ filterType: 'all' });
    }
  };

  const handleDayChange = (e) => {
    const val = e.target.value;
    setSelectedDay(val);
    onFilterChange({ filterType: 'single-day', singleDate: val });
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

  const handleRangeChange = (key, val) => {
    const updated = { ...customRange, [key]: val };
    setCustomRange(updated);
    if (updated.startDate && updated.endDate) {
      onFilterChange({
        filterType: 'custom-range',
        startDate: updated.startDate,
        endDate: updated.endDate,
      });
    }
  };

  return (
    <div className='date-filter-container'>
      <div className='filter-pill-group'>
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
          className={`filter-btn ${filterType === 'single-day' ? 'active' : ''}`}
          onClick={() => handleTypeChange('single-day')}
        >
          <Calendar size={13} />
          <span>Day</span>
        </button>
        <button
          className={`filter-btn ${filterType === 'custom-month' ? 'active' : ''}`}
          onClick={() => handleTypeChange('custom-month')}
        >
          <CalendarDays size={13} />
          <span>Month</span>
        </button>
        <button
          className={`filter-btn ${filterType === 'custom-range' ? 'active' : ''}`}
          onClick={() => handleTypeChange('custom-range')}
        >
          <Filter size={13} />
          <span>Range</span>
        </button>
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => handleTypeChange('all')}
        >
          All Time
        </button>
      </div>

      {/* Day-Wise Calendar Picker */}
      {filterType === 'single-day' && (
        <div className='custom-picker-wrap'>
          <input
            type='date'
            className='date-input'
            value={selectedDay}
            onChange={handleDayChange}
          />
        </div>
      )}

      {/* Custom Month Picker */}
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

      {/* Custom Date Range Picker */}
      {filterType === 'custom-range' && (
        <div className='custom-range-inputs'>
          <input
            type='date'
            className='date-input'
            value={customRange.startDate}
            onChange={(e) => handleRangeChange('startDate', e.target.value)}
          />
          <span className='range-to'>to</span>
          <input
            type='date'
            className='date-input'
            value={customRange.endDate}
            onChange={(e) => handleRangeChange('endDate', e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
