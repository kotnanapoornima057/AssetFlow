import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportReportPDF = (report) => {
  const doc = new jsPDF();

  // -----------------------
  // Header
  // -----------------------

  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text("AssetFlow", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);

  doc.text(
    "Enterprise Asset Management System",
    14,
    28
  );

  doc.setFontSize(10);

  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    14,
    35
  );

  // -----------------------
  // Summary
  // -----------------------

  doc.setFontSize(16);
  doc.setTextColor(0);

  doc.text("Dashboard Summary", 14, 50);

  autoTable(doc, {
    startY: 55,

    head: [["Metric", "Value"]],

    body: [
      ["Total Assets", report.totalAssets],
      ["Available Assets", report.availableAssets],
      ["Allocated Assets", report.allocatedAssets],
      ["Maintenance Requests", report.maintenanceAssets],
      ["Bookings", report.bookings],
    ],
  });

  // -----------------------
  // Category Table
  // -----------------------

  doc.text(
    "Assets by Category",
    14,
    doc.lastAutoTable.finalY + 15
  );

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,

    head: [["Category", "Assets"]],

    body: report.categoryWise.map((item) => [
      item.category_name,
      item.total,
    ]),
  });

  // -----------------------
  // Department Table
  // -----------------------

  doc.text(
    "Department Allocation",
    14,
    doc.lastAutoTable.finalY + 15
  );

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,

    head: [["Department", "Allocated"]],

    body: report.departmentWise.map((item) => [
      item.department_name,
      item.total_allocations,
    ]),
  });

  doc.save("AssetFlow_Report.pdf");
};