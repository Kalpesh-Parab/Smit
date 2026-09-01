import PDFDocument from 'pdfkit';

export const createInvoicePdfBuffer = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const serviceDetails =
      invoice.serviceDetails instanceof Map
        ? Object.fromEntries(invoice.serviceDetails)
        : invoice.serviceDetails || {};

    // Header
    doc
      .fillColor('#0f172a')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SMIT OFFICE', 40, 40);

    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text('Emergency, Power & Transport Logistics Services', 40, 68)
      .text('Phone: +91 98765 43210  |  Email: info@smitoffice.com', 40, 80);

    // Invoice Badge
    doc
      .fillColor('#2563eb')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('INVOICE', 400, 40, { align: 'right' });

    doc
      .fillColor('#475569')
      .fontSize(10)
      .font('Helvetica')
      .text(`#${invoice.invoiceNumber}`, 400, 65, { align: 'right' })
      .text(
        `Date: ${new Date(invoice.date).toLocaleDateString('en-GB')}`,
        400,
        78,
        { align: 'right' },
      );

    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(40, 105)
      .lineTo(555, 105)
      .stroke();

    // Billed To & Status
    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('BILLED TO:', 40, 120);

    doc
      .fillColor('#0f172a')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(invoice.partyName || 'Customer', 40, 133);

    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text(`Phone: ${invoice.partyPhone || '—'}`, 40, 148)
      .text(`Service: ${(invoice.service || '').toUpperCase()}`, 40, 160);

    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('PAYMENT STATUS:', 400, 120, { align: 'right' });

    const statusColor =
      invoice.paymentStatus === 'paid'
        ? '#16a34a'
        : invoice.paymentStatus === 'partial'
          ? '#d97706'
          : '#dc2626';

    doc
      .fillColor(statusColor)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text((invoice.paymentStatus || 'UNPAID').toUpperCase(), 400, 133, {
        align: 'right',
      });

    // Table Header
    const tableTop = 195;
    doc.rect(40, tableTop, 515, 24).fill('#f8fafc');

    doc
      .fillColor('#475569')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DESCRIPTION / SPECIFICATION', 50, tableTop + 7)
      .text('DETAILS', 260, tableTop + 7)
      .text('AMOUNT (INR)', 460, tableTop + 7, { align: 'right', width: 85 });

    let y = tableTop + 32;

    const addRow = (desc, detail, amount) => {
      doc
        .fillColor('#1e293b')
        .fontSize(9)
        .font('Helvetica')
        .text(desc, 50, y)
        .text(detail || '—', 260, y)
        .text(amount, 460, y, { align: 'right', width: 85 });

      doc
        .strokeColor('#f1f5f9')
        .lineWidth(0.5)
        .moveTo(40, y + 16)
        .lineTo(555, y + 16)
        .stroke();

      y += 24;
    };

    if (invoice.service === 'ambulance') {
      addRow(
        'Ambulance Vehicle Unit',
        serviceDetails.vehicleNo || 'Emergency Dispatch Unit',
        'Included',
      );
      if (serviceDetails.location)
        addRow('Route / Destination', serviceDetails.location, '—');
      if (serviceDetails.rent)
        addRow(
          'Base Ambulance Rent',
          'Base Charge',
          `Rs. ${serviceDetails.rent}`,
        );
    } else if (invoice.service === 'generators') {
      addRow(
        'Generator Set Deployment',
        serviceDetails.generatorDetails || 'Generator Unit',
        'Included',
      );
      if (serviceDetails.duration)
        addRow('Operational Duration', serviceDetails.duration, '—');
      if (serviceDetails.ratePerUnit)
        addRow(
          'Rate per Hour/Day',
          'Unit Rate',
          `Rs. ${serviceDetails.ratePerUnit}`,
        );
    } else if (invoice.service === 'towing-vans') {
      addRow(
        'Towing Truck Unit',
        serviceDetails.vehicleNo || 'Tow Van',
        'Included',
      );
      if (serviceDetails.location)
        addRow('Pickup & Tow Location', serviceDetails.location, '—');
    } else {
      addRow('Service Operations', 'Standard Delivery', 'Included');
    }

    y = Math.max(y + 15, 305);

    // Remarks
    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('REMARKS / NOTES:', 40, y);

    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text(
        invoice.notes || 'Thank you for choosing Smit Office Services.',
        40,
        y + 12,
        { width: 250 },
      );

    // Summary Box
    const rightCol = 360;
    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text('Total Bill Amount:', rightCol, y)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(`Rs. ${invoice.totalBill}`, 460, y, { align: 'right', width: 85 });

    doc
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Paid Amount:', rightCol, y + 18)
      .font('Helvetica-Bold')
      .fillColor('#16a34a')
      .text(`Rs. ${invoice.paidAmount}`, 460, y + 18, {
        align: 'right',
        width: 85,
      });

    doc
      .strokeColor('#0f172a')
      .lineWidth(1)
      .moveTo(rightCol, y + 36)
      .lineTo(555, y + 36)
      .stroke();

    const balanceColor = invoice.remainingAmount > 0 ? '#dc2626' : '#0f172a';
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(balanceColor)
      .text('Remaining Balance:', rightCol, y + 44)
      .text(`Rs. ${invoice.remainingAmount}`, 460, y + 44, {
        align: 'right',
        width: 85,
      });

    // Promotional Note & Services Box
    const promoY = 410;
    doc.rect(40, promoY, 515, 62).fillAndStroke('#f8fafc', '#e2e8f0');

    doc
      .fillColor('#2563eb')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('OUR 24/7 FLEET & LOGISTICS SOLUTIONS:', 50, promoY + 8);

    doc
      .fillColor('#475569')
      .fontSize(7.5)
      .font('Helvetica')
      .text(
        '• 24/7 ICU & Critical Care Ambulances with trained medical support.',
        50,
        promoY + 22,
      )
      .text(
        '• Heavy-duty Diesel Generators (Silent DG Sets from 3.5 kVA to 125+ kVA).',
        50,
        promoY + 34,
      )
      .text(
        '• Quick Response Towing Vans & Flatbed Recovery Trucks for all vehicle classes.',
        50,
        promoY + 46,
      );

    // Signatory
    doc
      .strokeColor('#94a3b8')
      .lineWidth(0.5)
      .moveTo(420, 520)
      .lineTo(540, 520)
      .stroke();

    doc
      .fillColor('#64748b')
      .fontSize(8)
      .font('Helvetica')
      .text('Authorized Signatory', 420, 525, { align: 'center', width: 120 });

    // Minimal KodeR Studio Branding Footer
    doc
      .fillColor('#94a3b8')
      .fontSize(7)
      .font('Helvetica')
      .text('System Crafted by KodeR Studio • instagram.com/koder_studio/', 40, 780, {
        align: 'center',
        width: 515,
      });

    doc.end();
  });
};
