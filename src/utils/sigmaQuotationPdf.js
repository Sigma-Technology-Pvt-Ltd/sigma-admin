import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, numberToWords } from './numberToWords';
import { SIGMA_COMPANY_PROFILE, DEFAULT_QUOTATION_TERMS } from './quotationTerms';
import { SIGMA_LOGO_BASE64 } from './sigmaLogoData';

/**
 * Builds the official Sigma Technologies Quotation PDF
 * Matching the exact high-end 2-page layout & geometry of DEAL-8510 reference PDF
 * Featuring parent company Kusum Group, nested terms selection, and dynamic re-indexing.
 */
export function buildQuotationDoc(data) {
    // Using pt units for 1-to-1 pixel-perfect geometry matching DEAL-8510
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4' // 595.28 x 841.89 pt
    });

    const quotationNumber = data.quotationNumber || `SIGMA-QT-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanQtNumber = quotationNumber.replace(/^SIGMA-QT-?/i, '') || `${Math.floor(1000 + Math.random() * 9000)}`;
    const docTitle = `Sigma-QT-${cleanQtNumber}`;

    // Set internal PDF Document Metadata so browsers (Chrome, Edge, Firefox, Acrobat)
    // use "Sigma-QT-xxxx" as the default filename when downloading from embedded preview viewer
    doc.setProperties({
        title: docTitle,
        subject: `Sigma Technologies Quotation ${quotationNumber}`,
        author: 'Sigma Technologies Pvt. Ltd.',
        keywords: 'quotation, sigma technologies',
        creator: 'Sigma Technologies Pvt. Ltd.'
    });

    const pageWidth = doc.internal.pageSize.getWidth();   // 595.28 pt
    const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt

    const company = data.company || SIGMA_COMPANY_PROFILE;
    const customer = data.customer || {};
    const items = data.items || [];
    const dateStr = data.date || new Date().toLocaleDateString('en-GB');
    const validity = data.validity || '30 Days';
    const deliveryTime = data.deliveryTime || '2-3 Working Weeks';

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const printDateTime = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // ─────────────────────────────────────────────────────────────────────────────
    // REUSABLE TOP HEADER (PAGE 1 & PAGE 2)
    // ─────────────────────────────────────────────────────────────────────────────
    const drawCompanyHeader = (pageNoStr) => {
        // Real Sigma Technologies Logo Image at Top-Left
        try {
            if (SIGMA_LOGO_BASE64 && SIGMA_LOGO_BASE64.startsWith('data:image')) {
                // Sigma logo aspect ratio is ~3:1 (908x303)
                // x=36, y=26, width=126 pt, height=42 pt
                doc.addImage(SIGMA_LOGO_BASE64, 'PNG', 36, 26, 126, 42);
            }
        } catch (e) {
            console.warn('Failed to render logo image in PDF:', e);
        }

        // Subtitle: Parent Company "A unit of Kusum Group"
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(74, 58, 92);
        doc.text(company.parentCompany || 'A unit of Kusum Group', 36, 80);

        // Company Details on Top-Right (x = 320 pt)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.0);
        doc.setTextColor(26, 75, 156); // Sigma Brand Blue
        doc.text(company.companyName || 'Sigma Technologies Pvt. Ltd.', 320, 36);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 51, 51);
        doc.text(company.address || 'Aspen Marg, Maitighar, St.Xavier College Rd, Kathmandu, Nepal', 320, 49);
        doc.text(`Contact No : ${company.contact || '+977 9801113668'}`, 320, 62);
        doc.text(`Email us : ${company.email || 'info@sigmatechnologies.com.np'}`, 320, 74);
        doc.text(`Website : ${company.website || 'www.sigmatechnologies.com.np'}`, 320, 86);

        // Page Number at Top Right
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(26, 26, 26);
        doc.text(`Page No : ${pageNoStr}`, 506.5, 92);
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // PAGE 1: OFFICIAL QUOTATION DETAILS & ITEMS
    // ─────────────────────────────────────────────────────────────────────────────

    drawCompanyHeader('1/2');

    // Document Title: QUOTATION
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14.0);
    doc.setTextColor(26, 26, 26);
    doc.text('QUOTATION', 36, 121.5);

    // ── Two Column Meta Information ──
    // Left Column: Account / Customer Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(26, 26, 26);
    doc.text('Account/Customer Details', 36, 142.7);

    doc.setFontSize(9.0);
    doc.text(customer.name || customer.company || 'Valued Client', 36, 158.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 51, 51);
    let custY = 174.0;
    if (customer.panVat) {
        doc.text(`VAT/PAN: ${customer.panVat}`, 36, custY);
        custY += 15.0;
    }
    const contactLine = `Contact: ${customer.phone ? customer.phone : 'N/A'}`;
    doc.text(contactLine, 36, custY);
    custY += 15.0;

    if (customer.email) {
        doc.text(`Email: ${customer.email}`, 36, custY);
        custY += 15.0;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(26, 26, 26);
    doc.text('Delivery Address:', 36, 225.0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 51, 51);
    doc.text(customer.address || 'Site Delivery / Ex-Works', 36, 240.3);

    // Right Column: Contact & Quotation Order Meta (x = 320 pt)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(26, 26, 26);
    doc.text('Contact Details :', 320, 142.7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 51, 51);
    doc.text(`Phone: ${company.contact || '+977 9801113668'}`, 320, 159.0);
    doc.text(`Email: ${company.email || 'info@sigmatechnologies.com.np'}`, 320, 174.0);

    doc.text(`Order    No   :`, 320, 211.0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${quotationNumber}`, 395, 211.0);

    doc.setFont('helvetica', 'normal');
    doc.text(`Quotation Date : ${dateStr}`, 320, 227.0);
    doc.text(`Delivery Time  : ${deliveryTime}`, 320, 243.0);

    // ── Table of Items ──
    const tableData = items.map((item, index) => {
        const uPrice = Number(item.unitPrice || 0);
        const q = Number(item.qty || 1);
        const lTotal = Number(item.amount || uPrice * q);
        return [
            index + 1,
            item.description || item.title || 'Product Item',
            q,
            formatCurrency(uPrice),
            formatCurrency(lTotal)
        ];
    });

    autoTable(doc, {
        startY: 275,
        margin: { left: 36, right: 36 },
        head: [['SN', 'Product Description', 'Qty', 'Unit Price', 'Amount']],
        body: tableData,
        theme: 'plain',
        headStyles: {
            fillColor: [244, 241, 248], // Soft elegant header matching DEAL-8510
            textColor: [26, 26, 26],
            fontStyle: 'bold',
            fontSize: 8.0,
            halign: 'left',
            valign: 'middle',
            cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
            lineColor: [26, 26, 26],
            lineWidth: 0.75
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 32 },
            1: { halign: 'left', cellWidth: 'auto' },
            2: { halign: 'center', cellWidth: 45 },
            3: { halign: 'right', cellWidth: 75 },
            4: { halign: 'right', cellWidth: 95 }
        },
        bodyStyles: {
            fontSize: 8.0,
            textColor: [26, 26, 26],
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
            lineColor: [216, 212, 226],
            lineWidth: 0.5
        },
        styles: {
            font: 'helvetica',
            overflow: 'linebreak'
        },
        tableLineColor: [26, 26, 26],
        tableLineWidth: 0.75
    });

    const tableEndY = doc.lastAutoTable.finalY;

    // ── Bottom Summary Boxes (Matching DEAL-8510 geometry) ──
    const subtotal = Number(data.subtotal || 0);
    const isVatApplicable = data.isVatApplicable !== false;
    const vatAmount = isVatApplicable ? subtotal * 0.13 : 0;
    const grandTotal = subtotal + vatAmount;

    const summaryBoxY = tableEndY + 8;
    const summaryBoxH = 78;

    // Left Box: Commercial Scope / Official Offer Notice (NO bank details, strictly quotation notice)
    doc.setDrawColor(26, 26, 26);
    doc.setLineWidth(0.75);
    doc.rect(36, summaryBoxY, 260, summaryBoxH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(26, 26, 26);
    doc.text('Commercial Terms & Scope :', 44, summaryBoxY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.0);
    doc.setTextColor(51, 51, 51);
    doc.text(`• Offer Validity: ${validity} from issue date`, 44, summaryBoxY + 31);
    doc.text(`• Delivery Period: ${deliveryTime}`, 44, summaryBoxY + 45);
    doc.text('• Official engineering solutions by Sigma Technologies', 44, summaryBoxY + 59);
    doc.text('• Detailed terms and conditions are enclosed on Page 2', 44, summaryBoxY + 71);

    // Right Box: Totals Breakdown (Matching DEAL-8510 layout)
    doc.rect(296, summaryBoxY, 263.28, summaryBoxH);

    // Dividing lines in right box
    doc.setDrawColor(220, 215, 230);
    doc.setLineWidth(0.5);
    doc.line(296, summaryBoxY + 19.5, 559.28, summaryBoxY + 19.5);
    doc.line(296, summaryBoxY + 39.0, 559.28, summaryBoxY + 39.0);
    doc.line(296, summaryBoxY + 58.5, 559.28, summaryBoxY + 58.5);

    // Sub Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.0);
    doc.setTextColor(26, 26, 26);
    doc.text('Sub Total:', 304, summaryBoxY + 13.5);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(subtotal), 551, summaryBoxY + 13.5, { align: 'right' });

    // Taxable Value
    doc.setFont('helvetica', 'bold');
    doc.text('Taxable Value:', 304, summaryBoxY + 33.0);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(subtotal), 551, summaryBoxY + 33.0, { align: 'right' });

    // VAT 13%
    doc.setFont('helvetica', 'bold');
    doc.text(isVatApplicable ? 'VAT 13%:' : 'VAT (Exempt):', 304, summaryBoxY + 52.5);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(vatAmount), 551, summaryBoxY + 52.5, { align: 'right' });

    // Grand Total (Bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Grand Total:', 304, summaryBoxY + 71.0);
    doc.text(`NPR ${formatCurrency(grandTotal)}`, 551, summaryBoxY + 71.0, { align: 'right' });

    // ── Amount in Words Box ──
    const wordsY = summaryBoxY + summaryBoxH + 8;
    doc.setDrawColor(26, 26, 26);
    doc.setLineWidth(0.75);
    doc.rect(36, wordsY, 523.28, 20);

    const amountInWordsText = data.amountInWords || numberToWords(grandTotal);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.0);
    doc.setTextColor(26, 26, 26);
    doc.text(`Amount in Words :  ${amountInWordsText} Only`, 44, wordsY + 13.5);

    // ── Remarks ──
    const remarksY = wordsY + 24;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.0);
    doc.setTextColor(26, 26, 26);
    const remarksContent = `Remarks :  ${data.remarks ? data.remarks : 'Deal No: ' + quotationNumber}`;
    const wrappedRemarks = doc.splitTextToSize(remarksContent, 520);
    doc.text(wrappedRemarks, 36, remarksY);

    // ── Signatures Section ──
    // As explicitly requested: Quotation does NOT have Receiver's signature.
    // Clean signature line: "Prepared By: Sigma Technologies"
    const sigY = 715;
    doc.setDrawColor(26, 26, 26);
    doc.setLineWidth(0.75);
    doc.line(36, sigY, 200, sigY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.0);
    doc.setTextColor(85, 85, 85);
    doc.text('Sigma Technologies', 36, sigY - 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(26, 26, 26);
    doc.text('Prepared By: Sigma Technologies', 36, sigY + 14);

    // Right Side: Authorized Signature & Stamp
    if (data.authorizedSignature && typeof data.authorizedSignature === 'string' && data.authorizedSignature.startsWith('data:image')) {
        try {
            const format = (data.authorizedSignature.includes('image/jpeg') || data.authorizedSignature.includes('image/jpg')) ? 'JPEG' : 'PNG';
            doc.addImage(data.authorizedSignature, format, 415, sigY - 42, 110, 38);
        } catch (sigErr) {
            console.warn('Failed to render authorized signature:', sigErr);
        }
    }
    doc.line(380, sigY, 559.28, sigY);
    doc.text('Authorized Signature & Stamp', 400, sigY + 14);

    // Footer on Page 1
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(102, 102, 102);
    doc.text('Printed By: Sigma Technologies Team', 36, 780);
    doc.text(`Printed DateTime : ${printDateTime}`, 360, 780);

    // ─────────────────────────────────────────────────────────────────────────────
    // PAGE 2: TERMS AND CONDITIONS (NESTED SELECTION & DYNAMIC RE-NUMBERING)
    // ─────────────────────────────────────────────────────────────────────────────

    doc.addPage();

    drawCompanyHeader('2/2');

    // Title: Terms and Conditions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(26, 26, 26);
    doc.text('Terms and Conditions', 36, 102);

    // Dynamic sequential re-numbering with nested subclauses support:
    // Filter active selected master clauses that have at least 1 subclause selected (or have text)
    const rawTerms = data.terms && data.terms.length > 0 ? data.terms : DEFAULT_QUOTATION_TERMS;
    const selectedTerms = rawTerms.filter(term => {
        if (!term || term.selected === false) return false;
        if (Array.isArray(term.subclauses) && term.subclauses.length > 0) {
            return term.subclauses.some(sub => (typeof sub === 'object' ? sub.selected !== false : true));
        }
        return true;
    });

    // 2-Column coordinates matching DEAL-8510:
    // Left Column: x = 36 pt, width = 247 pt
    // Right Column: x = 295 pt, width = 258 pt
    const col1X = 36;
    const col1W = 247;
    const col2X = 295;
    const col2W = 258;

    // Distribute terms across columns:
    const splitIndex = selectedTerms.length >= 6 ? 3 : Math.ceil(selectedTerms.length / 2);
    const col1Terms = selectedTerms.slice(0, splitIndex);
    const col2Terms = selectedTerms.slice(splitIndex);

    const renderColumnTerms = (colTerms, startSeqNum, startX, colWidth) => {
        let currentY = 122;

        colTerms.forEach((term, idx) => {
            const seqNum = startSeqNum + idx; // Dynamic continuous numbering 1, 2, 3...
            const cleanTitle = term.title.replace(/^\d+\.\s*/, '').trim();

            // Clause Header (e.g. "1.   General Conditions & Applications.")
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.2);
            doc.setTextColor(26, 26, 26);
            doc.text(`${seqNum}.   ${cleanTitle}`, startX, currentY);
            currentY += 9.5;

            // Render active subclauses if present
            if (Array.isArray(term.subclauses) && term.subclauses.length > 0) {
                const activeSubs = term.subclauses.filter(s => (typeof s === 'object' ? s.selected !== false : true));
                const subclauseLetters = ['a.', 'b.', 'c.', 'd.', 'e.', 'f.', 'g.', 'h.', 'i.', 'j.'];

                activeSubs.forEach((subItem, subIdx) => {
                    const subText = typeof subItem === 'object' ? subItem.text : subItem;
                    const letter = subclauseLetters[subIdx] || '•';

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(5.2);
                    doc.setTextColor(26, 26, 26);
                    doc.text(letter, startX + 6, currentY);

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(5.2);
                    doc.setTextColor(51, 51, 51);

                    const wrapped = doc.splitTextToSize(subText, colWidth - 14);
                    doc.text(wrapped, startX + 14, currentY);

                    currentY += (wrapped.length * 6.5) + 3.0;
                });
            } else {
                // Single text block fallback
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(5.2);
                doc.setTextColor(51, 51, 51);

                const wrapped = doc.splitTextToSize(term.text || '', colWidth - 6);
                doc.text(wrapped, startX + 6, currentY);
                currentY += (wrapped.length * 6.5) + 3.0;
            }

            currentY += 5.5; // Gap between master clauses
        });
    };

    // Render Left Column
    renderColumnTerms(col1Terms, 1, col1X, col1W);

    // Render Right Column
    renderColumnTerms(col2Terms, col1Terms.length + 1, col2X, col2W);

    // Bottom Note on Page 2 (Matching DEAL-8510)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(68, 68, 68);
    doc.text('Note: Terms & Conditions are enclosed with Quotation & thus is integrated part of offer and other documents unless it is agreed in writing specifically.', 36, 760);

    return doc;
}

/**
 * Trigger immediate browser download of Quotation PDF
 */
export function downloadQuotationPdf(data, filename) {
    const doc = buildQuotationDoc(data);
    const cleanQtNumber = (data.quotationNumber || '').replace(/^SIGMA-QT-?/i, '') || `${Math.floor(1000 + Math.random() * 9000)}`;
    const safeName = filename || `Sigma-QT-${cleanQtNumber}.pdf`;
    doc.save(safeName);
}

/**
 * Returns a Blob URL for displaying PDF in iframe modal preview
 */
export function getQuotationPdfBlobUrl(data) {
    const doc = buildQuotationDoc(data);
    const cleanQtNumber = (data.quotationNumber || '').replace(/^SIGMA-QT-?/i, '') || `${Math.floor(1000 + Math.random() * 9000)}`;
    const safeName = `Sigma-QT-${cleanQtNumber}.pdf`;
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    return `${url}#filename=${safeName}`;
}
