import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportReportExcel = (report) => {
  // ---------- Summary ----------
  const summary = [
    {
      Metric: "Total Assets",
      Value: report.totalAssets,
    },
    {
      Metric: "Available Assets",
      Value: report.availableAssets,
    },
    {
      Metric: "Allocated Assets",
      Value: report.allocatedAssets,
    },
    {
      Metric: "Maintenance Requests",
      Value: report.maintenanceAssets,
    },
    {
      Metric: "Bookings",
      Value: report.bookings,
    },
  ];

  // ---------- Category ----------
  const category = report.categoryWise.map((item) => ({
    Category: item.category_name,
    Assets: item.total,
  }));

  // ---------- Department ----------
  const department = report.departmentWise.map((item) => ({
    Department: item.department_name,
    Allocated: item.total_allocations,
  }));

  // ---------- Retirement ----------
  const retirement = report.nearingRetirement.map((item) => ({
    Tag: item.asset_tag,
    Asset: item.asset_name,
    Purchase: new Date(item.purchase_date).toLocaleDateString(),
    Age: item.age_years,
  }));

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(summary),
    "Summary"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(category),
    "Category"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(department),
    "Departments"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(retirement),
    "Retirement"
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(file, "AssetFlow_Report.xlsx");
};