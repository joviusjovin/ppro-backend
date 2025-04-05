import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { registerTimesNewRoman } from '../admin/utils/fontLoader';
import { BikeRider } from '../types';

export const exportRidersToPDF = async (
  riders: BikeRider[], 
  fileName: string = 'bike-riders-report.pdf'
) => {
  // Get admin info from local storage
  const adminFullName = localStorage.getItem('adminFullName') || 'Unknown User';
  const adminPosition = localStorage.getItem('adminPosition') || 'Unknown Position';

  // Create landscape PDF
  const doc = new jsPDF({
    orientation: 'l',
    unit: 'pt',
    format: 'a4'
  });

  // Register Times New Roman font
  await registerTimesNewRoman(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  const margin = 40;

  // Add logo on left side
  const logoUrl = 'https://i.ibb.co/W4d75rND/logo-ppro-01-H-CEl6-OB.png';
  doc.addImage(logoUrl, 'PNG', margin, 20, 80, 60);

  // Set Times New Roman as default font
  doc.setFont('TimesNewRoman');

  // Add header text (right of logo)
  doc.setFontSize(18);
  doc.setFont('TimesNewRoman', 'bold');
  doc.text("PARTNERSHIP FOR POVERTY REDUCTION ORGANISATION", margin + 100, 50);
  
  // Centered subtitle
  doc.setFontSize(14);
  doc.setFont('TimesNewRoman', 'normal');
  doc.text("Bike rider report", centerX, 80, { align: 'center' });

  // Prepare table data
  const tableColumns = [
    { header: "S/N", dataKey: "sn" },
    { header: "Full name", dataKey: "name" },
    { header: "Gender", dataKey: "gender" },
    { header: "Phone", dataKey: "phone" },
    { header: "Bike No.", dataKey: "bikeNo" },
    { header: "License", dataKey: "license" },
    { header: "Region", dataKey: "region" },
    { header: "Created", dataKey: "created" }
  ];

  const tableData = riders.map((rider, index) => ({
    sn: (index + 1).toString(),
    name: `${rider.firstName} ${rider.middleName || ''} ${rider.surname}`.trim(),
    gender: rider.gender,
    phone: rider.phoneNumber,
    bikeNo: rider.bikeNumber,
    license: rider.license,
    region: rider.region,
    created: new Date(rider.createdAt).toLocaleDateString('en-GB') // DD/MM/YYYY format
  }));

  // Define column styles with left alignment for both header and body
  const columnStyles = {
    sn: { cellWidth: 40, halign: 'left' as const, headHalign: 'left' as const },
    name: { cellWidth: 'auto' as const, halign: 'left' as const, headHalign: 'left' as const },
    gender: { cellWidth: 50, halign: 'left' as const, headHalign: 'left' as const },
    phone: { cellWidth: 90, halign: 'left' as const, headHalign: 'left' as const },
    bikeNo: { cellWidth: 80, halign: 'left' as const, headHalign: 'left' as const },
    license: { cellWidth: 90, halign: 'left' as const, headHalign: 'left' as const },
    region: { cellWidth: 'auto' as const, halign: 'left' as const, headHalign: 'left' as const },
    created: { cellWidth: 80, halign: 'left' as const, headHalign: 'left' as const }
  };

  // Add table with alternating row colors (no grid lines)
  autoTable(doc, {
    columns: tableColumns,
    body: tableData,
    startY: 100,
    margin: { horizontal: margin },
    styles: { 
      font: 'TimesNewRoman',
      fontSize: 10,
      cellPadding: 6,
      overflow: 'linebreak',
      valign: 'middle',
      lineWidth: 0, // No border lines
      textColor: [0, 0, 0]
    },
    headStyles: {
      font: 'TimesNewRoman',
      fontStyle: 'bold',
      fillColor: [70, 130, 180], // Steel blue header
      textColor: [255, 255, 255], // White text
      lineWidth: 0 // No border lines
    },
    bodyStyles: {
      font: 'TimesNewRoman',
      lineWidth: 0 // No border lines
    },
    alternateRowStyles: {
      font: 'TimesNewRoman',
      fillColor: [240, 240, 240] // Light gray for alternate rows
    },
    columnStyles: columnStyles,
    theme: 'plain', // No grid lines
    didParseCell: (data) => {
      if (data.cell.raw) {
        data.cell.text = [data.cell.raw.toString()];
      }
    }
  });

  // Add footer with admin info from local storage
  const pageHeight = doc.internal.pageSize.height;
  doc.setFont('TimesNewRoman');
  doc.setFontSize(10);
  
  const exportDate = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const footerText = `Exported by: ${adminFullName} (${adminPosition}) | ${exportDate}`;
  
  doc.text(
    footerText,
    centerX, 
    pageHeight - 20, 
    { align: 'center' }
  );

  // Save the PDF
  doc.save(fileName);
};