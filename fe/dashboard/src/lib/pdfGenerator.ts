import { Order } from '@/models';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { downloadBlob } from './downloadUtils';

export interface PDFGeneratorOptions {
  template: 'order' | 'invoice' | 'receipt';
  data: Order;
  action: 'view' | 'download';
  filename?: string;
  onPreview?: (htmlContent: string) => void;
}

export class PDFGenerator {
  private static async loadTemplate(templateName: string): Promise<string> {
    try {
      const response = await fetch(`/src/templates/${templateName}.html`);
      if (!response.ok) {
        throw new Error(`Template ${templateName} not found`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw error;
    }
  }

  private static processTemplate(template: string, data: Order): string {
    let processed = template;
    
    // Format dates
    const creationDateFormatted = this.formatDate(data.creation_date);
    const deliveryDateFormatted = this.formatDate(data.delivery_date);
    
    // Format currency values
    const subtotalFormatted = this.formatCurrency(data.grand_total);
    const discountsFormatted = this.formatCurrency(data.discounts);
    const totalFormatted = this.formatCurrency(data.grand_total - data.discounts);
    const taxesFormatted = this.formatCurrency(data.taxes);
    
    // Generate lines HTML
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
    
    // Replace all placeholders
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
    const { template, data, action, filename, onPreview } = options;
    
    try {
      const templateContent = await this.loadTemplate(template);
      const htmlContent = this.processTemplate(templateContent, data);
      
      if (action === 'view') {
        // Use modal preview instead of new window
        if (onPreview) {
          onPreview(htmlContent);
        }
      } else {
        // Generate PDF and download
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '210mm';
        document.body.appendChild(tempDiv);
        
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        const pdfFilename = filename || `${template}-${data.document_number}.pdf`;
        const pdfBlob = pdf.output('blob');
        downloadBlob(pdfBlob, pdfFilename);
        
        document.body.removeChild(tempDiv);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}