import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Fuel,
  Loader2,
  Share2,
} from 'lucide-react';
import { getItems } from '../../services/api';
import DateFilter from '../../components/DateFilter/DateFilter';
import CategoryExpenseChart from '../../components/CategoryExpenseChart/CategoryExpenseChart';
import SendReportModal from '../../components/SendReportModal/SendReportModal';
import './ServiceAnalytics.scss';

export default function ServiceAnalytics({
  serviceName = 'ambulance',
  title = 'Analytics',
}) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({
    filterType: 'this-month',
  });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const getPeriodLabel = () => {
    if (filterParams.filterType === 'this-month') return 'This Month';
    if (filterParams.filterType === 'last-month') return 'Last Month';
    if (filterParams.filterType === 'single-day')
      return `Day: ${filterParams.singleDate}`;
    if (filterParams.filterType === 'custom-range')
      return `${filterParams.startDate} to ${filterParams.endDate}`;
    if (filterParams.filterType === 'custom-month')
      return `Month: ${Number(filterParams.month) + 1}/${filterParams.year}`;
    return 'All Time';
  };

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        service: serviceName,
        ...filterParams,
      }).toString();
      const res = await getItems(`analytics?${query}`);
      if (res.success) {
        setMetrics(res.data);
      }
    } catch {
      toast.error('Failed to load service metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [serviceName, filterParams]);

  return (
    <div className='service-analytics-page'>
      <div className='analytics-header-row'>
        <div className='title-area'>
          <h2 className='section-title'>{title}</h2>
          <p className='section-subtitle'>
            Financial performance & expense analytics for{' '}
            {serviceName.replace('-', ' ')}.
          </p>
        </div>
        <div className='actions-cluster'>
          <DateFilter onFilterChange={(params) => setFilterParams(params)} />
          <button
            className='send-report-action-btn'
            onClick={() => setIsReportModalOpen(true)}
            title='Send WhatsApp Snapshot Report'
          >
            <Share2 size={15} />
            <span>Send Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className='analytics-loading'>
          <Loader2 size={36} className='spinner' />
          <p>Loading {title}...</p>
        </div>
      ) : !metrics ? null : (
        <>
          <div className='metrics-grid'>
            <div className='metric-card'>
              <div className='icon-wrap income'>
                <TrendingUp size={22} />
              </div>
              <span>Total Billed</span>
              <h3>₹{metrics.totalBilled.toLocaleString('en-IN')}</h3>
              <small>{metrics.invoiceCount} Invoices generated</small>
            </div>

            <div className='metric-card'>
              <div className='icon-wrap collected'>
                <DollarSign size={22} />
              </div>
              <span>Collected Cash</span>
              <h3 className='text-success'>
                ₹{metrics.totalCollected.toLocaleString('en-IN')}
              </h3>
              <small>Received payments</small>
            </div>

            <div className='metric-card'>
              <div className='icon-wrap pending'>
                <Clock size={22} />
              </div>
              <span>Pending Dues</span>
              <h3 className='text-warning'>
                ₹{metrics.totalPending.toLocaleString('en-IN')}
              </h3>
              <small>Outstanding balance</small>
            </div>

            <div className='metric-card'>
              <div className='icon-wrap fuel'>
                <Fuel size={22} />
              </div>
              <span>Fuel / Diesel</span>
              <h3 className='text-orange'>
                ₹{metrics.fuelExpense.toLocaleString('en-IN')}
              </h3>
              <small>Fuel operational costs</small>
            </div>

            <div className='metric-card'>
              <div className='icon-wrap expense'>
                <TrendingDown size={22} />
              </div>
              <span>Total Expenses</span>
              <h3 className='text-danger'>
                ₹{metrics.totalExpenses.toLocaleString('en-IN')}
              </h3>
              <small>{metrics.expenseCount} Expense logs</small>
            </div>
          </div>

          <div className='net-profit-card'>
            <div className='profit-text'>
              <span>
                Net Service Operating Profit (Collected - Total Expenses)
              </span>
              <h2
                className={
                  metrics.netProfit >= 0 ? 'text-success' : 'text-danger'
                }
              >
                ₹{metrics.netProfit.toLocaleString('en-IN')}
              </h2>
            </div>
          </div>

          <CategoryExpenseChart
            data={metrics.categoryBreakdown}
            title={`${serviceName.replace('-', ' ').toUpperCase()} Expenses by Category`}
          />

          <SendReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            serviceName={serviceName}
            filterParams={filterParams}
            periodLabel={getPeriodLabel()}
          />
        </>
      )}
    </div>
  );
}
