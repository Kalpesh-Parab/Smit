import PDFDocument from 'pdfkit';

export const createReportPdfBuffer = ({
  reportTitle,
  periodLabel,
  analyticsData,
  serviceName,
}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // --- Header ---
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

    doc
      .fillColor('#2563eb')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('EXECUTIVE REPORT', 380, 40, { align: 'right' });

    doc
      .fillColor('#475569')
      .fontSize(9)
      .font('Helvetica')
      .text(reportTitle.toUpperCase(), 380, 60, { align: 'right' })
      .text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 380, 74, {
        align: 'right',
      });

    // Divider Line
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(40, 98)
      .lineTo(555, 98)
      .stroke();

    // --- Time Period Banner ---
    doc.rect(40, 108, 515, 30).fillAndStroke('#f8fafc', '#cbd5e1');

    doc
      .fillColor('#0f172a')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('REPORT PERIOD:', 52, 118);

    doc
      .fillColor('#2563eb')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(periodLabel, 160, 118);

    // --- KPI Overview Grid ---
    let y = 152;
    const cardWidth = 165;
    const cardHeight = 52;

    const drawKpiCard = (x, yPos, label, value, color) => {
      doc
        .rect(x, yPos, cardWidth, cardHeight)
        .fillAndStroke('#ffffff', '#e2e8f0');

      doc
        .fillColor('#64748b')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(label.toUpperCase(), x + 12, yPos + 10);

      doc
        .fillColor(color)
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(
          `Rs. ${Number(value).toLocaleString('en-IN')}`,
          x + 12,
          yPos + 26,
        );
    };

    // Row 1
    drawKpiCard(
      40,
      y,
      'Total Collected',
      analyticsData.totalCollected,
      '#16a34a',
    );
    drawKpiCard(
      215,
      y,
      'Pending Receivables',
      analyticsData.totalPending,
      '#d97706',
    );
    drawKpiCard(
      390,
      y,
      'Fuel / Diesel Spent',
      analyticsData.fuelExpense,
      '#ea580c',
    );

    // Row 2
    y += 60;
    drawKpiCard(
      40,
      y,
      'Total Billed Amount',
      analyticsData.totalBilled,
      '#2563eb',
    );
    drawKpiCard(
      215,
      y,
      'Total Expenses',
      analyticsData.totalExpenses,
      '#dc2626',
    );
    const profitColor = analyticsData.netProfit >= 0 ? '#16a34a' : '#dc2626';
    drawKpiCard(
      390,
      y,
      'Net Operating Profit',
      analyticsData.netProfit,
      profitColor,
    );

    // --- Expenses by Category Table ---
    y += 76;
    doc
      .fillColor('#0f172a')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('EXPENSES BY CATEGORY', 40, y);

    y += 18;
    doc.rect(40, y, 515, 20).fill('#f1f5f9');

    doc
      .fillColor('#475569')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('CATEGORY', 50, y + 6)
      .text('EXPENDITURE (INR)', 430, y + 6, { align: 'right', width: 110 });

    y += 24;
    (analyticsData.categoryBreakdown || []).forEach((cat) => {
      doc
        .fillColor('#1e293b')
        .fontSize(9)
        .font('Helvetica')
        .text(cat.category, 50, y)
        .text(`Rs. ${Number(cat.amount).toLocaleString('en-IN')}`, 430, y, {
          align: 'right',
          width: 110,
        });

      doc
        .strokeColor('#f1f5f9')
        .lineWidth(0.5)
        .moveTo(40, y + 14)
        .lineTo(555, y + 14)
        .stroke();

      y += 20;
    });

    // --- Service Financial Split (Consolidated Dashboard Only) ---
    if (!serviceName && analyticsData.serviceBreakdown) {
      y += 16;
      doc
        .fillColor('#0f172a')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('SERVICE OPERATIONS BREAKDOWN', 40, y);

      y += 18;
      doc.rect(40, y, 515, 20).fill('#f1f5f9');

      doc
        .fillColor('#475569')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('SERVICE UNIT', 50, y + 6)
        .text('INVOICES', 220, y + 6)
        .text('BILLED (INR)', 330, y + 6)
        .text('EXPENSES (INR)', 445, y + 6, { align: 'right', width: 95 });

      y += 24;
      const services = [
        {
          label: 'Ambulance Service',
          data: analyticsData.serviceBreakdown.ambulance,
        },
        {
          label: 'Generators Service',
          data: analyticsData.serviceBreakdown.generators,
        },
        {
          label: 'Towing Vans Service',
          data: analyticsData.serviceBreakdown['towing-vans'],
        },
      ];

      services.forEach((s) => {
        doc
          .fillColor('#1e293b')
          .fontSize(9)
          .font('Helvetica')
          .text(s.label, 50, y)
          .text(String(s.data?.count || 0), 220, y)
          .text(`Rs. ${(s.data?.billed || 0).toLocaleString('en-IN')}`, 330, y)
          .text(
            `Rs. ${(s.data?.expenses || 0).toLocaleString('en-IN')}`,
            445,
            y,
            { align: 'right', width: 95 },
          );

        doc
          .strokeColor('#f1f5f9')
          .lineWidth(0.5)
          .moveTo(40, y + 14)
          .lineTo(555, y + 14)
          .stroke();

        y += 20;
      });
    }

    // --- Footer & KodeR Studio Branding ---
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .moveTo(40, 760)
      .lineTo(555, 760)
      .stroke();

    doc
      .fillColor('#94a3b8')
      .fontSize(7.5)
      .font('Helvetica')
      .text(
        'Generated via Smit Office Automation Engine • Crafted by KodeR Studio • www.koderstudio.com',
        40,
        768,
        { align: 'center', width: 515 },
      );

    doc.end();
  });
};
