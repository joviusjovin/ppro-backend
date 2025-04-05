import config from '../../config/config';

export interface AnalyticsOverview {
  activeRiders: number;
  totalRides: number;
  growth: number;
}

export interface TrendsData {
  labels: string[];
  data: number[];
}

export interface CategoryData {
  taxi: number;
  motorcycle: number;
  bus: number;
  bajaji: number;
  truck: number;
}

export interface GenderData {
  male: number;
  female: number;
}

export type Timeframe = 'day' | 'week' | 'month';

class AnalyticsService {
  private getHeaders() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async handleResponse(response: Response, endpoint: string) {
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${endpoint}):`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
    }
    return response.json();
  }

  async getOverview(timeframe: Timeframe): Promise<AnalyticsOverview> {
    try {
      console.log('Fetching analytics overview:', timeframe);
      const response = await fetch(`${config.apiUrl}/api/admin/analytics/overview?timeframe=${timeframe}`, {
        headers: this.getHeaders(),
        method: 'GET'
      });
      return this.handleResponse(response, 'overview');
    } catch (error) {
      console.error('Analytics overview error:', error);
      throw error;
    }
  }

  async getTrends(timeframe: Timeframe): Promise<TrendsData> {
    try {
      console.log('Fetching analytics trends:', timeframe);
      const response = await fetch(`${config.apiUrl}/api/admin/analytics/trends?timeframe=${timeframe}`, {
        headers: this.getHeaders(),
        method: 'GET'
      });
      return this.handleResponse(response, 'trends');
    } catch (error) {
      console.error('Analytics trends error:', error);
      throw error;
    }
  }

  async getCategories(timeframe: Timeframe): Promise<CategoryData> {
    try {
      console.log('Fetching analytics categories:', timeframe);
      const response = await fetch(`${config.apiUrl}/api/admin/analytics/categories?timeframe=${timeframe}`, {
        headers: this.getHeaders(),
        method: 'GET'
      });
      return this.handleResponse(response, 'categories');
    } catch (error) {
      console.error('Analytics categories error:', error);
      throw error;
    }
  }

  async getGenderDistribution(timeframe: Timeframe): Promise<GenderData> {
    try {
      console.log('Fetching gender distribution:', timeframe);
      const response = await fetch(`${config.apiUrl}/api/admin/analytics/gender?timeframe=${timeframe}`, {
        headers: this.getHeaders(),
        method: 'GET'
      });
      return this.handleResponse(response, 'gender');
    } catch (error) {
      console.error('Gender distribution error:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService(); 