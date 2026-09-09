import { isTodayIST, formatISTDate, formatISTTime } from '../utils/dateUtils';

export const mockProducts = [
  {
    id: "prod-001",
    name: "Britannia Good Day Cookies",
    netQuantity: "100 g",
    mrp: "₹50.00",
    mrpInclusive: "Inclusive of all taxes",
    manufacturingDate: "01/08/2026",
    expiryDate: "01/02/2027",
    manufacturer: "Britannia Industries Ltd.",
    fssaiNo: "10012022000234",
    status: "compliant", // 'compliant', 'non-compliant', 'review'
    consumerCare: "1800-425-4444 / care@britannia.co.in",
    category: "Bakery & Biscuits",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=600&auto=format&fit=crop",
    ocrConfidence: 0.98,
    violations: [],
    nutritionalInfo: [
      { key: "Energy", value: "488 kcal" },
      { key: "Protein", value: "6.5 g" },
      { key: "Carbohydrates", value: "67.5 g" },
      { key: "Total Sugars", value: "24.5 g" },
      { key: "Total Fat", value: "21.5 g" },
    ]
  },
  {
    id: "prod-002",
    name: "Maggi 2-Minute Noodles",
    netQuantity: "70 g",
    mrp: "₹14.00",
    mrpInclusive: "Inclusive of all taxes",
    manufacturingDate: "08/08/2026",
    expiryDate: "08/05/2027",
    manufacturer: "Nestlé India Limited",
    fssaiNo: "10012011000168",
    status: "non-compliant",
    consumerCare: "Not clearly printed",
    category: "Instant Food",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=600&auto=format&fit=crop",
    ocrConfidence: 0.89,
    violations: [
      {
        id: "v-001",
        title: "MRP declaration font size non-compliant",
        rule: "Legal Metrology (Packaged Commodities) Rules, 2011",
        section: "Section 6(1)(e)",
        severity: "high",
        description: "The printed MRP text height is less than mandatory 3mm requirement for packages under 100g.",
        ocrConfidence: "94%",
        highlightArea: { x: 20, y: 35, width: 40, height: 15 }
      },
      {
        id: "v-002",
        title: "Manufacturer details incomplete",
        rule: "Legal Metrology (Packaged Commodities) Rules, 2011",
        section: "Section 6(1)(c)",
        severity: "medium",
        description: "Full postal address with pincode and customer care number was partially obscured or truncated.",
        ocrConfidence: "87%",
        highlightArea: { x: 15, y: 60, width: 70, height: 25 }
      }
    ],
    nutritionalInfo: [
      { key: "Energy", value: "310 kcal" },
      { key: "Protein", value: "7.2 g" },
      { key: "Sodium", value: "820 mg" },
    ]
  },
  {
    id: "prod-003",
    name: "Amul Pasteurised Butter",
    netQuantity: "500 g",
    mrp: "₹275.00",
    mrpInclusive: "Inclusive of all taxes",
    manufacturingDate: "20/08/2026",
    expiryDate: "20/02/2027",
    manufacturer: "GCMMF Ltd., Anand 388001",
    fssaiNo: "10012021000071",
    status: "compliant",
    consumerCare: "1800-258-3333",
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=600&auto=format&fit=crop",
    ocrConfidence: 0.99,
    violations: [],
    nutritionalInfo: [
      { key: "Fat", value: "80 g" },
      { key: "Energy", value: "722 kcal" },
    ]
  }
];

export const mockOfficerStats = {
  totalInspections: 248,
  violationsDetected: 38,
  todayInspections: 17,
  pendingReviews: 3,
  officerId: "INSP-2026-AP0231",
  officerName: "Inspector A. Sharma",
  zone: "South Zone - Circle 4",
  activeRuleVersion: "LMPC-2026-v1.2"
};

export const mockRecentInspections = [
  {
    id: "INSP-1023",
    productName: "Maggi Noodles 70 g",
    manufacturer: "Nestlé India Ltd.",
    status: "non-compliant",
    violationsCount: 2,
    timestamp: "2026-09-08T11:24:00.000Z",
    location: "Koramangala, Bengaluru (12.9352° N, 77.6245° E)",
    integrityHash: "a8f9c2d1e0b543789abcdef1234567890"
  },
  {
    id: "INSP-1022",
    productName: "Britannia Good Day Cookies 100 g",
    manufacturer: "Britannia Industries Ltd.",
    status: "compliant",
    violationsCount: 0,
    timestamp: "2026-09-08T10:50:00.000Z",
    location: "Indiranagar, Bengaluru",
    integrityHash: "b7e8d3f1a9c456123000fedcba987654"
  },
  {
    id: "INSP-1021",
    productName: "Tata Salt Vacuum Evaporated 1 kg",
    manufacturer: "Tata Consumer Products",
    status: "compliant",
    violationsCount: 0,
    timestamp: "2026-09-07T16:15:00.000Z",
    location: "Whitefield, Bengaluru",
    integrityHash: "c9d0e1f2a3b456789101112131415161"
  }
];

/**
 * Calculates Today's inspection count dynamically using IST timezone
 */
export function getTodayInspectionsCount(inspectionsList = mockRecentInspections) {
  return inspectionsList.filter(item => item.timestamp && isTodayIST(item.timestamp)).length;
}

export const mockAnomalies = [
  {
    officerId: "LM-0231",
    name: "Off. R. Verma",
    inspectionsCount: 184,
    avgDurationMin: "1.7 min",
    missingEvidence: 14,
    correctionsCount: 18,
    flaggedLevel: "High Risk",
    reason: "Unusually short inspection duration & elevated correction rate"
  },
  {
    officerId: "LM-0182",
    name: "Off. P. Nair",
    inspectionsCount: 161,
    avgDurationMin: "5.4 min",
    missingEvidence: 2,
    correctionsCount: 3,
    flaggedLevel: "Low Risk",
    reason: "Occasional image quality retry"
  },
  {
    officerId: "LM-0314",
    name: "Off. K. Singh",
    inspectionsCount: 203,
    avgDurationMin: "4.8 min",
    missingEvidence: 0,
    correctionsCount: 1,
    flaggedLevel: "Clear",
    reason: "Normal operating parameters"
  }
];
