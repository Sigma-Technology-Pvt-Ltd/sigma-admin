/**
 * Converts a number to words in the South Asian numbering system (Lakh, Crore)
 * standard for Nepal (NPR).
 */
export function numberToWords(num) {
    if (num === null || num === undefined || isNaN(num)) return '';
    const n = Math.round(Number(num));
    if (n === 0) return 'Zero Rupees Only';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertBelowThousand(val) {
        let str = '';
        if (val >= 100) {
            str += ones[Math.floor(val / 100)] + ' Hundred ';
            val %= 100;
        }
        if (val >= 20) {
            str += tens[Math.floor(val / 10)] + ' ';
            val %= 10;
        }
        if (val > 0) {
            str += ones[val] + ' ';
        }
        return str.trim();
    }

    let remaining = n;
    let parts = [];

    // Crores (1,00,00,000)
    if (remaining >= 10000000) {
        const crore = Math.floor(remaining / 10000000);
        parts.push(convertBelowThousand(crore) + ' Crore');
        remaining %= 10000000;
    }

    // Lakhs (1,00,000)
    if (remaining >= 100000) {
        const lakh = Math.floor(remaining / 100000);
        parts.push(convertBelowThousand(lakh) + ' Lakh');
        remaining %= 100000;
    }

    // Thousands (1,000)
    if (remaining >= 1000) {
        const thousand = Math.floor(remaining / 1000);
        parts.push(convertBelowThousand(thousand) + ' Thousand');
        remaining %= 1000;
    }

    // Hundreds and below
    if (remaining > 0) {
        parts.push(convertBelowThousand(remaining));
    }

    return parts.join(' ') + ' Rupees Only';
}

/**
 * Format currency with commas in standard format (e.g. 3,11,460.00)
 */
export function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
    return Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
