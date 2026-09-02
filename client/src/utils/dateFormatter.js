const MONTH_NAMES = [
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

/**
 * Returns a formal, professional date label based on the active filter
 * Examples:
 * - "September 2026" (instead of "This Month")
 * - "August 2026" (instead of "Last Month")
 * - "02 September 2026" (instead of "Day: 2026-09-02")
 * - "01 Aug 2026 to 15 Aug 2026" (for ranges)
 */
export const formatPeriodLabel = (filterParams = {}) => {
  const now = new Date();

  switch (filterParams.filterType) {
    case 'this-month': {
      return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    }

    case 'last-month': {
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${MONTH_NAMES[prevDate.getMonth()]} ${prevDate.getFullYear()}`;
    }

    case 'custom-month': {
      const monthIdx = parseInt(filterParams.month, 10);
      const yearVal = filterParams.year || now.getFullYear();
      if (!isNaN(monthIdx) && monthIdx >= 0 && monthIdx <= 11) {
        return `${MONTH_NAMES[monthIdx]} ${yearVal}`;
      }
      return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    }

    case 'single-day': {
      if (!filterParams.singleDate) return 'Today';
      const dateObj = new Date(filterParams.singleDate);
      if (isNaN(dateObj.getTime())) return filterParams.singleDate;
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${day} ${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }

    case 'custom-range': {
      if (!filterParams.startDate || !filterParams.endDate)
        return 'Custom Date Range';
      const start = new Date(filterParams.startDate);
      const end = new Date(filterParams.endDate);
      const formatPart = (d) => {
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const monthShort = MONTH_NAMES[d.getMonth()].slice(0, 3);
        return `${day} ${monthShort} ${d.getFullYear()}`;
      };
      return `${formatPart(start)} to ${formatPart(end)}`;
    }

    case 'all': {
      return 'All Time Consolidated';
    }

    default: {
      return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    }
  }
};
