"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jellyfishService = exports.JellyfishService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class JellyfishService {
    constructor() {
        this.token = null;
        this.tokenExpiry = 0;
    }
    /**
     * Get Base URL dynamically from environment
     */
    getBaseUrl() {
        const url = process.env.JELLYFISH_BASE_URL || 'https://medusa.jellyfish.rest';
        return url.replace(/\/$/, '');
    }
    /**
     * Authenticate with Jellyfish API (POST /auth)
     */
    async authenticate(forceRefresh = false) {
        const email = process.env.JELLYFISH_EMAIL;
        const password = process.env.JELLYFISH_PASSWORD;
        const apiKey = process.env.JELLYFISH_API_KEY;
        const shortCode = process.env.JELLYFISH_SHORT_CODE || 'NEPOSOLT';
        // Return cached token if still valid
        if (!forceRefresh && this.token && Date.now() < this.tokenExpiry) {
            return this.token;
        }
        try {
            const payload = {};
            // Prioritize Partner API Key authentication for official developer API Activity logging
            if (shortCode && apiKey) {
                payload.shortCode = shortCode;
                payload.key = apiKey;
            }
            else if (email && password) {
                payload.email = email;
                payload.password = password;
            }
            const response = await fetch(`${this.getBaseUrl()}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Jellyfish Auth failed (${response.status}): ${errorText}`);
            }
            const data = await response.json();
            this.token = data.data?.token || data.token || data.access_token || null;
            console.log(`[Jellyfish Medusa API] Authenticated successfully as partner (${shortCode})`);
            const expStr = data.data?.exp || data.exp;
            if (expStr) {
                this.tokenExpiry = new Date(expStr).getTime() - 60000;
            }
            else {
                const expiresIn = data.expires_in || 3600;
                this.tokenExpiry = Date.now() + (expiresIn - 60) * 1000;
            }
            return this.token || '';
        }
        catch (err) {
            console.warn('Jellyfish authentication notice:', err.message);
            throw err;
        }
    }
    /**
     * Generic authenticated API request helper
     */
    async request(endpoint, options = {}) {
        let token = await this.authenticate();
        const url = `${this.getBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {})
        };
        let response = await fetch(url, {
            ...options,
            headers
        });
        // If unauthorized, retry once with refreshed token
        if (response.status === 401) {
            token = await this.authenticate(true);
            headers['Authorization'] = `Bearer ${token}`;
            response = await fetch(url, {
                ...options,
                headers
            });
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Jellyfish API [${options.method || 'GET'} ${endpoint}] failed (${response.status}): ${errorText}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return (await response.json());
        }
        return (await response.text());
    }
    /**
     * Check Auth Token validity (GET /auth/check)
     */
    async checkAuth() {
        try {
            const token = await this.authenticate();
            const response = await fetch(`${this.getBaseUrl()}/auth/check`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        }
        catch (err) {
            return false;
        }
    }
    // ==================== SEARCHES ====================
    /**
     * Create an energy search comparison (POST /searches)
     */
    async createSearch(params) {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        const startDate = d.toISOString().split('T')[0];
        const ref = `NXG_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const usage = params.fuelType === 'electricity'
            ? (params.annualElecKwh || (params.propertySize === 'small' ? 1800 : params.propertySize === 'large' ? 4300 : 2900))
            : (params.annualGasKwh || (params.propertySize === 'small' ? 6000 : params.propertySize === 'large' ? 17000 : 12000));
        const payload = {
            reference: ref,
            energy: params.fuelType === 'electricity' ? 'electricity' : 'gas',
            usage: Math.round(usage),
            mpxn: params.mpxn || '1537036501',
            startDate: startDate,
            commission: 2.0,
            shortCode: process.env.JELLYFISH_SHORT_CODE || 'NEPOSOLT'
        };
        console.log(`[Jellyfish Medusa API] Sending POST /searches: ref=${ref}, fuel=${payload.energy}, usage=${payload.usage}, shortCode=${payload.shortCode}`);
        const resJson = await this.request('/searches', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return {
            id: resJson.data?.reference || ref,
            ...resJson
        };
    }
    /**
     * List recent searches (GET /searches)
     */
    async listSearches() {
        try {
            const json = await this.request('/searches');
            return (json.data || json);
        }
        catch (err) {
            return [];
        }
    }
    /**
     * Retrieve search comparison results (GET /searches/:id)
     */
    async getSearchResults(searchId) {
        const json = await this.request(`/searches/${searchId}`);
        return json.data?.products || json.products || [];
    }
    /**
     * Delete search (DELETE /searches/:id)
     */
    async deleteSearch(searchId) {
        return await this.request(`/searches/${searchId}`, { method: 'DELETE' });
    }
    // ==================== BULK SEARCHES ====================
    async createBulkSearch(data) {
        return await this.request('/bulk-searches', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async listBulkSearches() {
        try {
            const json = await this.request('/bulk-searches');
            return (json.data || json);
        }
        catch {
            return [];
        }
    }
    async getBulkSearch(id) {
        return await this.request(`/bulk-searches/${id}`);
    }
    async refreshBulkSearch(id) {
        return await this.request(`/bulk-searches/${id}/refresh`, { method: 'POST' });
    }
    async deleteBulkSearch(id) {
        return await this.request(`/bulk-searches/${id}`, { method: 'DELETE' });
    }
    // ==================== CONTRACTS ====================
    /**
     * Create energy switch contract (POST /contracts)
     */
    async createContract(contractData) {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        const startDate = d.toISOString().split('T')[0];
        const payload = {
            channel: process.env.JELLYFISH_SHORT_CODE || 'NEPOSOLT',
            agentEmail: process.env.JELLYFISH_EMAIL || 'myownsales@outlook.com',
            startDate: contractData.startDate || startDate,
            productId: Number(contractData.productId || contractData.dealId) || 7753064,
            energy: contractData.energy || 'gas',
            estimatedAnnualUsage: Number(contractData.estimatedAnnualUsage || contractData.usage) || 12000,
            mpxn: contractData.mpxn || '1537036501',
            commissionPerUnit: 1,
            contact: {
                title: contractData.client?.title || 'Mr',
                firstName: contractData.client?.firstName || 'Valued',
                lastName: contractData.client?.lastName || 'Customer',
                email: contractData.client?.email || 'customer@example.com',
                phone: contractData.client?.phone || '07123456789'
            },
            bank: {
                accountName: contractData.directDebit?.accountName || `${contractData.client?.firstName || 'Customer'} ${contractData.client?.lastName || ''}`.trim(),
                accountNumber: contractData.directDebit?.accountNumber || '12345678',
                sortCode: contractData.directDebit?.sortCode || '200000'
            },
            test: true
        };
        return await this.request('/contracts', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
    async getContracts() {
        try {
            const json = await this.request('/contracts');
            return (json.data || json);
        }
        catch {
            return [];
        }
    }
    async getContract(contractId) {
        return await this.request(`/contracts/${contractId}`);
    }
    async updateContract(contractId, data) {
        return await this.request(`/contracts/${contractId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async getSelectedProduct(contractId) {
        return await this.request(`/contracts/${contractId}/selected-product`);
    }
    async getOnboardingNotes(contractId) {
        return await this.request(`/contracts/${contractId}/onboarding-notes`);
    }
    async getContractClient(contractId) {
        return await this.request(`/contracts/${contractId}/client`);
    }
    async initiateEsign(contractId, signerDetails) {
        return await this.request(`/contracts/${contractId}/esign`, {
            method: 'POST',
            body: JSON.stringify(signerDetails || {})
        });
    }
    async getEsignStatus(contractId) {
        return await this.request(`/contracts/${contractId}/esign/status`);
    }
    async getContractDocument(contractId) {
        const token = await this.authenticate();
        return await fetch(`${this.getBaseUrl()}/contracts/${contractId}/document`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
    async uploadContractDocument(contractId, data) {
        return await this.request(`/contracts/${contractId}/document`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    // ==================== RENEWAL CONTRACTS ====================
    async getRenewalContracts() {
        try {
            const json = await this.request('/renewal-contracts');
            return (json.data || json);
        }
        catch {
            return [];
        }
    }
    async createRenewalContract(data) {
        return await this.request('/renewal-contracts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async getRenewalContract(id) {
        return await this.request(`/renewal-contracts/${id}`);
    }
    async updateRenewalContract(id, data) {
        return await this.request(`/renewal-contracts/${id}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async getRenewalSelectedProduct(id) {
        return await this.request(`/renewal-contracts/${id}/selected-product`);
    }
    async initiateRenewalEsign(id, details) {
        return await this.request(`/renewal-contracts/${id}/esign`, {
            method: 'POST',
            body: JSON.stringify(details || {})
        });
    }
    async getRenewalEsignStatus(id) {
        return await this.request(`/renewal-contracts/${id}/esign/status`);
    }
    async getRenewalContractDocument(id) {
        const token = await this.authenticate();
        return await fetch(`${this.getBaseUrl()}/renewal-contracts/${id}/document`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
    async uploadRenewalContractDocument(id, data) {
        return await this.request(`/renewal-contracts/${id}/document`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    // ==================== BULK CONTRACTS ====================
    async getBulkContracts() {
        try {
            const json = await this.request('/bulk-contracts');
            return (json.data || json);
        }
        catch {
            return [];
        }
    }
    async createBulkContract(data) {
        return await this.request('/bulk-contracts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async getBulkContract(id) {
        return await this.request(`/bulk-contracts/${id}`);
    }
    async updateBulkContract(id, data) {
        return await this.request(`/bulk-contracts/${id}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    async getBulkContractMeters(id) {
        return await this.request(`/bulk-contracts/${id}/meters`);
    }
    async getBulkContractDocument(id) {
        const token = await this.authenticate();
        return await fetch(`${this.getBaseUrl()}/bulk-contracts/${id}/document`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
    async uploadBulkContractDocument(id, data) {
        return await this.request(`/bulk-contracts/${id}/document`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    // ==================== CLIENTS ====================
    async getClients() {
        try {
            const json = await this.request('/clients');
            return (json.data || json);
        }
        catch {
            return [];
        }
    }
    async getClientById(id) {
        return await this.request(`/clients/${id}`);
    }
    async getClientBills(id) {
        return await this.request(`/clients/${id}/bills`);
    }
    async getClientBillLines(id, bid) {
        return await this.request(`/clients/${id}/bills/${bid}/lines`);
    }
    async searchClient(id, query) {
        return await this.request(`/clients/${id}/search${query ? `?query=${encodeURIComponent(query)}` : ''}`);
    }
    // ==================== PAYOUTS ====================
    async getPayouts() {
        try {
            const json = await this.request('/payouts');
            return (json.data || json);
        }
        catch {
            return [];
        }
    }
    async getPayout(id) {
        return await this.request(`/payouts/${id}`);
    }
    async getPayoutsOnHold() {
        try {
            const json = await this.request('/payouts/on-hold');
            return (json.data || json);
        }
        catch {
            return [];
        }
    }
    // ==================== REPORTS ====================
    async getRenewalsReport() {
        return await this.request('/reports/renewals');
    }
    async getObjectionsReport() {
        return await this.request('/reports/objections');
    }
    async getClientRatingsReport() {
        return await this.request('/reports/client-ratings');
    }
}
exports.JellyfishService = JellyfishService;
exports.jellyfishService = new JellyfishService();
