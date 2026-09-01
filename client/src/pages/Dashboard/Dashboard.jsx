import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Fuel,
  Truck,
  Zap,
  Wrench,
  Loader2,
} from 'lucide-react';
import { getItems } from '../../services/api';
import DateFilter from '../../components/DateFilter/DateFilter';
import CategoryExpenseChart from '../../components/CategoryExpenseChart/CategoryExpenseChart';
import './Dashboard.scss';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({ filterType: 'all' });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams(filterParams).toString();
      const res = await getItems(`analytics?${query}`);
      if (res.success) {
        setData(res.data);
      }
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filterParams]);

  return (
    <div className='home-dashboard'>
      <div className='dashboard-header-row'>
        <div className='title-area'>
          <h2>Operations & Financial Overview</h2>
          <p>Real-time consolidated analytics across all active services.</p>
        </div>
        <DateFilter onFilterChange={(params) => setFilterParams(params)} />
      </div>

      {loading ? (
        <div className='analytics-loading'>
          <Loader2 size={36} className='spinner' />
          <p>Calculating business analytics...</p>
        </div>
      ) : !data ? null : (
        <>
          {/* 5-Column KPI Cards */}
          <div className='kpi-grid'>
            <div className='kpi-card income'>
              <div className='kpi-icon'>
                <TrendingUp size={22} />
              </div>
              <div className='kpi-details'>
                <span>Total Collected</span>
                <h3>₹{data.totalCollected.toLocaleString('en-IN')}</h3>
                <small>
                  Billed: ₹{data.totalBilled.toLocaleString('en-IN')}
                </small>
              </div>
            </div>

            <div className='kpi-card pending'>
              <div className='kpi-icon'>
                <Clock size={22} />
              </div>
              <div className='kpi-details'>
                <span>Pending Receivables</span>
                <h3 className='text-warning'>
                  ₹{data.totalPending.toLocaleString('en-IN')}
                </h3>
                <small>Outstanding balance</small>
              </div>
            </div>

            <div className='kpi-card fuel'>
              <div className='kpi-icon'>
                <Fuel size={22} />
              </div>
              <div className='kpi-details'>
                <span>Fuel Expenses</span>
                <h3 className='text-orange'>
                  ₹{data.fuelExpense.toLocaleString('en-IN')}
                </h3>
                <small>Diesel & refuel logs</small>
              </div>
            </div>

            <div className='kpi-card expense'>
              <div className='kpi-icon'>
                <TrendingDown size={22} />
              </div>
              <div className='kpi-details'>
                <span>Total Expenses</span>
                <h3 className='text-danger'>
                  ₹{data.totalExpenses.toLocaleString('en-IN')}
                </h3>
                <small>All categories</small>
              </div>
            </div>

            <div className='kpi-card profit'>
              <div className='kpi-icon'>
                <DollarSign size={22} />
              </div>
              <div className='kpi-details'>
                <span>Net Profit</span>
                <h3
                  className={
                    data.netProfit >= 0 ? 'text-success' : 'text-danger'
                  }
                >
                  ₹{data.netProfit.toLocaleString('en-IN')}
                </h3>
                <small>Collected minus expenses</small>
              </div>
            </div>
          </div>

          {/* Category Bar Chart */}
          <CategoryExpenseChart
            data={data.categoryBreakdown}
            title='Consolidated Expenses by Category'
          />

          {/* Service Breakdown & Fleet Overview */}
          <div className='insights-grid'>
            <div className='insight-card'>
              <h3>Service Financial Split</h3>
              <div className='service-breakdown-list'>
                <div className='service-row'>
                  <div className='svc-meta'>
                    <Truck size={18} />
                    <strong>Ambulance</strong>
                  </div>
                  <div className='svc-stats'>
                    <span>
                      ₹
                      {data.serviceBreakdown.ambulance.billed.toLocaleString(
                        'en-IN',
                      )}{' '}
                      Billed
                    </span>
                    <span className='exp'>
                      ₹
                      {data.serviceBreakdown.ambulance.expenses.toLocaleString(
                        'en-IN',
                      )}{' '}
                      Exp
                    </span>
                  </div>
                </div>

                <div className='service-row'>
                  <div className='svc-meta'>
                    <Zap size={18} />
                    <strong>Generators</strong>
                  </div>
                  <div className='svc-stats'>
                    <span>
                      ₹
                      {data.serviceBreakdown.generators.billed.toLocaleString(
                        'en-IN',
                      )}{' '}
                      Billed
                    </span>
                    <span className='exp'>
                      ₹
                      {data.serviceBreakdown.generators.expenses.toLocaleString(
                        'en-IN',
                      )}{' '}
                      Exp
                    </span>
                  </div>
                </div>

                <div className='service-row'>
                  <div className='svc-meta'>
                    <Wrench size={18} />
                    <strong>Towing Vans</strong>
                  </div>
                  <div className='svc-stats'>
                    <span>
                      ₹
                      {data.serviceBreakdown[
                        'towing-vans'
                      ].billed.toLocaleString('en-IN')}{' '}
                      Billed
                    </span>
                    <span className='exp'>
                      ₹
                      {data.serviceBreakdown[
                        'towing-vans'
                      ].expenses.toLocaleString('en-IN')}{' '}
                      Exp
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='insight-card'>
              <h3>Fleet & Machine Registry</h3>
              <div className='fleet-stats-grid'>
                <div className='fleet-stat-box'>
                  <Truck size={24} />
                  <h4>{data.fleetSummary.ambulances}</h4>
                  <p>Ambulances</p>
                </div>
                <div className='fleet-stat-box'>
                  <Zap size={24} />
                  <h4>{data.fleetSummary.generators}</h4>
                  <p>Generators</p>
                </div>
                <div className='fleet-stat-box'>
                  <Wrench size={24} />
                  <h4>{data.fleetSummary.towingVans}</h4>
                  <p>Towing Trucks</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
