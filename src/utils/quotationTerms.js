/**
 * Standard Commercial Terms & Conditions for Sigma Technologies Quotations
 * Tailored specifically for commercial quotations and offers (not proforma invoices).
 * Structured with nested selection & dynamic sequential re-numbering (1., 2., 3...)
 */

export const DEFAULT_QUOTATION_TERMS = [
    {
        id: 'validity',
        title: 'Quotation Validity.',
        selected: true,
        subclauses: [
            {
                id: 'validity-a',
                text: 'This quotation is valid for a period of 30 (thirty) days from the date of issue, unless otherwise specified or extended in writing by the Company.',
                selected: true
            },
            {
                id: 'validity-b',
                text: 'The Company reserves the right to review or withdraw the quotation if technical specifications, site conditions, or commercial requirements are altered prior to written acceptance.',
                selected: true
            }
        ],
        text: 'This quotation is valid for 30 days from the date of issue. The Company reserves the right to review terms if technical specifications change prior to order confirmation.'
    },
    {
        id: 'pricing',
        title: 'Prices, Taxes & Duties.',
        selected: true,
        subclauses: [
            {
                id: 'pricing-a',
                text: 'All prices quoted are in Nepalese Rupees (NPR). Prices are exclusive of 13% Value Added Tax (VAT), which will be charged as applicable at the time of invoicing.',
                selected: true
            },
            {
                id: 'pricing-b',
                text: 'Unless expressly stated in the scope of supply, prices quoted are Ex-Works / Godown and do not include transit insurance, freight, or local unloading charges at the customer\'s site.',
                selected: true
            },
            {
                id: 'pricing-c',
                text: 'Any change in statutory government taxes, levies, or customs duties enacted prior to supply execution will be applicable to the customer at actuals.',
                selected: true
            },
            {
                id: 'pricing-d',
                text: 'If there is an inadvertent typographical error or arithmetic omission, the Company reserves the right to issue an amended quotation prior to order finalization.',
                selected: true
            }
        ],
        text: 'All prices are in Nepalese Rupees (NPR), exclusive of 13% VAT unless stated otherwise. Prices are Ex-Works unless freight is specified. Taxes and statutory levies applicable at billing time.'
    },
    {
        id: 'payment',
        title: 'Terms of Payment.',
        selected: true,
        subclauses: [
            {
                id: 'payment-a',
                text: 'Standard payment terms: 50% advance payment along with confirmed Purchase Order / Work Order; balance 50% prior to dispatch or upon delivery as mutually agreed.',
                selected: true
            },
            {
                id: 'payment-b',
                text: 'Payments shall be made via account payee cheque or electronic bank transfer in favor of Sigma Technologies Pvt. Ltd.',
                selected: true
            },
            {
                id: 'payment-c',
                text: 'Engineering design, procurement, and dispatch schedules will be initiated only upon receipt and clearance of the agreed advance payment.',
                selected: true
            }
        ],
        text: '50% advance with official Purchase Order, 50% prior to dispatch or upon delivery. Procurement and execution commence upon receipt of advance.'
    },
    {
        id: 'delivery',
        title: 'Delivery & Execution Schedule.',
        selected: true,
        subclauses: [
            {
                id: 'delivery-a',
                text: 'Estimated delivery timeline is 2 to 4 working weeks from the date of advance payment clearance and technical drawing approval, subject to stock availability.',
                selected: true
            },
            {
                id: 'delivery-b',
                text: 'Delivery schedule is contingent upon timely provision of site readiness, clear access, and required approvals from the customer.',
                selected: true
            },
            {
                id: 'delivery-c',
                text: 'The Company shall not be held liable for delivery delays caused by Force Majeure circumstances including natural calamities, strikes, government restrictions, or transit bottlenecks.',
                selected: true
            }
        ],
        text: 'Estimated delivery timeline is 2 to 4 working weeks from advance payment and technical clearance. Delivery is subject to site readiness and Force Majeure.'
    },
    {
        id: 'scope',
        title: 'Scope of Supply & Installation.',
        selected: true,
        subclauses: [
            {
                id: 'scope-a',
                text: 'The scope of supply is strictly confined to the items, specifications, and quantities clearly set forth in this quotation.',
                selected: true
            },
            {
                id: 'scope-b',
                text: 'Site civil works, masonry, primary electrical cabling, earthing, water supply, and scaffolding are within the customer\'s scope unless explicitly quoted as included.',
                selected: true
            },
            {
                id: 'scope-c',
                text: 'Any additional equipment, modification, or extra work requested by the customer beyond the quoted scope will be charged separately under a supplementary quotation.',
                selected: true
            }
        ],
        text: 'Scope is strictly restricted to listed items and specifications. Site civil, masonry, and electrical infrastructure are in customer scope unless explicitly included.'
    },
    {
        id: 'warranty',
        title: 'Warranty & Technical Support.',
        selected: true,
        subclauses: [
            {
                id: 'warranty-a',
                text: 'Supplied products carry a 12 (twelve) month standard manufacturer warranty against manufacturing defects from the date of supply or commissioning.',
                selected: true
            },
            {
                id: 'warranty-b',
                text: 'Warranty does not cover defects or damage caused by improper operation, power surges/fluctuations, water damage, unauthorized repairs, or normal wear and tear.',
                selected: true
            },
            {
                id: 'warranty-c',
                text: 'In the event of a warranty claim, written notice with defect details must be submitted promptly to Sigma Technologies for technical assessment and rectification.',
                selected: true
            }
        ],
        text: '12-month standard manufacturer warranty against manufacturing defects. Excludes damage from electrical surges, physical abuse, or unauthorized tampering.'
    },
    {
        id: 'acceptance',
        title: 'Order Confirmation & Cancellation.',
        selected: true,
        subclauses: [
            {
                id: 'acceptance-a',
                text: 'An order is confirmed and legally binding upon receipt of the customer\'s signed acceptance of this quotation or an official Purchase Order accompanied by the required advance.',
                selected: true
            },
            {
                id: 'acceptance-b',
                text: 'In the event of cancellation after order confirmation and procurement commencement, the customer shall bear all expenses incurred for procured materials and engineering work up to the cancellation date.',
                selected: true
            }
        ],
        text: 'Order is confirmed upon receipt of signed quotation or official Purchase Order with advance. Order cancellation incurs charges for procured materials and work done.'
    }
];

export const SIGMA_COMPANY_PROFILE = {
    companyName: 'Sigma Technologies Pvt. Ltd.',
    parentCompany: 'A unit of Kusum Group',
    tagline: 'Engineering & Automation Solutions',
    address: 'Aspen Marg, Maitighar, St. Xavier College Rd, Kathmandu, Nepal',
    contact: '+977 9801113668',
    email: 'info@sigmatechnologies.com.np',
    website: 'www.sigmatechnologies.com.np'
};

export function getInitialTerms() {
    return JSON.parse(JSON.stringify(DEFAULT_QUOTATION_TERMS));
}
