import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                const escaped = ('' + value).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportToPDF = (data: any[], headers: string[], filename: string, title: string) => {
    const doc = new jsPDF() as any;

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    // Filter data to only include keys that match headers (simplified for this utility)
    const tableRows = data.map(item => Object.values(item));

    autoTable(doc, {
        head: [headers],
        body: tableRows as any[][],
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [45, 134, 114] } // Teal-ish matching the UI
    });

    doc.save(`${filename}.pdf`);
};
