import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';

export interface CustomerData {
  name: string;
  cedula: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  company: string;
  shipping_company: string;
  notes: string;
}

export function generateInvoicePDF(
  items: CartItem[],
  customer: CustomerData,
  orderNumber: string,
  subtotal: number,
  shipping: number,
  total: number
): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(224, 101, 15);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCESORIOS HANNA', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Tienda de Relojes y Accesorios', 14, 26);
  doc.text('NIT: 000000000-0  |  info@accesorioshanna.com', 14, 32);

  doc.setFontSize(11);
  doc.text(`Factura #${orderNumber}`, 150, 18);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 150, 26);
  doc.text(`Hora: ${new Date().toLocaleTimeString('es-CO')}`, 150, 32);

  // Customer info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', 14, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const customerLines = [
    `Nombre: ${customer.name}`,
    `Cedula/RIF: ${customer.cedula}`,
    `Email: ${customer.email}`,
    `Telefono: ${customer.phone}`,
    `Direccion: ${customer.address}`,
    `Ciudad: ${customer.city} - ${customer.department}`,
  ];
  if (customer.company) customerLines.push(`Empresa: ${customer.company}`);
  if (customer.shipping_company) customerLines.push(`Envio: ${customer.shipping_company}`);

  let y = 60;
  customerLines.forEach(line => {
    doc.text(line, 14, y);
    y += 6;
  });

  // Table
  const tableData = items.map(item => [
    item.product.name,
    item.product.sku || '-',
    String(item.quantity),
    formatPrice(item.product.price),
    formatPrice(item.product.price * item.quantity),
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [['Producto', 'SKU', 'Cant.', 'Precio', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [224, 101, 15], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 25 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || y + 20;

  // Totals
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 120, finalY + 10);
  doc.text(formatPrice(subtotal), 165, finalY + 10, { align: 'right' });

  doc.text('Envio:', 120, finalY + 16);
  doc.text(shipping === 0 ? 'Gratis' : formatPrice(shipping), 165, finalY + 16, { align: 'right' });

  doc.setDrawColor(224, 101, 15);
  doc.line(120, finalY + 20, 196, finalY + 20);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 120, finalY + 28);
  doc.text(formatPrice(total), 165, finalY + 28, { align: 'right' });

  // Notes
  if (customer.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Notas:', 14, finalY + 40);
    doc.text(customer.notes, 14, finalY + 46);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Gracias por su compra en Accesorios Hanna', 105, 280, { align: 'center' });
  doc.text('www.accesorioshanna.com  |  info@accesorioshanna.com  |  +57 300 000 0000', 105, 285, { align: 'center' });

  return doc;
}

export function downloadPDF(doc: jsPDF, orderNumber: string) {
  doc.save(`Factura-${orderNumber}.pdf`);
}

export function getPDFBase64(doc: jsPDF): string {
  return doc.output('datauristring').split(',')[1];
}

export function generateWhatsAppMessage(
  items: CartItem[],
  customer: CustomerData,
  orderNumber: string,
  total: number
): string {
  let msg = `*NUEVO PEDIDO - Accesorios Hanna*\n`;
  msg += `Factura: #${orderNumber}\n`;
  msg += `Fecha: ${new Date().toLocaleDateString('es-CO')}\n\n`;
  msg += `*DATOS DEL CLIENTE*\n`;
  msg += `Nombre: ${customer.name}\n`;
  msg += `Cedula: ${customer.cedula}\n`;
  msg += `Email: ${customer.email}\n`;
  msg += `Telefono: ${customer.phone}\n`;
  msg += `Direccion: ${customer.address}, ${customer.city}\n`;
  if (customer.company) msg += `Empresa: ${customer.company}\n`;
  if (customer.shipping_company) msg += `Envio: ${customer.shipping_company}\n`;
  msg += `\n*PRODUCTOS*\n`;
  items.forEach(item => {
    msg += `- ${item.product.name} x${item.quantity} = ${formatPrice(item.product.price * item.quantity)}\n`;
  });
  msg += `\n*TOTAL: ${formatPrice(total)}*\n`;
  if (customer.notes) msg += `\nNotas: ${customer.notes}\n`;
  return msg;
}

export function generateWhatsAppURL(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/573000000000?text=${encoded}`;
}
