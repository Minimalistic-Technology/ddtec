import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateBillPDF = (bill: any, shouldShare = false) => {
    const doc = new jsPDF();

    // Calculate totals locally for the PDF if not provided
    const subtotal = bill.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const itemTaxes = bill.items.reduce((acc: number, item: any) => {
        const itemTotal = item.price * item.quantity;
        return acc + (item.taxes?.reduce((tAcc: number, tax: any) => tAcc + (itemTotal * (tax.rate / 100)), 0) || 0);
    }, 0);
    const globalTaxRate = bill.globalTax?.rate || 0;
    const globalTaxAmount = bill.globalTax?.amount || 0;
    const total = bill.totalAmount || Math.round(subtotal + itemTaxes + globalTaxAmount);

    // Header
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("DDTECH", 20, 17);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("INVOICE", 190, 17, { align: "right" });

    // Details - Branding
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DDTECH TOOLS", 20, 45);
    doc.setFont("helvetica", "normal");
    doc.text("123 Tech Lane, Silicon Valley", 20, 51);
    doc.text("Contact: +91 98765 43210", 20, 57);
    doc.text("Email: support@ddtech.com", 20, 63);

    // Bill To
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 120, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`${bill.customerInfo.name || "Valued Customer"}`, 120, 51);
    doc.text(`${bill.customerInfo.phone || "No Phone"}`, 120, 57);
    doc.text(`${bill.customerInfo.address || "No Address Provided"}`, 120, 63, { maxWidth: 70 });

    doc.setDrawColor(230);
    doc.line(20, 75, 190, 75);

    // Bill Meta
    doc.setFont("helvetica", "bold");
    doc.text("DATE:", 20, 85);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(bill.createdAt || Date.now()).toLocaleDateString(), 40, 85);

    doc.setFont("helvetica", "bold");
    doc.text("INVOICE NO:", 120, 85);
    doc.setFont("helvetica", "normal");
    doc.text(bill._id ? `INV-${bill._id.slice(-8).toUpperCase()}` : `INV-${new Date().getTime().toString().slice(-6)}`, 150, 85);

    // Table
    const tableData = bill.items.map((item: any) => {
        const itemTotal = item.price * item.quantity;
        const iTax = item.taxes?.reduce((tAcc: number, tax: any) => tAcc + (itemTotal * (tax.rate / 100)), 0) || 0;
        return [
            item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name,
            `Rs. ${item.price.toLocaleString()}`,
            item.quantity,
            `Rs. ${iTax.toLocaleString()}`,
            `Rs. ${(itemTotal + iTax).toLocaleString()}`
        ];
    });

    autoTable(doc, {
        startY: 95,
        head: [["Product Name", "Unit Price", "Quantity", "Tax Amount", "Total"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [20, 184, 166], fontSize: 10, fontStyle: 'bold', halign: 'center' },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { halign: 'right', cellWidth: 30 },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'right', cellWidth: 30 },
            4: { halign: 'right', fontStyle: 'bold', cellWidth: 40 }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                if (Array.isArray(data.cell.text) && data.cell.text.length > 1) {
                    data.cell.text = [data.cell.text[0]];
                }
            }
        }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(245, 245, 245);
    doc.rect(130, finalY, 60, 45, 'F');
    doc.setFontSize(10);
    doc.text("Subtotal:", 135, finalY + 10);
    doc.text(`Rs. ${subtotal.toLocaleString()}`, 185, finalY + 10, { align: "right" });

    let currentY = finalY + 18;
    if (itemTaxes > 0) {
        doc.text("Item Taxes:", 135, currentY);
        doc.text(`Rs. ${itemTaxes.toLocaleString()}`, 185, currentY, { align: "right" });
        currentY += 8;
    }

    if (globalTaxAmount > 0) {
        doc.text(`Global Tax (${globalTaxRate}%):`, 135, currentY);
        doc.text(`Rs. ${globalTaxAmount.toLocaleString()}`, 185, currentY, { align: "right" });
        currentY += 8;
    }

    doc.line(135, currentY - 3, 185, currentY - 3);
    doc.setFontSize(12);
    doc.setTextColor(20, 184, 166);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 135, currentY + 5);
    doc.text(`Rs. ${total.toLocaleString()}`, 185, currentY + 5, { align: "right" });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Terms & Conditions", 20, pageHeight - 30);
    doc.text("1. All sales are final. 2. Please mention the invoice number for any queries.", 20, pageHeight - 25);
    doc.setFontSize(10);
    doc.setTextColor(20, 184, 166);
    doc.text("Authorized Signatory", 190, pageHeight - 15, { align: "right" });
    doc.text("www.ddtech.com | Support: support@ddtech.com", 105, pageHeight - 10, { align: "center" });

    if (shouldShare) {
        shareBillPDF(doc, bill.customerInfo);
    } else {
        doc.save(`Invoice_${bill.customerInfo.name || "Customer"}.pdf`);
    }
};

const shareBillPDF = async (doc: jsPDF, customerInfo: any) => {
    const pdfBlob = doc.output('blob');
    const fileName = `Invoice_${customerInfo.name || "Customer"}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    const shareData = {
        files: [file],
        title: 'Invoice - DDTECH TOOLS',
        text: `Invoice for ${customerInfo.name || "Customer"}`,
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log("PDF share failed:", err);
        }
    } else {
        // WhatsApp fallback
        const total = doc.getTextWidth("Total") > 0 ? "" : ""; // Just a placeholder
        const message = `Hello ${customerInfo.name || "Customer"},\n\nYour invoice from DDTECH TOOLS is ready.\n\n(PDF Sharing not supported on this browser)`;
        window.open(`https://wa.me/${customerInfo.phone ? "91" + customerInfo.phone.replace(/\D/g, '') : ""}?text=${encodeURIComponent(message)}`, '_blank');
    }
};
