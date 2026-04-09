import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Roboto-normal.js';
import './Roboto-bold.js';

const generateInvoice = (orderData, t) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    const primaryColor = [194, 24, 91];

    doc.setFont("Roboto", "bold");
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(t('invoice_title'), 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("Roboto", "normal");
    doc.text(t('invoice_subtitle'), 105, 28, { align: "center" });

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(15, 40, 195, 40);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("Roboto", "bold");
    doc.text(`${t('invoice_order')} #${orderData.id}`, 15, 50);

    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);
    doc.text(`${t('invoice_date')}: ${orderData.orderDate ? new Date(orderData.orderDate).toLocaleDateString('vi-VN') : '---'}`, 15, 57);
    doc.text(`${t('invoice_payment')}: ${orderData.paymentMethod}`, 15, 62);

    const rightColX = 115;
    const addressWidth = 80;

    doc.setFont("Roboto", "bold");
    doc.text(t('invoice_customer'), rightColX, 50);
    
    doc.setFont("Roboto", "normal");
    doc.text(`${orderData.userName || 'Guest'}`, rightColX, 57);
    
    const addressStr = orderData.address?.split('|')[0] || '';
    const splitAddress = doc.splitTextToSize(addressStr, addressWidth);
    doc.text(splitAddress, rightColX, 62);

    let nextY = 62 + (splitAddress.length * 5) + 10;
    if (nextY < 85) nextY = 85; 

    const tableData = orderData.items.map(item => [
        item.productVariantName,
        item.quantity,
        `${(item.price || 0).toLocaleString("vi-VN")}d`,
        `${((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")}d`
    ]);

    autoTable(doc, {
        startY: nextY,
        head: [[t('invoice_product'), t('invoice_qty'), t('invoice_unit_price'), t('invoice_total')]],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 10,
            halign: 'center',
            font: 'Roboto',
            fontStyle: 'bold'
        },
        styles: {
            font: 'Roboto',
            fontSize: 9,
            cellPadding: 3
        },
        columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const labelX = 155;
    const valueX = 195;

    doc.setFontSize(10);
    doc.text(`${t('invoice_shipping')}:`, labelX, finalY, { align: "right" });
    doc.text(`+${(orderData.shippingFee || 0).toLocaleString("vi-VN")}d`, valueX, finalY, { align: "right" });

    doc.setFont("Roboto", "bold");
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${t('invoice_grand_total')}:`, labelX, finalY + 12, { align: "right" });
    doc.text(`${(orderData.total || 0).toLocaleString("vi-VN")}d`, valueX, finalY + 12, { align: "right" });

    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(t('invoice_thanks'), 105, 280, { align: "center" });

    doc.save(`BKEUTY_Admin_Invoice_${orderData.id}.pdf`);
};

export default generateInvoice;
