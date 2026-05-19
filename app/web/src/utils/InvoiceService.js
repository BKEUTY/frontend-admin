const generateInvoice = async (orderData, t, language) => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    await import('./Roboto-normal.js');
    await import('./Roboto-bold.js');

    const numLocale = language === 'vi' ? 'vi-VN' : 'en-US';
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
    doc.text("Phone: 1-802-526-2463 | Email: support@bkeuty.com", 105, 33, { align: "center" });

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(15, 40, 195, 40);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("Roboto", "bold");
    doc.text(`${t('invoice_order')} #${orderData.orderId}`, 15, 50);

    doc.setFont("Roboto", "normal");
    doc.setFontSize(10);

    const formattedOrderDate = orderData.orderDate ? new Date(orderData.orderDate).toLocaleDateString(numLocale) : '---';
    doc.text(`${t('invoice_order_date')}: ${formattedOrderDate}`, 15, 57);

    if (orderData.estShippingDate) {
        const formattedEstDate = new Date(orderData.estShippingDate).toLocaleDateString(numLocale);
        doc.text(`${t('invoice_est_delivery')}: ${formattedEstDate}`, 15, 62);
    }

    const paymentMethodsMap = {
        'CASH': t('invoice_cash'),
        'BANK_TRANSFER': t('invoice_bank_transfer'),
        'CREDIT_CARD': t('invoice_credit_card')
    };
    const displayPayment = paymentMethodsMap[orderData.paymentMethod] || orderData.paymentMethod;
    doc.text(`${t('invoice_payment')}: ${displayPayment}`, 15, 67);

    const address = orderData.address;
    const addressStr = typeof address === 'string'
        ? address.split('|')[0]
        : `${address?.address || ''}, ${address?.ward?.wardName || ''}, ${address?.district?.districtName || ''}, ${address?.province?.provinceName || ''}`;

    const rightColX = 115;
    const addressWidth = 80;

    doc.setFont("Roboto", "bold");
    doc.text(t('invoice_customer'), rightColX, 50);

    doc.setFont("Roboto", "normal");
    doc.text(`${orderData.userName || t('guest')}`, rightColX, 57);

    const splitAddress = doc.splitTextToSize(addressStr, addressWidth);
    doc.text(splitAddress, rightColX, 62);

    let nextY = 67 + (splitAddress.length * 5) + 10;
    if (nextY < 90) nextY = 90;

    const tableData = orderData.items.map(item => {
        const price = Number(item.price);
        const promoPrice = (item.promotionPrice != null && item.promotionPrice < price) ? item.promotionPrice : price;
        const quantity = item.quantity;
        const productDiscount = price - promoPrice;
        const itemVoucherDiscount = item.voucherDiscountAmount || 0;
        const lineTotal = (promoPrice * quantity) - itemVoucherDiscount;

        return [
            item.productVariantName,
            `${price.toLocaleString(numLocale)}${t('unit_vnd')}`,
            productDiscount > 0 ? `-${productDiscount.toLocaleString(numLocale)}${t('unit_vnd')}` : `0${t('unit_vnd')}`,
            itemVoucherDiscount > 0 ? `-${itemVoucherDiscount.toLocaleString(numLocale)}${t('unit_vnd')}` : `0${t('unit_vnd')}`,
            quantity,
            `${lineTotal.toLocaleString(numLocale)}${t('unit_vnd')}`
        ];
    });

    autoTable(doc, {
        startY: nextY,
        head: [[
            t('invoice_product'),
            t('invoice_original_price'),
            t('invoice_discount_col'),
            t('voucher'),
            t('invoice_qty'),
            t('invoice_total')
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 9,
            halign: 'center',
            font: 'Roboto',
            fontStyle: 'bold'
        },
        styles: {
            font: 'Roboto',
            fontSize: 8,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'right', cellWidth: 25 },
            2: { halign: 'right', cellWidth: 25, textColor: primaryColor },
            3: { halign: 'right', cellWidth: 25, textColor: primaryColor },
            4: { halign: 'center', cellWidth: 18 },
            5: { halign: 'right', cellWidth: 25 }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const labelX = 155;
    const valueX = 195;

    let currentY = finalY;
    const lineHeight = 6;

    // Summaries logic
    const subtotal = orderData.items.reduce((sum, item) => {
        const price = Number(item.price);
        const promoPrice = (item.promotionPrice != null && item.promotionPrice < price) ? item.promotionPrice : price;
        return sum + (promoPrice * item.quantity);
    }, 0);
    const voucherDiscount = orderData.items.reduce((sum, item) => sum + (item.voucherDiscountAmount || 0), 0);
    const shippingFee = orderData.shippingFee || 0;
    const grandTotal = orderData.total + shippingFee;

    // Buyer Note Section
    if (orderData.buyerNote) {
        doc.setFont("Roboto", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`${t('note') || 'Ghi chú'}:`, 15, currentY);
        doc.setFont("Roboto", "normal");
        const splitNote = doc.splitTextToSize(orderData.buyerNote, 100);
        doc.text(splitNote, 15, currentY + 5);
    }

    // Display values
    doc.setFontSize(10);
    doc.setFont("Roboto", "normal");
    doc.setTextColor(0);

    doc.text(`${t('invoice_subtotal')}:`, labelX, currentY, { align: "right" });
    doc.text(`${subtotal.toLocaleString(numLocale)}${t('unit_vnd')}`, valueX, currentY, { align: "right" });

    if (voucherDiscount > 0) {
        currentY += lineHeight;
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`${t('voucher_discount')}:`, labelX, currentY, { align: "right" });
        doc.text(`-${voucherDiscount.toLocaleString(numLocale)}${t('unit_vnd')}`, valueX, currentY, { align: "right" });
        doc.setTextColor(0);
    }

    currentY += lineHeight;
    doc.text(`${t('shipping_fee')}:`, labelX, currentY, { align: "right" });
    doc.text(`+${shippingFee.toLocaleString(numLocale)}${t('unit_vnd')}`, valueX, currentY, { align: "right" });

    currentY += 10;
    doc.setFont("Roboto", "bold");
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${t('invoice_grand_total')}:`, labelX, currentY, { align: "right" });
    doc.text(`${grandTotal.toLocaleString(numLocale)}${t('unit_vnd')}`, valueX, currentY, { align: "right" });

    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(t('invoice_thanks'), 105, 280, { align: "center" });

    const invoiceFileName = t('invoice_title').toLowerCase().replace(/\s+/g, '_') + `_${orderData.orderId}.pdf`;
    doc.save(`BKEUTY_${invoiceFileName}`);
};

export default generateInvoice;
