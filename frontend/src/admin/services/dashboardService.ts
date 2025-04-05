import config from '../../config/config';

export interface DashboardData {
  totalRiders: number;
  newRegistrations: number;
  activeRiders: number;
  genderDistribution: {
    male: number;
    female: number;
  };
  regionDistribution: Array<{
    name: string;
    count: number;
  }>;
  registrationTimeline: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  regions: {
    total: number;
    mostCommon: string;
  };
  bikeStations: {
    total: number;
    mostCommon: string;
  };
}

class DashboardService {
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

  private handleResponse(response: Response) {
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getDashboardData(): Promise<DashboardData> {
    try {
      console.log('Fetching dashboard data...');
      const response = await fetch(`${config.apiUrl}/api/admin/dashboard`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService(); 