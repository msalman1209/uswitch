import csv

headers = [
    "Category",
    "API / Service Name",
    "Provider / Source",
    "Real-Time Data / Feature Provided",
    "How to Get API Key & Setup Access",
    "Estimated Cost & Pricing Model",
    "Integration Complexity"
]

data = [
    [
        "Card Machine & Payments",
        "Stripe Payments & Terminal API",
        "Stripe UK",
        "Online card checkout (Visa, MC, Apple Pay, Google Pay) + Physical Card Machine integration (Stripe Reader M2/WisePOS E)",
        "1. Sign up at stripe.com/uk\n2. Verify business details & bank account\n3. Go to Developers > API Keys\n4. Copy Publishable & Secret Keys",
        "1.5% + 20p per UK card payment\n£0 Monthly Fee | £0 Setup Fee",
        "Easy"
    ],
    [
        "Card Machine & Payments",
        "Zettle by PayPal POS & Reader API",
        "PayPal Zettle UK",
        "In-person Card Machine payment reader integration, live sale sync & transaction receipts",
        "1. Sign up at zettle.com/gb\n2. Order Zettle Card Reader (£29)\n3. Go to developer.paypal.com > Zettle SDK",
        "1.75% per card transaction\n£0 Monthly Fee | Card Reader from £29",
        "Easy"
    ],
    [
        "Card Machine & Payments",
        "Worldpay / Barclaycard Merchant API",
        "Worldpay UK / Barclaycard",
        "High-volume UK merchant card processing, countertop/portable card terminals, recurring billing",
        "1. Apply for Merchant Account at worldpay.com or barclaycard.co.uk\n2. Complete underwriting & KYC\n3. Access Merchant Portal > API Key",
        "From 0.7% to 1.2% per card transaction\n~£15-£20/mo terminal rental",
        "Medium"
    ],
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
    [
        "Postcode & Address",
        "Ideal Postcodes API / Postcodes.io",
        "Ideal Postcodes / Royal Mail PAF",
        "UK Postcode validation, address lookup & geocoding (lat/long coords)",
        "1. Register at ideal-postcodes.co.uk (or use postcodes.io for free public data)\n2. Generate API Key from dashboard\n3. Whitelist your domain",
        "Postcodes.io = 100% Free | Ideal Postcodes = ~£0.02 per lookup",
        "Easy"
    ]
]

output_csv = r"c:\Users\tech solutionor\Desktop\uswitch\Uswitch_Realtime_APIs_Guide.csv"
with open(output_csv, mode='w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(data)

print(f"CSV file updated successfully at: {output_csv}")
