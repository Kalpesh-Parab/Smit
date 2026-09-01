import React, { forwardRef } from 'react';
import './InvoicePDF.scss';

const InvoicePDF = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const serviceDetails =
    invoice.serviceDetails instanceof Map
      ? Object.fromEntries(invoice.serviceDetails)
      : invoice.serviceDetails || {};

  return (
    <div className='pdf-print-wrapper'>
      <div className='invoice-document' ref={ref}>
        {/* Header */}
        <header className='doc-header'>
          <div className='company-meta'>
            <h1 className='brand-title'>SMIT OFFICE</h1>
            <p className='sub-tag'>
              Emergency, Power & Transport Logistics Services
            </p>
            <p className='contact-info'>
              Phone: +91 98765 43210 | Email: info@smitoffice.com
            </p>
          </div>
          <div className='invoice-badge'>
            <h2>INVOICE</h2>
            <span className='inv-no'>{invoice.invoiceNumber}</span>
          </div>
        </header>

        <hr className='divider' />

        {/* Bill To & Meta Info */}
        <div className='doc-meta-grid'>
          <div className='meta-block'>
            <span className='label'>BILLED TO:</span>
            <strong className='party-name'>{invoice.partyName}</strong>
            <span className='phone'>Phone: {invoice.partyPhone}</span>
          </div>

          <div className='meta-block right'>
            <div>
              <span className='label'>DATE:</span>
              <strong>
                {new Date(invoice.date).toLocaleDateString('en-GB')}
              </strong>
            </div>
            <div>
              <span className='label'>SERVICE CATEGORY:</span>
              <strong>{invoice.service?.toUpperCase()}</strong>
            </div>
            <div>
              <span className='label'>PAYMENT STATUS:</span>
              <span className={`status-tag ${invoice.paymentStatus}`}>
                {invoice.paymentStatus?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Service Breakdown Table */}
        <table className='doc-table'>
          <thead>
            <tr>
              <th>Description / Specification</th>
              <th>Details</th>
              <th className='text-right'>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.service === 'ambulance' && (
              <>
                <tr>
                  <td>Ambulance Vehicle Unit</td>
                  <td>
                    {serviceDetails.vehicleNo || 'Emergency Dispatch Unit'}
                  </td>
                  <td className='text-right'>Included</td>
                </tr>
                {serviceDetails.location && (
                  <tr>
                    <td>Route / Destination</td>
                    <td>{serviceDetails.location}</td>
                    <td className='text-right'>—</td>
                  </tr>
                )}
                {serviceDetails.rent && (
                  <tr>
                    <td>Base Ambulance Rent</td>
                    <td>Base Service Charge</td>
                    <td className='text-right'>₹{serviceDetails.rent}</td>
                  </tr>
                )}
              </>
            )}

            {invoice.service === 'generators' && (
              <>
                <tr>
                  <td>Generator Set Deployment</td>
                  <td>{serviceDetails.generatorDetails || 'Generator Unit'}</td>
                  <td className='text-right'>Included</td>
                </tr>
                {serviceDetails.duration && (
                  <tr>
                    <td>Operational Duration</td>
                    <td>{serviceDetails.duration}</td>
                    <td className='text-right'>—</td>
                  </tr>
                )}
                {serviceDetails.ratePerUnit && (
                  <tr>
                    <td>Rate per Hour/Day</td>
                    <td>Unit Rate</td>
                    <td className='text-right'>
                      ₹{serviceDetails.ratePerUnit}
                    </td>
                  </tr>
                )}
              </>
            )}

            {invoice.service === 'towing-vans' && (
              <>
                <tr>
                  <td>Towing Truck Unit</td>
                  <td>{serviceDetails.vehicleNo || 'Tow Van'}</td>
                  <td className='text-right'>Included</td>
                </tr>
                {serviceDetails.location && (
                  <tr>
                    <td>Pickup & Tow Location</td>
                    <td>{serviceDetails.location}</td>
                    <td className='text-right'>—</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>

        {/* Totals & Remarks */}
        <div className='doc-bottom-grid'>
          <div className='notes-block'>
            <span className='label'>REMARKS / NOTES:</span>
            <p>
              {invoice.notes || 'Thank you for choosing Smit Office Services.'}
            </p>
          </div>

          <div className='totals-block'>
            <div className='total-row'>
              <span>Total Bill Amount:</span>
              <strong>₹{invoice.totalBill}</strong>
            </div>
            <div className='total-row'>
              <span>Paid Amount:</span>
              <strong className='text-success'>₹{invoice.paidAmount}</strong>
            </div>
            <div className='total-row grand'>
              <span>Remaining Balance:</span>
              <strong
                className={invoice.remainingAmount > 0 ? 'text-danger' : ''}
              >
                ₹{invoice.remainingAmount}
              </strong>
            </div>
          </div>
        </div>

        {/* Promotional Cross-Service Showcase */}
        <div className='promo-services-banner'>
          <span className='promo-title'>
            OUR 24/7 FLEET & LOGISTICS SERVICES
          </span>
          <div className='promo-grid'>
            <div className='promo-item'>
              <strong>🚑 Emergency Ambulances:</strong> ICU, Cardiac & Basic
              Life Support units.
            </div>
            <div className='promo-item'>
              <strong>⚡ Power Generators:</strong> 3.5 kVA to 125+ kVA Silent &
              Mobile DG Sets.
            </div>
            <div className='promo-item'>
              <strong>🚚 Towing & Recovery:</strong> 24/7 Roadside assistance &
              Hydraulic flatbed trucks.
            </div>
          </div>
        </div>

        {/* Footer Signature & Branding */}
        <footer className='doc-footer'>
          <div className='koder-credit'>
            Crafted by <strong>KodeR Studio</strong>
          </div>
          <div className='sig-area'>
            <div className='sig-line'></div>
            <span>Authorized Signatory</span>
          </div>
        </footer>
      </div>
    </div>
  );
});

InvoicePDF.displayName = 'InvoicePDF';
export default InvoicePDF;
