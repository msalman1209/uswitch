import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def generate_excel():
    wb = openpyxl.Workbook()
    
    # Sheet 1: Real-Time API Directory & Costs
    ws1 = wb.active
    ws1.title = "Realtime APIs & Card Machines"
    ws1.views.sheetView[0].showGridLines = True

    headers1 = [
        "Category",
        "API / Service Name",
        "Provider / Source",
        "Real-Time Data / Feature Provided",
        "How to Get API Key & Setup Access",
        "Estimated Cost & Pricing Model",
        "Integration Complexity"
    ]

    data1 = [
        # Card Machine & Merchant Payment Processing
        [
            "Card Machine & Payments",
            "Stripe Payments & Terminal API",
            "Stripe UK",
            "Online card checkout (Visa, MC, Apple Pay, Google Pay) + Physical Card Machine integration (Stripe Reader M2/WisePOS E)",
            "1. Sign up at stripe.com/uk\n2. Verify business details & bank account\n3. Go to Developers > API Keys\n4. Copy Publishable & Secret Keys (Sandbox & Live)",
            "1.5% + 20p per UK card payment\n£0 Monthly Fee | £0 Setup Fee",
            "Easy"
        ],
        [
            "Card Machine & Payments",
            "Zettle by PayPal POS & Reader API",
            "PayPal Zettle UK",
            "In-person Card Machine payment reader integration, live sale sync & transaction receipts",
            "1. Sign up at zettle.com/gb\n2. Order Zettle Card Reader (£29)\n3. Go to developer.paypal.com > Zettle SDK & API keys",
            "1.75% per card transaction\n£0 Monthly Fee | Card Reader from £29",
            "Easy"
        ],
        [
            "Card Machine & Payments",
            "Worldpay / Barclaycard Merchant API",
            "Worldpay UK / Barclaycard",
            "High-volume UK merchant card processing, countertop/portable card terminals, recurring billing",
            "1. Apply for Merchant Account at worldpay.com or barclaycard.co.uk\n2. Complete underwriting & KYC compliance\n3. Access Merchant Admin Portal > API Key",
            "From 0.7% to 1.2% per card transaction\n~£15-£20/mo terminal rental",
            "Medium"
        ],

        # Broadband & TV
        [
            "Broadband & TV",
            "Decision Tech API / Moneysupermarket B2B",
            "Decision Tech (ZPG Group)",
            "Live Fibre Broadband & TV tariff comparison rates, contract length, speeds, cashback offers",
            "1. Apply at partner.decisiontech.co.uk\n2. Sign B2B Affiliate Agreement\n3. Access API credentials in partner dashboard",
            "Free API for affiliates\nEarns £20 - £50 commission per switch",
            "Medium"
        ],
        [
            "Broadband & TV",
            "Openreach Broadband Availability API",
            "BT Openreach UK",
            "Exact line speed check (FTTP/FTTC) & exchange capability by UK Postcode",
            "1. Register at openreach.co.uk/developers\n2. Request Developer Portal sandbox account\n3. Generate OAuth client ID and Secret",
            "Free for registered telecom partners",
            "Medium"
        ],
        [
            "Broadband & TV",
            "Awin Affiliate Network API",
            "Awin Global",
            "Live broadband deals & deep-link tracking for Sky, Virgin Media, TalkTalk, BT",
            "1. Sign up on awin.com publisher account\n2. Apply to Sky, Virgin Media & BT affiliate programs\n3. Get API Key from Account > API Credentials",
            "Free (Earns commission per sale)",
            "Easy"
        ],

        # Energy (Gas & Electricity)
        [
            "Gas & Electricity",
            "Energylinx / Switchd B2B Energy API",
            "Energylinx UK / Decision Tech",
            "Live UK energy tariffs (Octopus, British Gas, E.ON Next, OVO), dual fuel rates, price cap comparisons",
            "1. Register at energylinx.co.uk or switchd.co.uk/api\n2. Request B2B API developer key\n3. Complete partner verification",
            "Free API\nEarns £25 - £45 commission per switch",
            "Medium"
        ],
        [
            "Gas & Electricity",
            "Hildebrand Glow Smart Meter API (Utrack)",
            "Hildebrand Technology",
            "Real-time smart meter electricity & gas consumption data (DCC UK network integration)",
            "1. Register at glowmarkt.com / developer.hildebrand.co.uk\n2. Create developer application\n3. Use OAuth2 to authenticate user smart meters",
            "Freemium (Free tier for basic readings;\n~£1-£2/yr per active smart meter)",
            "Complex"
        ],

        # Insurance
        [
            "Insurance",
            "DVLA Vehicle Enquiry API",
            "UK Driver & Vehicle Licensing Agency (Gov.uk)",
            "Exact vehicle make, model, year, fuel type, engine capacity by UK Number Plate (e.g. AB12 CDE)",
            "1. Go to developer-portal.driver-vehicle-licensing.api.gov.uk\n2. Register developer account\n3. Subscribe to 'Vehicle Enquiry API' to get API Key",
            "100% Free (Official UK Govt API)",
            "Easy"
        ],
        [
            "Insurance",
            "Quotezone / CDL Insurance Aggregator API",
            "Quotezone UK / Seopa Ltd",
            "Real-time car & home insurance quotes from 100+ UK insurers",
            "1. Partner application at quotezone.co.uk/b2b\n2. Sign white-label / API affiliate agreement\n3. Receive XML/JSON API endpoint credentials",
            "Revenue Share per quote/policy sold",
            "Complex"
        ],

        # Banking & Finance
        [
            "Banking & Loans",
            "Moneyfacts Consumer API / Monova",
            "Moneyfacts Group UK",
            "Live credit card tariffs (0% balance transfer), personal loan interest rates & mortgage rates",
            "1. Request API access at moneyfactsgroup.co.uk/api\n2. Sign data licensing agreement\n3. Receive REST API Access Key",
            "Subscription (~£150 - £300/month for live financial data feed)",
            "Medium"
        ],
        [
            "Banking & Loans",
            "TrueLayer / Tink Open Banking API",
            "TrueLayer UK",
            "Real-time bank account verification, transaction history & financial analysis",
            "1. Sign up at console.truelayer.com\n2. Create app in Sandbox mode\n3. Obtain Client ID & Secret for Open Banking OAuth2",
            "Freemium (First 100 API calls free,\nthen ~£0.05 per connection)",
            "Medium"
        ],

        # Postcode & Address Validation
        [
            "Postcode & Address",
            "Ideal Postcodes API / Postcodes.io",
            "Ideal Postcodes / Royal Mail PAF",
            "UK Postcode validation, address lookup & geocoding (lat/long coords)",
            "1. Register at ideal-postcodes.co.uk (or use postcodes.io for free public data)\n2. Generate API Key from dashboard\n3. Whitelist your domain",
            "Postcodes.io = 100% Free\nIdeal Postcodes = ~£0.02 per lookup",
            "Easy"
        ]
    ]

    # Style definitions
    font_title = Font(name="Segoe UI", size=16, bold=True, color="1F2937")
    font_header = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    font_body = Font(name="Segoe UI", size=10, color="1E293B")
    
    fill_header = PatternFill(start_color="0F766E", end_color="0F766E", fill_type="solid") # Dark Teal
    fill_zebra = PatternFill(start_color="F0FDFA", end_color="F0FDFA", fill_type="solid") # Mint tint

    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    # Title row
    ws1.merge_cells("A1:G1")
    ws1["A1"] = "Uswitch Real-Time Platform - APIs & Card Machine Guide"
    ws1["A1"].font = font_title
    ws1["A1"].alignment = Alignment(vertical="center", horizontal="left")
    ws1.row_dimensions[1].height = 40

    # Subtitle row
    ws1.merge_cells("A2:G2")
    ws1["A2"] = "Complete guide with card machine integration methods, exact API costs, provider setup links, and developer instructions."
    ws1["A2"].font = Font(name="Segoe UI", size=10, italic=True, color="64748B")
    ws1["A2"].alignment = Alignment(vertical="center", horizontal="left")
    ws1.row_dimensions[2].height = 25

    # Header Row
    ws1.row_dimensions[4].height = 30
    for col_num, header_text in enumerate(headers1, 1):
        cell = ws1.cell(row=4, column=col_num, value=header_text)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(vertical="center", horizontal="center", wrap_text=True)

    # Data Rows
    for row_num, row_data in enumerate(data1, 5):
        ws1.row_dimensions[row_num].height = 75
        is_even = (row_num % 2 == 0)
        for col_num, val in enumerate(row_data, 1):
            cell = ws1.cell(row=row_num, column=col_num, value=val)
            cell.font = font_body
            cell.border = thin_border
            if is_even:
                cell.fill = fill_zebra
            
            cell.alignment = Alignment(vertical="center", horizontal="left", wrap_text=True)

    # Column widths
    ws1.column_dimensions["A"].width = 22
    ws1.column_dimensions["B"].width = 30
    ws1.column_dimensions["C"].width = 25
    ws1.column_dimensions["D"].width = 42
    ws1.column_dimensions["E"].width = 45
    ws1.column_dimensions["F"].width = 32
    ws1.column_dimensions["G"].width = 20

    # Sheet 2: Integration Steps for Developer
    ws2 = wb.create_sheet(title="Backend Code Steps")
    ws2.views.sheetView[0].showGridLines = True

    ws2.merge_cells("A1:D1")
    ws2["A1"] = "How Developer Will Apply Keys in Codebase (Node.js & Card Machine)"
    ws2["A1"].font = font_title
    ws2["A1"].alignment = Alignment(vertical="center", horizontal="left")
    ws2.row_dimensions[1].height = 40

    headers2 = ["Step #", "Integration Target", "File Location", "Exact Developer Implementation"]
    ws2.row_dimensions[3].height = 30
    for col_num, header_text in enumerate(headers2, 1):
        cell = ws2.cell(row=3, column=col_num, value=header_text)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(vertical="center", horizontal="center")

    steps = [
        [
            "Step 1",
            "Store API Keys & Stripe Credentials in `.env`",
            "backend/.env",
            "STRIPE_SECRET_KEY=sk_live_51X...\nSTRIPE_PUBLISHABLE_KEY=pk_live_51X...\nDECISION_TECH_API_KEY=dt_live_xxx\nDVLA_API_KEY=dvla_live_yyy"
        ],
        [
            "Step 2",
            "Install Stripe Payment SDK in Backend",
            "backend/",
            "Run terminal command: npm install stripe\nIn controller: import Stripe from 'stripe'; const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);"
        ],
        [
            "Step 3",
            "Add Card Machine / Payment Checkout API Route",
            "backend/src/routes/api.ts",
            "router.post('/checkout/create-payment-intent', async (req, res) => {\n  const intent = await stripe.paymentIntents.create({ amount: req.body.amount, currency: 'gbp' });\n  res.json({ clientSecret: intent.client_secret });\n});"
        ],
        [
            "Step 4",
            "Connect Frontend Card Payment Modal / Card Machine Reader",
            "frontend/src/components/CheckoutModal.tsx",
            "Use @stripe/stripe-js & @stripe/react-stripe-js to render interactive credit card input form & process instant live payments."
        ],
        [
            "Step 5",
            "Replace Mock Comparison Data with Live APIs",
            "backend/src/controllers/comparisonController.ts",
            "Replace static deal arrays with live axios calls to Decision Tech, Openreach, DVLA, and Energylinx endpoints."
        ]
    ]

    for row_num, row_data in enumerate(steps, 4):
        ws2.row_dimensions[row_num].height = 65
        for col_num, val in enumerate(row_data, 1):
            cell = ws2.cell(row=row_num, column=col_num, value=val)
            cell.font = font_body
            cell.border = thin_border
            cell.alignment = Alignment(vertical="center", horizontal="left", wrap_text=True)

    ws2.column_dimensions["A"].width = 12
    ws2.column_dimensions["B"].width = 35
    ws2.column_dimensions["C"].width = 35
    ws2.column_dimensions["D"].width = 65

    output_path = r"c:\Users\tech solutionor\Desktop\uswitch\Uswitch_APIs_CardMachine_Guide.xlsx"
    wb.save(output_path)
    print(f"Updated Excel file created successfully at: {output_path}")

if __name__ == "__main__":
    generate_excel()
