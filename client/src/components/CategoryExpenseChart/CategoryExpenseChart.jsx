import React from 'react';
import './CategoryExpenseChart.scss';

export default function CategoryExpenseChart({
  data = [],
  title = 'Expenses by Category',
}) {
  // Find highest amount to calculate bar percentage relative to maximum
  const maxAmount = Math.max(...data.map((item) => item.amount), 1);

  return (
    <div className='category-chart-card'>
      <h3 className='chart-title'>{title}</h3>
      <div className='chart-list'>
        {data.map((item) => {
          const percentage =
            item.amount > 0 ? (item.amount / maxAmount) * 100 : 0;
          return (
            <div key={item.category} className='chart-item'>
              <div className='label-area'>
                <span className='category-label'>{item.category}</span>
              </div>
              <div className='track-area'>
                <div
                  className='bar-fill'
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                ></div>
              </div>
              <div className='amount-area'>
                <span className='amount-label'>
                  ₹ {item.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
