import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Roboto-normal.js';
import './Roboto-bold.js';

const generateInvoice = (orderData, t, language) => {
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
    
    const formattedDate = orderData.orderDate ? new Date(orderData.orderDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : '---';
    doc.text(`${t('invoice_date')}: ${formattedDate}`, 15, 57);
    
    const paymentMethodsMap = {
        'CASH': t('invoice_cash'),
        'BANK_TRANSFER': t('invoice_bank_transfer'),
        'CREDIT_CARD': t('invoice_credit_card')
    };
    const displayPayment = paymentMethodsMap[orderData.paymentMethod] || orderData.paymentMethod;
    doc.text(`${t('invoice_payment')}: ${displayPayment}`, 15, 62);

    const rightColX = 115;
    const addressWidth = 80;

    doc.setFont("Roboto", "bold");
    doc.text(t('invoice_customer'), rightColX, 50);
    
    doc.setFont("Roboto", "normal");
    doc.text(`${orderData.userName || t('guest')}`, rightColX, 57);
    
    const addressStr = orderData.address?.split('|')[0] || t('no_address');
    const splitAddress = doc.splitTextToSize(addressStr, addressWidth);
    doc.text(splitAddress, rightColX, 62);

    let nextY = 62 + (splitAddress.length * 5) + 10;
    if (nextY < 85) nextY = 85; 

    const tableData = orderData.items.map(item => {
        const price = Number(item.price) || 0;
        const promotionPrice = (item.promotionPrice !== null && item.promotionPrice !== undefined) ? Number(item.promotionPrice) : price;
        const effectivePrice = (promotionPrice > 0 && promotionPrice < price) ? promotionPrice : price;
        const quantity = Number(item.quantity) || 1;

        return [
            item.productVariantName,
            quantity,
            `${effectivePrice.toLocaleString("vi-VN")}${t('admin_unit_vnd')}`,
            `${(effectivePrice * quantity).toLocaleString("vi-VN")}${t('admin_unit_vnd')}`
        ];
    });

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
    doc.text(`+${(orderData.shippingFee || 0).toLocaleString("vi-VN")}${t('admin_unit_vnd')}`, valueX, finalY, { align: "right" });

    doc.setFont("Roboto", "bold");
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${t('invoice_grand_total')}:`, labelX, finalY + 12, { align: "right" });
    doc.text(`${(orderData.total || 0).toLocaleString("vi-VN")}${t('admin_unit_vnd')}`, valueX, finalY + 12, { align: "right" });

    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(t('invoice_thanks'), 105, 280, { align: "center" });

    const invoiceFileName = language === 'vi' ? `BKEUTY_HoaDon_${orderData.id}.pdf` : `BKEUTY_Invoice_${orderData.id}.pdf`;
    doc.save(invoiceFileName);
};

export default generateInvoice;
