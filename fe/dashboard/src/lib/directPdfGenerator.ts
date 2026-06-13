import { Order } from '@/models';
import jsPDF from 'jspdf';

export interface PDFGeneratorOptions {
  template: 'order' | 'invoice' | 'receipt';
  data: Order;
  action: 'view' | 'download';
  filename?: string;
  onPreview?: (htmlContent: string) => void;
}

export class DirectPDFGenerator {
  private static formatDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    return `${day}-${month}-${year}`;
  }

  private static formatCurrency(amount: number): string {
    return amount.toLocaleString('es-CR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  static async generatePDF(options: PDFGeneratorOptions): Promise<void> {
    const { data, action, filename, onPreview } = options;
    
    if (action === 'view' && onPreview) {
      // For preview, still use HTML template
      const response = await fetch('/src/templates/order.html');
      const template = await response.text();
      const processedHtml = this.processTemplate(template, data);
      onPreview(processedHtml);
      return;
    }

    // Create PDF directly with jsPDF
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header
    doc.setFontSize(12);
    doc.setTextColor('#000');
    doc.text(this.formatDate(data.creation_date), margin, yPosition);
    doc.text('Orden de Compra', pageWidth / 2, yPosition, { align: 'center' });
    doc.text('# 1', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Company info
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(data.supplier.name, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Vendor Number: ${data.supplier.internal_code}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Orden de Compra # ${data.document_number} EDI`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Line separator
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Order details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const leftCol = margin;
    const rightCol = pageWidth / 2 + 10;
    
    doc.text(`Cliente: ${data.client.name} - ${data.client.gln}`, leftCol, yPosition);
    doc.text(`Creación: ${this.formatDate(data.creation_date)}`, rightCol, yPosition);
    yPosition += 6;
    
    doc.text(`Entrega en: ${data.delivery_location.name}`, leftCol, yPosition);
    doc.text(`Despacho: ${this.formatDate(data.delivery_date)}`, rightCol, yPosition);
    yPosition += 6;
    
    doc.text(`Tipo Orden: ${data.order_type}`, leftCol, yPosition);
    doc.text(`Dpto: ${data.department}`, rightCol, yPosition);
    yPosition += 6;
    
    doc.text(`Comentario: ${data.comment || 'N/A'}`, leftCol, yPosition);
    yPosition += 15;

    // Table header
    const colWidths = [20, 20, 60, 20, 20, 25, 20, 20, 25];
    const headers = ['Código\nInterno', 'Código', 'Artículo', 'Cantidad\nPedidas', 'Unidades\nPedidas', 'Precio\nUnitario', 'Descuento', 'Impuesto', 'Total'];
    
    let xPos = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
    
    headers.forEach((header, i) => {
      doc.text(header, xPos + colWidths[i] / 2, yPosition + 2, { align: 'center' });
      xPos += colWidths[i];
    });
    yPosition += 12;
    
    // Line under header
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Table rows
    doc.setFont('helvetica', 'normal');
    data.lines.forEach(line => {
      xPos = margin;
      const rowData = [
        line.internal_code,
        line.code,
        line.description,
        line.quantity_ordered.toString(),
        line.units_ordered.toString(),
        this.formatCurrency(line.unit_price),
        this.formatCurrency(line.discount),
        this.formatCurrency(line.tax),
        this.formatCurrency(line.line_total)
      ];
      
      rowData.forEach((cell, i) => {
        const align = i === 2 ? 'left' : 'center';
        const x = align === 'left' ? xPos + 2 : xPos + colWidths[i] / 2;
        doc.text(cell, x, yPosition, { align });
        xPos += colWidths[i];
      });
      yPosition += 6;
    });

    // Line before totals
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Totals
    doc.setFont('helvetica', 'bold');
    xPos = margin;
    const totalsData = [
      `LÍNEAS: ${data.line_count}`,
      '',
      'TOTALES:',
      data.total_quantities.toString(),
      data.order_totals.total_units_ordered.toString(),
      '',
      this.formatCurrency(data.discounts),
      '',
      this.formatCurrency(data.grand_total)
    ];
    
    totalsData.forEach((cell, i) => {
      if (cell) {
        const align = i === 2 ? 'right' : (i === 0 ? 'left' : 'center');
        const x = align === 'left' ? xPos + 2 : align === 'right' ? xPos + colWidths[i] - 2 : xPos + colWidths[i] / 2;
        doc.text(cell, x, yPosition, { align });
      }
      xPos += colWidths[i];
    });
    yPosition += 10;

    // Final total
    doc.text('TOTAL', pageWidth - margin - 45, yPosition, { align: 'right' });
    doc.text(this.formatCurrency(data.grand_total - data.discounts), pageWidth - margin, yPosition, { align: 'right' });

    // Save PDF
    const pdfFilename = filename || `orden-${data.document_number}.pdf`;
    doc.save(pdfFilename);
  }

  private static processTemplate(template: string, data: Order): string {
    // Same template processing as before for preview
    let processed = template;
    
    const creationDateFormatted = this.formatDate(data.creation_date);
    const deliveryDateFormatted = this.formatDate(data.delivery_date);
    const subtotalFormatted = this.formatCurrency(data.grand_total);
    const discountsFormatted = this.formatCurrency(data.discounts);
    const totalFormatted = this.formatCurrency(data.grand_total - data.discounts);
    const taxesFormatted = this.formatCurrency(data.taxes);
    
    const linesHtml = data.lines.map(line => `
      <tr>
        <td>${line.internal_code}</td>
        <td>${line.code}</td>
        <td class="text-left">${line.description}</td>
        <td>${line.quantity_ordered}</td>
        <td>${line.units_ordered}</td>
        <td class="text-right">${this.formatCurrency(line.unit_price)}</td>
        <td class="text-right">${this.formatCurrency(line.discount)}</td>
        <td class="text-right">${this.formatCurrency(line.tax)}</td>
        <td class="text-right">${this.formatCurrency(line.line_total)}</td>
      </tr>
    `).join('');
    
    const replacements = {
      document_number: data.document_number,
      supplier_name: data.supplier.name,
      supplier_internal_code: data.supplier.internal_code,
      client_name: data.client.name,
      client_gln: data.client.gln,
      deliver_to: data.delivery_location.name,
      order_type: data.order_type,
      department: data.department,
      comment: data.comment || 'N/A',
      line_count: data.line_count.toString(),
      total_quantities: data.total_quantities.toString(),
      creation_date_formatted: creationDateFormatted,
      delivery_date_formatted: deliveryDateFormatted,
      subtotal_formatted: subtotalFormatted,
      discounts_formatted: discountsFormatted,
      total_formatted: totalFormatted,
      taxes_formatted: taxesFormatted,
      lines_html: linesHtml,
      'order_totals.total_units_ordered': data.order_totals.total_units_ordered.toString()
    };
    
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    });
    
    return processed;
  }
}