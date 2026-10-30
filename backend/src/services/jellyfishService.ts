import dotenv from 'dotenv';
dotenv.config();

/**
 * Jellyfish Energy API Service (Medusa Platform)
 * Handles Authentication, Searches, Bulk Searches, Contracts, Renewals, Clients, Payouts, and Reports
 */

export interface EnergySearchParams {
  postcode: string;
  address?: string;
  fuelType: 'both' | 'electricity' | 'gas';
  currentSupplier?: string;
  paymentMethod?: string;
  propertySize?: string;
  annualElecKwh?: number;
  annualGasKwh?: number;
  mpxn?: string;
}

export interface EnergyTariffDeal {
  id: string | number;
  supplierName: string;
  planName: string;
  costMonthly: number;
  costAnnual: number;
  savingAnnual: number;
  elecUnitRate?: number;
  elecStandingCharge?: number;
  gasUnitRate?: number;
  gasStandingCharge?: number;
  contractLength?: number;
  exitFee?: number;
  isGreen: boolean;
  rating: number;
  raw?: any;
}

export class JellyfishService {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get Base URL dynamically from environment
   */
  public getBaseUrl(): string {
    const url = process.env.JELLYFISH_BASE_URL || 'https://medusa.jellyfish.rest';
    return url.replace(/\/$/, '');
  }

  /**
   * Authenticate with Jellyfish API (POST /auth)
   */
  public async authenticate(forceRefresh: boolean = false): Promise<string> {
    const email = process.env.JELLYFISH_EMAIL;
    const password = process.env.JELLYFISH_PASSWORD;
    const apiKey = process.env.JELLYFISH_API_KEY;
    const shortCode = process.env.JELLYFISH_SHORT_CODE || 'NEPOSOLT';

    // Return cached token if still valid
    if (!forceRefresh && this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const payload: Record<string, any> = {};
      // Prioritize Partner API Key authentication for official developer API Activity logging
      if (shortCode && apiKey) {
        payload.shortCode = shortCode;
        payload.key = apiKey;
      } else if (email && password) {
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

      const data: any = await response.json();
      this.token = data.data?.token || data.token || data.access_token || null;
      console.log(`[Jellyfish Medusa API] Authenticated successfully as partner (${shortCode})`);

      const expStr = data.data?.exp || data.exp;
      if (expStr) {
        this.tokenExpiry = new Date(expStr).getTime() - 60000;
      } else {
        const expiresIn = data.expires_in || 3600;
        this.tokenExpiry = Date.now() + (expiresIn - 60) * 1000;
      }

      return this.token || '';
    } catch (err: any) {
      console.warn('Jellyfish authentication notice:', err.message);
      throw err;
    }
  }

  /**
   * Generic authenticated API request helper
   */
  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let token = await this.authenticate();
    const url = `${this.getBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...((options.headers as Record<string, string>) || {})
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
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  }

  /**
   * Check Auth Token validity (GET /auth/check)
   */
  public async checkAuth(): Promise<boolean> {
    try {
      const token = await this.authenticate();
      const response = await fetch(`${this.getBaseUrl()}/auth/check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (err) {
      return false;
    }
  }

  // ==================== SEARCHES ====================

  /**
   * Create an energy search comparison (POST /searches)
   */
  public async createSearch(params: EnergySearchParams): Promise<{ id: string | number; [key: string]: any }> {
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
      commission: 1.0,
      shortCode: process.env.JELLYFISH_SHORT_CODE || 'NEPOSOLT'
    };

    console.log(`[Jellyfish Medusa API] Sending POST /searches: ref=${ref}, fuel=${payload.energy}, usage=${payload.usage}, shortCode=${payload.shortCode}`);

    const resJson = await this.request<any>('/searches', {
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
  public async listSearches(): Promise<any[]> {
    try {
      const json = await this.request<any>('/searches');
      return (json.data || json) as any[];
    } catch (err) {
      return [];
    }
  }

  /**
   * Retrieve search comparison results (GET /searches/:id)
   */
  public async getSearchResults(searchId: string | number): Promise<any[]> {
    const json = await this.request<any>(`/searches/${searchId}`);
    return json.data?.products || json.products || [];
  }

  /**
   * Delete search (DELETE /searches/:id)
   */
  public async deleteSearch(searchId: string | number): Promise<any> {
    return await this.request<any>(`/searches/${searchId}`, { method: 'DELETE' });
  }

  // ==================== BULK SEARCHES ====================

  public async createBulkSearch(data: any): Promise<any> {
    return await this.request<any>('/bulk-searches', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async listBulkSearches(): Promise<any[]> {
    try {
      const json = await this.request<any>('/bulk-searches');
      return (json.data || json) as any[];
    } catch {
      return [];
    }
  }

  public async getBulkSearch(id: string | number): Promise<any> {
    return await this.request<any>(`/bulk-searches/${id}`);
  }

  public async refreshBulkSearch(id: string | number): Promise<any> {
    return await this.request<any>(`/bulk-searches/${id}/refresh`, { method: 'POST' });
  }

  public async deleteBulkSearch(id: string | number): Promise<any> {
    return await this.request<any>(`/bulk-searches/${id}`, { method: 'DELETE' });
  }

  // ==================== CONTRACTS ====================

  /**
   * Create energy switch contract (POST /contracts)
   */
  public async createContract(contractData: any): Promise<any> {
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

    return await this.request<any>('/contracts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async getContracts(): Promise<any[]> {
    try {
      const json = await this.request<any>('/contracts');
      return (json.data || json) as any[];
    } catch {
      return [];
    }
  }

  public async getContract(contractId: string | number): Promise<any> {
    return await this.request<any>(`/contracts/${contractId}`);
  }

  public async updateContract(contractId: string | number, data: any): Promise<any> {
    return await this.request<any>(`/contracts/${contractId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async getSelectedProduct(contractId: string | number): Promise<any> {
    return await this.request<any>(`/contracts/${contractId}/selected-product`);
  }

  public async getOnboardingNotes(contractId: string | number): Promise<any> {
    return await this.request<any>(`/contracts/${contractId}/onboarding-notes`);
  }

  public async getContractClient(contractId: string | number): Promise<any> {
    return await this.request<any>(`/contracts/${contractId}/client`);
  }

  public async initiateEsign(contractId: string | number, signerDetails?: any): Promise<any> {
    return await this.request<any>(`/contracts/${contractId}/esign`, {
      method: 'POST',
      body: JSON.stringify(signerDetails || {})
    });
  }

  public async getEsignStatus(contractId: string | number): Promise<any> {
    return await this.request<any>(`/contracts/${contractId}/esign/status`);
  }

  public async getContractDocument(contractId: string | number): Promise<Response> {
    const token = await this.authenticate();
    return await fetch(`${this.getBaseUrl()}/contracts/${contractId}/document`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  public async uploadContractDocument(contractId: string | number, data: any): Promise<any> {
    return await this.request<any>(`/contracts/${contractId}/document`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ==================== RENEWAL CONTRACTS ====================

  public async getRenewalContracts(): Promise<any[]> {
    try {
      const json = await this.request<any>('/renewal-contracts');
      return (json.data || json) as any[];
    } catch {
      return [];
    }
  }

  public async createRenewalContract(data: any): Promise<any> {
    return await this.request<any>('/renewal-contracts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async getRenewalContract(id: string | number): Promise<any> {
    return await this.request<any>(`/renewal-contracts/${id}`);
  }

  public async updateRenewalContract(id: string | number, data: any): Promise<any> {
    return await this.request<any>(`/renewal-contracts/${id}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async getRenewalSelectedProduct(id: string | number): Promise<any> {
    return await this.request<any>(`/renewal-contracts/${id}/selected-product`);
  }

  public async initiateRenewalEsign(id: string | number, details?: any): Promise<any> {
    return await this.request<any>(`/renewal-contracts/${id}/esign`, {
      method: 'POST',
      body: JSON.stringify(details || {})
    });
  }

  public async getRenewalEsignStatus(id: string | number): Promise<any> {
    return await this.request<any>(`/renewal-contracts/${id}/esign/status`);
  }

  public async getRenewalContractDocument(id: string | number): Promise<Response> {
    const token = await this.authenticate();
    return await fetch(`${this.getBaseUrl()}/renewal-contracts/${id}/document`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  public async uploadRenewalContractDocument(id: string | number, data: any): Promise<any> {
    return await this.request<any>(`/renewal-contracts/${id}/document`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ==================== BULK CONTRACTS ====================

  public async getBulkContracts(): Promise<any[]> {
    try {
      const json = await this.request<any>('/bulk-contracts');
      return (json.data || json) as any[];
    } catch {
      return [];
    }
  }

  public async createBulkContract(data: any): Promise<any> {
    return await this.request<any>('/bulk-contracts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async getBulkContract(id: string | number): Promise<any> {
    return await this.request<any>(`/bulk-contracts/${id}`);
  }

  public async updateBulkContract(id: string | number, data: any): Promise<any> {
    return await this.request<any>(`/bulk-contracts/${id}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async getBulkContractMeters(id: string | number): Promise<any> {
    return await this.request<any>(`/bulk-contracts/${id}/meters`);
  }

  public async getBulkContractDocument(id: string | number): Promise<Response> {
    const token = await this.authenticate();
    return await fetch(`${this.getBaseUrl()}/bulk-contracts/${id}/document`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  public async uploadBulkContractDocument(id: string | number, data: any): Promise<any> {
    return await this.request<any>(`/bulk-contracts/${id}/document`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ==================== CLIENTS ====================

  public async getClients(): Promise<any[]> {
    try {
      const json = await this.request<any>('/clients');
      return (json.data || json) as any[];
    } catch {
      return [];
    }
  }

  public async getClientById(id: string | number): Promise<any> {
    return await this.request<any>(`/clients/${id}`);
  }

  public async getClientBills(id: string | number): Promise<any> {
    return await this.request<any>(`/clients/${id}/bills`);
  }

  public async getClientBillLines(id: string | number, bid: string | number): Promise<any> {
    return await this.request<any>(`/clients/${id}/bills/${bid}/lines`);
  }

  public async searchClient(id: string | number, query?: string): Promise<any> {
    return await this.request<any>(`/clients/${id}/search${query ? `?query=${encodeURIComponent(query)}` : ''}`);
  }

  // ==================== PAYOUTS ====================

  public async getPayouts(): Promise<any[]> {
    try {
      const json = await this.request<any>('/payouts');
      return (json.data || json) as any[];
    } catch {
      return [];
    }
  }

  public async getPayout(id: string | number): Promise<any> {
    return await this.request<any>(`/payouts/${id}`);
  }

  public async getPayoutsOnHold(): Promise<any[]> {
    try {
      const json = await this.request<any>('/payouts/on-hold');
      return (json.data || json) as any[];
    } catch {
      return [];
    }
  }

  // ==================== REPORTS ====================

  public async getRenewalsReport(): Promise<any> {
    return await this.request<any>('/reports/renewals');
  }

  public async getObjectionsReport(): Promise<any> {
    return await this.request<any>('/reports/objections');
  }

  public async getClientRatingsReport(): Promise<any> {
    return await this.request<any>('/reports/client-ratings');
  }
}

export const jellyfishService = new JellyfishService();
