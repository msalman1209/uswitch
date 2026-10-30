const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const wb = XLSX.utils.book_new();

// ==========================================
// SHEET 1: SYSTEM OVERVIEW & ARCHITECTURE
// ==========================================
const overviewData = [
  ['Uswitch Clone & Jellyfish Energy Medusa Platform - System Documentation'],
  ['Generated for Project Architecture & Live Integration'],
  [],
  ['Section', 'Details', 'Notes'],
  ['Project Name', 'Uswitch Energy Comparison & Switching Engine', 'Next.js 16 + Node.js Express + Jellyfish API'],
  ['Core API Platform', 'Jellyfish Energy Medusa Platform', 'https://medusa.jellyfish.rest'],
  ['Partner Account', 'myownsales@outlook.com', 'Role: Partner / Broker Agent'],
  ['Partner Short Code', 'NEPOSOLT', 'Used for sales attribution & commissions'],
  ['Frontend Stack', 'Next.js 16.2.10 (React 19), Lucide Icons, Custom CSS', 'Port 3000 (http://localhost:3000)'],
  ['Backend Stack', 'Node.js Express, TypeScript, Sequelize ORM', 'Port 5000 (http://localhost:5000)'],
  ['Database', 'PostgreSQL (Remote server: 195.35.6.1:5432)', 'Database: testingapp'],
  [],
  ['End-to-End Scenario Workflow'],
  ['Stage', 'Action', 'System Component', 'Description'],
  ['1. Initiation', 'User visits /energy/journey', 'Frontend UI', 'User enters postcode (e.g. SW1A 1AA) and selects fuel type.'],
  ['2. Property & Address', 'User selects address', 'Frontend Stepper', 'Address is confirmed with regional DNO distribution area code.'],
  ['3. Energy Profile', 'User inputs supplier & usage', 'Frontend Stepper', 'Fuel, current supplier, payment method (Direct Debit), and household size (small/med/large) selected.'],
  ['4. Comparison API Call', 'POST /api/energy/jellyfish/search', 'Backend Express', 'Backend validates input and sends payload to Jellyfish Medusa API.'],
  ['5. Authentication', 'POST /auth', 'Jellyfish Medusa API', 'Backend auto-authenticates using partner credentials and retrieves Bearer JWT.'],
  ['6. Search Execution', 'POST /searches', 'Jellyfish Medusa API', 'Medusa creates search record and returns searchId with 8 live tariffs.'],
  ['7. Savings Calculation', 'Price Cap Baseline vs Deals', 'Backend Engine', 'Calculates annual and monthly spend against Ofgem standard variable rates.'],
  ['8. Live Display', 'Render Results Dashboard', 'Frontend UI', 'Displays top deals sorted by highest annual savings with green tags & rating.'],
  ['9. Deal Switch', 'User clicks "Switch to this Deal"', 'Frontend Modal', 'User confirms client contact info and Direct Debit bank details.'],
  ['10. Contract Creation', 'POST /contracts', 'Jellyfish Medusa API', 'Registers legal switch contract on Medusa platform with unique Contract ID.'],
  ['11. E-Signature', 'POST /contracts/:id/esign', 'Jellyfish Medusa API', 'Initiates digital signature ceremony for customer onboarding.'],
  ['12. User Tracking', 'Save to SavedDeal model', 'PostgreSQL DB', 'Records deal in user dashboard with status "switching" for real-time tracking.']
];

const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
wsOverview['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 30 }, { wch: 60 }];
XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview & Architecture');

// ==========================================
// SHEET 2: API ENDPOINTS CATALOG
// ==========================================
const endpointsData = [
  ['Category', 'Method', 'Endpoint URL', 'External Medusa URL', 'Auth Required', 'Description', 'Sample Request', 'Sample Response', 'Status'],
  
  // Jellyfish Energy Core
  ['Energy Comparison', 'POST', '/api/energy/jellyfish/search', 'POST https://medusa.jellyfish.rest/searches', 'Optional Auth', 'Creates energy comparison search & returns live tariffs with calculated savings', '{"postcode":"SW1A 1AA","fuelType":"both","propertySize":"medium"}', '{"searchId":"1537036501","isLiveJellyfish":true,"results":{"deals":[...]}}', '200 OK'],
  ['Energy Comparison', 'GET', '/api/energy/jellyfish/search/:id', 'GET https://medusa.jellyfish.rest/searches/:id', 'Optional Auth', 'Fetches specific Jellyfish search products and tariffs by ID', 'None (URL parameter id)', '{"data":{"reference":"1537036501","products":[...]}}', '200 OK'],
  ['Energy Contract', 'POST', '/api/energy/jellyfish/contract', 'POST https://medusa.jellyfish.rest/contracts', 'Optional Auth', 'Creates an energy switch contract on Medusa and records in user dashboard', '{"dealId":7753064,"client":{"firstName":"Salman","lastName":"Khan"}}', '{"success":true,"contractId":"cnt_173014920","savedDealId":4}', '200 OK'],
  ['Energy Contract', 'POST', '/api/energy/jellyfish/contract/:id/esign', 'POST https://medusa.jellyfish.rest/contracts/:id/esign', 'Optional Auth', 'Initiates digital e-signature ceremony for energy contract', '{"signerEmail":"customer@example.com"}', '{"success":true,"contractId":"cnt_1","status":"awaiting_signature"}', '200 OK'],
  ['Energy Contract', 'GET', '/api/energy/jellyfish/contract/:id/esign/status', 'GET https://medusa.jellyfish.rest/contracts/:id/esign/status', 'Optional Auth', 'Checks digital signature completion status', 'None', '{"contractId":"cnt_1","status":"signed","signedAt":"2026-10-28"}', '200 OK'],
  ['Energy Contract', 'GET', '/api/energy/jellyfish/contract/:id/document', 'GET https://medusa.jellyfish.rest/contracts/:id/document', 'Optional Auth', 'Downloads contract PDF summary document', 'None', 'Binary PDF Application Stream', '200 OK'],

  // Medusa Direct Wrappers (Postman collection)
  ['Medusa Auth', 'POST', '/api/jellyfish/auth', 'POST https://medusa.jellyfish.rest/auth', 'Public', 'Generates fresh Bearer JWT authentication token from Medusa', 'None (loads from environment)', '{"success":true,"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."}', '200 OK'],
  ['Medusa Auth', 'GET', '/api/jellyfish/auth/check', 'GET https://medusa.jellyfish.rest/auth/check', 'Public', 'Verifies if cached Medusa authentication token is still valid', 'None', '{"valid":true}', '200 OK'],
  ['Medusa Searches', 'POST', '/api/jellyfish/searches', 'POST https://medusa.jellyfish.rest/searches', 'Public', 'Direct Medusa search comparison creation', '{"reference":"1537036501","energy":"electricity","usage":2900}', '{"data":{"reference":"1537036501"}}', '200 OK'],
  ['Medusa Searches', 'GET', '/api/jellyfish/searches', 'GET https://medusa.jellyfish.rest/searches', 'Public', 'Lists recent partner energy searches on Medusa', 'None', '[{"reference":"1537036501","createdAt":"2026-10-28"}]', '200 OK'],
  ['Medusa Searches', 'GET', '/api/jellyfish/searches/:id', 'GET https://medusa.jellyfish.rest/searches/:id', 'Public', 'Retrieves search products and rates for specific search', 'None', '{"products":[{"supplierName":"Jellyfish Energy",...}]}', '200 OK'],
  ['Medusa Searches', 'DELETE', '/api/jellyfish/searches/:id', 'DELETE https://medusa.jellyfish.rest/searches/:id', 'Public', 'Deletes search comparison record from Medusa', 'None', '{"success":true}', '200 OK'],
  ['Medusa Bulk', 'POST', '/api/jellyfish/bulk-searches', 'POST https://medusa.jellyfish.rest/bulk-searches', 'Public', 'Creates bulk multi-meter comparison searches', '{"searches":[...]}', '{"bulkSearchId":"blk_1"}', '200 OK'],
  ['Medusa Bulk', 'GET', '/api/jellyfish/bulk-searches', 'GET https://medusa.jellyfish.rest/bulk-searches', 'Public', 'Lists all bulk searches created by partner', 'None', '[{"bulkSearchId":"blk_1"}]', '200 OK'],
  ['Medusa Contracts', 'GET', '/api/jellyfish/contracts', 'GET https://medusa.jellyfish.rest/contracts', 'Public', 'Lists all switch contracts submitted by partner', 'None', '[{"id":"cnt_1","status":"submitted"}]', '200 OK'],
  ['Medusa Contracts', 'POST', '/api/jellyfish/contracts', 'POST https://medusa.jellyfish.rest/contracts', 'Public', 'Creates contract directly on Medusa platform', '{"productId":7753064,"energy":"gas","mpxn":"1537036501"}', '{"id":"cnt_1","status":"created"}', '200 OK'],
  ['Medusa Contracts', 'GET', '/api/jellyfish/contracts/:id', 'GET https://medusa.jellyfish.rest/contracts/:id', 'Public', 'Fetches details of specific contract', 'None', '{"id":"cnt_1","contact":{...},"bank":{...}}', '200 OK'],
  ['Medusa Contracts', 'GET', '/api/jellyfish/contracts/:id/selected-product', 'GET https://medusa.jellyfish.rest/contracts/:id/selected-product', 'Public', 'Fetches selected tariff product for contract', 'None', '{"productId":7753064,"name":"Fixed July 2026"}', '200 OK'],
  ['Medusa Contracts', 'GET', '/api/jellyfish/contracts/:id/client', 'GET https://medusa.jellyfish.rest/contracts/:id/client', 'Public', 'Fetches client profile attached to contract', 'None', '{"title":"Mr","firstName":"Salman","lastName":"Khan"}', '200 OK'],
  ['Medusa Renewals', 'GET', '/api/jellyfish/renewal-contracts', 'GET https://medusa.jellyfish.rest/renewal-contracts', 'Public', 'Lists all renewal contracts approaching expiry', 'None', '[{"id":"ren_1","status":"due"}]', '200 OK'],
  ['Medusa Clients', 'GET', '/api/jellyfish/clients', 'GET https://medusa.jellyfish.rest/clients', 'Public', 'Lists clients registered under partner code', 'None', '[{"clientId":"cl_1","name":"Salman Khan"}]', '200 OK'],
  ['Medusa Clients', 'GET', '/api/jellyfish/clients/:id/bills', 'GET https://medusa.jellyfish.rest/clients/:id/bills', 'Public', 'Fetches historical billing statements for client', 'None', '[{"billId":"b_1","amount":106.24}]', '200 OK'],
  ['Medusa Payouts', 'GET', '/api/jellyfish/payouts', 'GET https://medusa.jellyfish.rest/payouts', 'Public', 'Retrieves commission payout records for partner', 'None', '[{"payoutId":"pay_1","amount":45.00,"status":"paid"}]', '200 OK'],
  ['Medusa Reports', 'GET', '/api/jellyfish/reports/renewals', 'GET https://medusa.jellyfish.rest/reports/renewals', 'Public', 'Generates contract renewals summary report', 'None', '{"upcomingRenewals":12,"totalValue":14200}', '200 OK'],

  // App Core Auth & Comparisons
  ['App Auth', 'POST', '/api/auth/register', 'Internal DB', 'Public', 'Registers new user and seeds initial 30-day smart meter data', '{"email":"user@test.com","password":"password123","firstName":"Salman"}', '{"token":"...","user":{"id":1,"email":"user@test.com"}}', '201 Created'],
  ['App Auth', 'POST', '/api/auth/login', 'Internal DB', 'Public', 'Authenticates user and returns JWT token', '{"email":"user@test.com","password":"password123"}', '{"token":"...","user":{"id":1}}', '200 OK'],
  ['App Auth', 'GET', '/api/auth/profile', 'Internal DB', 'Bearer JWT', 'Fetches logged-in user profile details', 'None', '{"id":1,"email":"user@test.com","firstName":"Salman"}', '200 OK'],
  ['App Auth', 'PUT', '/api/auth/profile', 'Internal DB', 'Bearer JWT', 'Updates user profile (name, phone, postcode)', '{"firstName":"Salman","postcode":"SW1A 1AA"}', '{"id":1,"firstName":"Salman"}', '200 OK'],
  ['Comparisons', 'POST', '/api/comparisons/energy', 'Internal DB', 'Optional Auth', 'Fallback internal energy comparison engine', '{"postcode":"SW1A 1AA","fuelType":"both"}', '{"comparisonId":1,"results":{"deals":[...]}}', '200 OK'],
  ['Comparisons', 'POST', '/api/comparisons/broadband', 'Internal DB', 'Optional Auth', 'Broadband speeds & TV bundles comparison engine', '{"postcode":"SW1A 1AA","currentProvider":"BT"}', '{"comparisonId":2,"results":{"deals":[...]}}', '200 OK'],
  ['Comparisons', 'POST', '/api/comparisons/sim', 'Internal DB', 'Optional Auth', '5G SIM-only contracts comparison engine', '{"postcode":"SW1A 1AA"}', '{"comparisonId":3,"results":{"deals":[...]}}', '200 OK'],
  ['Comparisons', 'POST', '/api/comparisons/mobile', 'Internal DB', 'Optional Auth', 'Handset contracts (iPhone, Samsung) comparison engine', '{"handsetName":"iPhone 16 Pro"}', '{"comparisonId":4,"results":{"deals":[...]}}', '200 OK'],
  ['Saved Deals', 'POST', '/api/comparisons/save', 'Internal DB', 'Bearer JWT', 'Saves deal to user dashboard with "switching" status', '{"comparisonId":1,"category":"energy","supplierName":"Jellyfish"}', '{"id":1,"status":"switching"}', '201 Created'],
  ['Saved Deals', 'GET', '/api/deals/saved', 'Internal DB', 'Bearer JWT', 'Lists all switching deals saved by the logged-in user', 'None', '[{"id":1,"category":"energy","status":"switching"}]', '200 OK'],
  ['Saved Deals', 'PUT', '/api/deals/saved/:id', 'Internal DB', 'Bearer JWT', 'Updates deal status (switching -> completed)', '{"status":"completed"}', '{"id":1,"status":"completed"}', '200 OK'],
  ['Utrack Usage', 'GET', '/api/utrack/usage', 'Internal DB', 'Bearer JWT', 'Fetches 30 days of hourly/daily smart meter electricity & gas consumption', 'None', '[{"recordDate":"2026-10-01","electricityUsageKwh":8.2,"gasUsageKwh":22.1}]', '200 OK']
];

const wsEndpoints = XLSX.utils.aoa_to_sheet(endpointsData);
wsEndpoints['!cols'] = [
  { wch: 20 }, { wch: 10 }, { wch: 35 }, { wch: 45 }, { wch: 15 },
  { wch: 45 }, { wch: 40 }, { wch: 45 }, { wch: 12 }
];
XLSX.utils.book_append_sheet(wb, wsEndpoints, 'API Endpoints Catalog');

// ==========================================
// SHEET 3: ENERGY JOURNEY STEP-BY-STEP
// ==========================================
const journeyData = [
  ['Step #', 'Step Name', 'Frontend UI Component', 'User Input / Choices', 'Backend API Route', 'Jellyfish Medusa API Interaction', 'Screen Output'],
  ['1', 'Property Address', 'AddressListPicker & PostcodeBadge', 'Postcode (e.g. SW1A 1AA), Address selection from interactive cards', 'None (Local client state)', 'Postcode determines regional DNO distribution area code', 'Highlighted selected property card with verified postcode'],
  ['2', 'Fuel Selection', 'FuelOptionBoxes (Dual/Elec/Gas)', 'Dual Fuel (Gas & Elec), Electricity Only, or Gas Only', 'None (Local client state)', 'Sets energy parameter ("electricity", "gas", or dual query)', 'Visual 3D card selected with "Most Popular - Save up to £240" badge'],
  ['3', 'Current Supplier', 'SupplierCardsGrid', 'Octopus Energy, British Gas, E.ON Next, EDF, OVO, Scottish Power', 'None (Local client state)', 'Used to establish baseline comparison tariff', 'Supplier brand card with official UK color accent selected'],
  ['4', 'Payment Method', 'PaymentOptionBoxes', 'Monthly Direct Debit, Pay on Receipt of Bill, Prepayment Meter', 'None (Local client state)', 'Direct Debit unlocks cheapest tier rates', 'Option card selected with "Cheapest Tariffs" discount badge'],
  ['5', 'Usage Estimator', 'HomeSizeEstimator / ExactKwhInput', 'Home size (1-2 beds flat, 3 beds house, 4+ beds) or exact kWh', 'None (Local client state)', 'Annual usage kWh passed to usage calculation', 'Live baseline estimate cost card (£124.80/mo) calculated'],
  ['6', 'Live Comparison Results', 'ResultsDashboardGrid & DealCards', 'User views 8 live tariffs, sorts by savings/cost, filters green deals', 'POST /api/energy/jellyfish/search', 'Calls POST /auth and POST /searches, fetches 8 live tariffs from Medusa', 'Live tariffs list with savings tag (£222/yr), ratings, and tariff rate drawer'],
  ['7', 'Switch Execution', 'SwitchDealModal Dialog', 'User enters First Name, Last Name, Email, confirms Direct Debit bank details', 'POST /api/energy/jellyfish/contract', 'Calls POST /contracts on Medusa platform, registers legal energy contract', 'Confirmation dialog with unique Contract ID and link to User Dashboard']
];

const wsJourney = XLSX.utils.aoa_to_sheet(journeyData);
wsJourney['!cols'] = [
  { wch: 8 }, { wch: 22 }, { wch: 30 }, { wch: 40 }, { wch: 35 }, { wch: 45 }, { wch: 40 }
];
XLSX.utils.book_append_sheet(wb, wsJourney, 'Energy Journey Steps');

// ==========================================
// SHEET 4: DATABASE SCHEMA & TABLES
// ==========================================
const schemaData = [
  ['Table Name', 'Column Name', 'Data Type', 'Constraints', 'Default Value', 'Description'],
  
  // Users Table
  ['Users', 'id', 'INTEGER', 'Primary Key, Auto Increment', 'NEXTVAL', 'Unique User ID'],
  ['Users', 'email', 'STRING', 'Unique, Not Null', 'None', 'User login email address'],
  ['Users', 'passwordHash', 'STRING', 'Not Null', 'None', 'Bcrypt hashed password (10 salt rounds)'],
  ['Users', 'firstName', 'STRING', 'Not Null', 'None', 'User legal first name'],
  ['Users', 'lastName', 'STRING', 'Not Null', 'None', 'User legal last name'],
  ['Users', 'postcode', 'STRING', 'Nullable', 'None', 'User UK primary residence postcode'],
  ['Users', 'phone', 'STRING', 'Nullable', 'None', 'Contact mobile telephone number'],
  ['Users', 'createdAt', 'TIMESTAMP WITH TIME ZONE', 'Not Null', 'NOW()', 'Account creation timestamp'],
  ['Users', 'updatedAt', 'TIMESTAMP WITH TIME ZONE', 'Not Null', 'NOW()', 'Last account update timestamp'],

  // Comparisons Table
  ['Comparisons', 'id', 'INTEGER', 'Primary Key, Auto Increment', 'NEXTVAL', 'Unique Comparison Search ID'],
  ['Comparisons', 'userId', 'INTEGER', 'Foreign Key (Users.id), Nullable', 'NULL', 'Optional User ID (null for guest searches)'],
  ['Comparisons', 'type', 'ENUM', "'energy', 'broadband', 'sim', 'mobile'", 'None', 'Category of comparison search'],
  ['Comparisons', 'inputData', 'JSONB', 'Not Null', '{}', 'Raw input answers (postcode, fuelType, usage, jellyfishSearchId)'],
  ['Comparisons', 'results', 'JSONB', 'Not Null', '{}', 'Calculated results, baseline costs, and deals array'],
  ['Comparisons', 'createdAt', 'TIMESTAMP WITH TIME ZONE', 'Not Null', 'NOW()', 'Search execution timestamp'],
  ['Comparisons', 'updatedAt', 'TIMESTAMP WITH TIME ZONE', 'Not Null', 'NOW()', 'Search update timestamp'],

  // SavedDeals Table
  ['SavedDeals', 'id', 'INTEGER', 'Primary Key, Auto Increment', 'NEXTVAL', 'Unique Saved Deal / Switch ID'],
  ['SavedDeals', 'userId', 'INTEGER', 'Foreign Key (Users.id), Not Null', 'None', 'User who owns this saved switch deal'],
  ['SavedDeals', 'comparisonId', 'INTEGER', 'Foreign Key (Comparisons.id), Not Null', 'None', 'Original comparison search reference'],
  ['SavedDeals', 'category', 'STRING', 'Not Null', 'None', "Category e.g. 'energy', 'broadband', 'sim'"],
  ['SavedDeals', 'supplierName', 'STRING', 'Not Null', 'None', "Supplier name e.g. 'Jellyfish Energy'"],
  ['SavedDeals', 'planName', 'STRING', 'Not Null', 'None', "Tariff plan name e.g. 'Blue 36 Month'"],
  ['SavedDeals', 'costMonthly', 'FLOAT', 'Not Null', 'None', 'Estimated monthly bill in GBP'],
  ['SavedDeals', 'costAnnual', 'FLOAT', 'Not Null', 'None', 'Estimated annual bill in GBP'],
  ['SavedDeals', 'savingAnnual', 'FLOAT', 'Not Null', 'None', 'Calculated annual saving in GBP'],
  ['SavedDeals', 'status', 'ENUM', "'saved', 'switching', 'completed'", "'switching'", 'Current switching progression stage'],
  ['SavedDeals', 'createdAt', 'TIMESTAMP WITH TIME ZONE', 'Not Null', 'NOW()', 'Deal creation timestamp'],
  ['SavedDeals', 'updatedAt', 'TIMESTAMP WITH TIME ZONE', 'Not Null', 'NOW()', 'Last status change timestamp'],

  // SmartMeters Table
  ['SmartMeters', 'id', 'INTEGER', 'Primary Key, Auto Increment', 'NEXTVAL', 'Unique Smart Meter Reading ID'],
  ['SmartMeters', 'userId', 'INTEGER', 'Foreign Key (Users.id), Not Null', 'None', 'Associated User ID'],
  ['SmartMeters', 'recordDate', 'DATEONLY', 'Not Null', 'None', 'Reading date (YYYY-MM-DD)'],
  ['SmartMeters', 'electricityUsageKwh', 'FLOAT', 'Not Null', 'None', 'Total daily electricity consumption (kWh)'],
  ['SmartMeters', 'gasUsageKwh', 'FLOAT', 'Not Null', 'None', 'Total daily gas consumption (kWh)'],
  ['SmartMeters', 'electricityCost', 'FLOAT', 'Not Null', 'None', 'Calculated daily electricity cost (GBP)'],
  ['SmartMeters', 'gasCost', 'FLOAT', 'Not Null', 'None', 'Calculated daily gas cost (GBP)'],
  ['SmartMeters', 'createdAt', 'TIMESTAMP WITH TIME ZONE', 'Not Null', 'NOW()', 'Record creation timestamp'],
  ['SmartMeters', 'updatedAt', 'TIMESTAMP WITH TIME ZONE', 'Not Null', 'NOW()', 'Record update timestamp']
];

const wsSchema = XLSX.utils.aoa_to_sheet(schemaData);
wsSchema['!cols'] = [
  { wch: 18 }, { wch: 22 }, { wch: 28 }, { wch: 32 }, { wch: 15 }, { wch: 45 }
];
XLSX.utils.book_append_sheet(wb, wsSchema, 'Database Schema');

// ==========================================
// SHEET 5: POSTMAN SCREENSHOTS RECONCILIATION
// ==========================================
const postmanData = [
  ['Screenshot Folder', 'HTTP Method', 'Medusa Route', 'Backend Wrapper Route', 'Service Implementation', 'Status in Codebase'],
  
  // Image 1: Auth, Searches, Bulk Searches, Contracts
  ['Authentication', 'POST', '/auth', '/api/jellyfish/auth', 'jellyfishService.authenticate()', 'Fully Integrated & Tested'],
  ['Authentication', 'GET', '/auth/check', '/api/jellyfish/auth/check', 'jellyfishService.checkAuth()', 'Fully Integrated & Tested'],
  ['Searches', 'POST', '/searches', '/api/jellyfish/searches', 'jellyfishService.createSearch()', 'Fully Integrated & Tested'],
  ['Searches', 'GET', '/searches', '/api/jellyfish/searches', 'jellyfishService.listSearches()', 'Fully Integrated & Tested'],
  ['Searches', 'GET', '/searches/:id', '/api/jellyfish/searches/:id', 'jellyfishService.getSearchResults()', 'Fully Integrated & Tested'],
  ['Searches', 'DEL', '/searches/:id', '/api/jellyfish/searches/:id', 'jellyfishService.deleteSearch()', 'Fully Integrated & Tested'],
  ['Bulk Searches', 'POST', '/bulk-searches', '/api/jellyfish/bulk-searches', 'jellyfishService.createBulkSearch()', 'Fully Integrated & Tested'],
  ['Bulk Searches', 'GET', '/bulk-searches', '/api/jellyfish/bulk-searches', 'jellyfishService.listBulkSearches()', 'Fully Integrated & Tested'],
  ['Bulk Searches', 'GET', '/bulk-searches/:id', '/api/jellyfish/bulk-searches/:id', 'jellyfishService.getBulkSearch()', 'Fully Integrated & Tested'],
  ['Bulk Searches', 'POST', '/bulk-searches/:id/refresh', '/api/jellyfish/bulk-searches/:id/refresh', 'jellyfishService.refreshBulkSearch()', 'Fully Integrated & Tested'],
  ['Bulk Searches', 'DEL', '/bulk-searches/:id', '/api/jellyfish/bulk-searches/:id', 'jellyfishService.deleteBulkSearch()', 'Fully Integrated & Tested'],
  ['Contracts', 'GET', '/contracts', '/api/jellyfish/contracts', 'jellyfishService.getContracts()', 'Fully Integrated & Tested'],
  ['Contracts', 'POST', '/contracts', '/api/jellyfish/contracts', 'jellyfishService.createContract()', 'Fully Integrated & Tested'],
  ['Contracts', 'GET', '/contracts/:id', '/api/jellyfish/contracts/:id', 'jellyfishService.getContract()', 'Fully Integrated & Tested'],
  ['Contracts', 'POST', '/contracts/:id', '/api/jellyfish/contracts/:id', 'jellyfishService.updateContract()', 'Fully Integrated & Tested'],
  ['Contracts', 'GET', '/contracts/:id/selected-product', '/api/jellyfish/contracts/:id/selected-product', 'jellyfishService.getSelectedProduct()', 'Fully Integrated & Tested'],
  ['Contracts', 'GET', '/contracts/:id/onboarding-notes', '/api/jellyfish/contracts/:id/onboarding-notes', 'jellyfishService.getOnboardingNotes()', 'Fully Integrated & Tested'],
  ['Contracts', 'GET', '/contracts/:id/client', '/api/jellyfish/contracts/:id/client', 'jellyfishService.getContractClient()', 'Fully Integrated & Tested'],
  ['Contracts', 'POST', '/contracts/:id/esign', '/api/jellyfish/contracts/:id/esign', 'jellyfishService.initiateEsign()', 'Fully Integrated & Tested'],
  ['Contracts', 'GET', '/contracts/:id/esign/status', '/api/jellyfish/contracts/:id/esign/status', 'jellyfishService.getEsignStatus()', 'Fully Integrated & Tested'],
  ['Contracts', 'GET', '/contracts/:id/document', '/api/jellyfish/contracts/:id/document', 'jellyfishService.getContractDocument()', 'Fully Integrated & Tested'],
  ['Contracts', 'POST', '/contracts/:id/document', '/api/jellyfish/contracts/:id/document', 'jellyfishService.uploadContractDocument()', 'Fully Integrated & Tested'],

  // Image 2: Renewal Contracts, Bulk Contracts, Clients
  ['Renewal Contracts', 'GET', '/renewal-contracts', '/api/jellyfish/renewal-contracts', 'jellyfishService.getRenewalContracts()', 'Fully Integrated & Tested'],
  ['Renewal Contracts', 'POST', '/renewal-contracts', '/api/jellyfish/renewal-contracts', 'jellyfishService.createRenewalContract()', 'Fully Integrated & Tested'],
  ['Renewal Contracts', 'GET', '/renewal-contracts/:id', '/api/jellyfish/renewal-contracts/:id', 'jellyfishService.getRenewalContract()', 'Fully Integrated & Tested'],
  ['Renewal Contracts', 'POST', '/renewal-contracts/:id', '/api/jellyfish/renewal-contracts/:id', 'jellyfishService.updateRenewalContract()', 'Fully Integrated & Tested'],
  ['Renewal Contracts', 'GET', '/renewal-contracts/:id/selected-product', '/api/jellyfish/renewal-contracts/:id/selected-product', 'jellyfishService.getRenewalSelectedProduct()', 'Fully Integrated & Tested'],
  ['Renewal Contracts', 'POST', '/renewal-contracts/:id/esign', '/api/jellyfish/renewal-contracts/:id/esign', 'jellyfishService.initiateRenewalEsign()', 'Fully Integrated & Tested'],
  ['Renewal Contracts', 'GET', '/renewal-contracts/:id/esign/status', '/api/jellyfish/renewal-contracts/:id/esign/status', 'jellyfishService.getRenewalEsignStatus()', 'Fully Integrated & Tested'],
  ['Renewal Contracts', 'GET', '/renewal-contracts/:id/document', '/api/jellyfish/renewal-contracts/:id/document', 'jellyfishService.getRenewalContractDocument()', 'Fully Integrated & Tested'],
  ['Renewal Contracts', 'POST', '/renewal-contracts/:id/document', '/api/jellyfish/renewal-contracts/:id/document', 'jellyfishService.uploadRenewalContractDocument()', 'Fully Integrated & Tested'],
  ['Bulk Contracts', 'GET', '/bulk-contracts', '/api/jellyfish/bulk-contracts', 'jellyfishService.getBulkContracts()', 'Fully Integrated & Tested'],
  ['Bulk Contracts', 'POST', '/bulk-contracts', '/api/jellyfish/bulk-contracts', 'jellyfishService.createBulkContract()', 'Fully Integrated & Tested'],
  ['Bulk Contracts', 'GET', '/bulk-contracts/:id', '/api/jellyfish/bulk-contracts/:id', 'jellyfishService.getBulkContract()', 'Fully Integrated & Tested'],
  ['Bulk Contracts', 'POST', '/bulk-contracts/:id', '/api/jellyfish/bulk-contracts/:id', 'jellyfishService.updateBulkContract()', 'Fully Integrated & Tested'],
  ['Bulk Contracts', 'GET', '/bulk-contracts/:id/meters', '/api/jellyfish/bulk-contracts/:id/meters', 'jellyfishService.getBulkContractMeters()', 'Fully Integrated & Tested'],
  ['Bulk Contracts', 'GET', '/bulk-contracts/:id/document', '/api/jellyfish/bulk-contracts/:id/document', 'jellyfishService.getBulkContractDocument()', 'Fully Integrated & Tested'],
  ['Bulk Contracts', 'POST', '/bulk-contracts/:id/document', '/api/jellyfish/bulk-contracts/:id/document', 'jellyfishService.uploadBulkContractDocument()', 'Fully Integrated & Tested'],
  ['Clients', 'GET', '/clients', '/api/jellyfish/clients', 'jellyfishService.getClients()', 'Fully Integrated & Tested'],
  ['Clients', 'GET', '/clients/:id', '/api/jellyfish/clients/:id', 'jellyfishService.getClientById()', 'Fully Integrated & Tested'],
  ['Clients', 'GET', '/clients/:id/bills', '/api/jellyfish/clients/:id/bills', 'jellyfishService.getClientBills()', 'Fully Integrated & Tested'],
  ['Clients', 'GET', '/clients/:id/bills/:bid/lines', '/api/jellyfish/clients/:id/bills/:bid/lines', 'jellyfishService.getClientBillLines()', 'Fully Integrated & Tested'],
  ['Clients', 'GET', '/clients/:id/search', '/api/jellyfish/clients/:id/search', 'jellyfishService.searchClient()', 'Fully Integrated & Tested'],

  // Image 3: Payouts & Reports
  ['Payouts', 'GET', '/payouts', '/api/jellyfish/payouts', 'jellyfishService.getPayouts()', 'Fully Integrated & Tested'],
  ['Payouts', 'GET', '/payouts/:id', '/api/jellyfish/payouts/:id', 'jellyfishService.getPayout()', 'Fully Integrated & Tested'],
  ['Payouts', 'GET', '/payouts/on-hold', '/api/jellyfish/payouts/on-hold', 'jellyfishService.getPayoutsOnHold()', 'Fully Integrated & Tested'],
  ['Reports', 'GET', '/reports/renewals', '/api/jellyfish/reports/renewals', 'jellyfishService.getRenewalsReport()', 'Fully Integrated & Tested'],
  ['Reports', 'GET', '/reports/objections', '/api/jellyfish/reports/objections', 'jellyfishService.getObjectionsReport()', 'Fully Integrated & Tested'],
  ['Reports', 'GET', '/reports/client-ratings', '/api/jellyfish/reports/client-ratings', 'jellyfishService.getClientRatingsReport()', 'Fully Integrated & Tested']
];

const wsPostman = XLSX.utils.aoa_to_sheet(postmanData);
wsPostman['!cols'] = [
  { wch: 22 }, { wch: 12 }, { wch: 32 }, { wch: 38 }, { wch: 38 }, { wch: 28 }
];
XLSX.utils.book_append_sheet(wb, wsPostman, 'Medusa Postman Reconciliation');

// Save the workbook
const projectRoot = path.resolve(__dirname, '..', '..');
const outputPath = path.join(projectRoot, 'Uswitch_Jellyfish_API_Documentation.xlsx');
XLSX.writeFile(wb, outputPath);

// Also copy to brain artifacts directory
const brainDir = 'C:\\Users\\Mr Salman\\.gemini\\antigravity\\brain\\9ecd667c-71bd-4b79-ab72-29cd2fb48bcb';
if (fs.existsSync(brainDir)) {
  const brainOutputPath = path.join(brainDir, 'Uswitch_Jellyfish_API_Documentation.xlsx');
  XLSX.writeFile(wb, brainOutputPath);
  console.log('Saved to brain artifacts directory:', brainOutputPath);
}

console.log('Documentation Excel file successfully generated at:', outputPath);

