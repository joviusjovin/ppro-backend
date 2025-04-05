const apiUrl = import.meta.env.VITE_API_URL || 'https://ppro-backend.onrender.com';

export interface Config {
  apiUrl: string;
  wsUrl: string;
  adminEndpoints: {
    login: string;
    users: string;
    searchUser: (userId: string) => string;
    resetPassword: (userId: string) => string;
    updateUser: (userId: string) => string;
    deleteUser: (userId: string) => string;
    lockUser: (userId: string, action: 'lock' | 'unlock') => string;
    changePassword: string;
    riders: string;
    searchRider: (riderId: string) => string;
    updateRider: (riderId: string) => string;
    deleteRider: (riderId: string) => string;
    analytics: {
      overview: string;
      trends: string;
      categories: string;
      gender: string;
    };
    leadershipRegistrations: {
      base: string;
      update: (id: string) => string;
      delete: (id: string) => string;
      updateStatus: (id: string) => string;
    };
    subscribers: {
      base: string;
      delete: (id: string) => string;
      sendMessage: string;
    };
    dental: {
      stats: string;
      patients: {
        base: string;
        get: (id: string) => string;
        update: (id: string) => string;
        delete: (id: string) => string;
      };
      appointments: {
        base: string;
        get: (id: string) => string;
        update: (id: string) => string;
        delete: (id: string) => string;
        updateStatus: (id: string) => string;
      };
      treatments: {
        base: string;
        get: (id: string) => string;
      };
    };
  };
  publicEndpoints: {
    contact: string;
    trackVisit: string;
    trackDuration: string;
    subscribe: string;
  };
  apiEndpoints: {
    trackVisit: string;
    trackDuration: string;
    websiteAnalytics: string;
  };
}

const config: Config = {
  apiUrl,
  wsUrl: apiUrl.replace(/^http/, 'ws'),
  adminEndpoints: {
    login: '/api/admin/login',
    users: '/api/admin/users',
    searchUser: (userId: string) => `/api/admin/users/search/${userId}`,
    resetPassword: (userId: string) => `/api/admin/users/${userId}/reset-password`,
    updateUser: (userId: string) => `/api/admin/users/${userId}`,
    deleteUser: (userId: string) => `/api/admin/users/${userId}`,
    lockUser: (userId: string, action: 'lock' | 'unlock') => `/api/admin/users/${userId}/${action}`,
    changePassword: '/api/admin/change-password',
    riders: '/api/admin/riders',
    searchRider: (riderId: string) => `/api/admin/riders/${riderId}`,
    updateRider: (riderId: string) => `/api/admin/riders/${riderId}`,
    deleteRider: (riderId: string) => `/api/admin/riders/${riderId}`,
    analytics: {
      overview: '/api/admin/analytics/overview',
      trends: '/api/admin/analytics/trends',
      categories: '/api/admin/analytics/categories',
      gender: '/api/admin/analytics/gender'
    },
    leadershipRegistrations: {
      base: '/api/admin/leadership-registrations',
      update: (id: string) => `/api/admin/leadership-registrations/${id}`,
      delete: (id: string) => `/api/admin/leadership-registrations/${id}`,
      updateStatus: (id: string) => `/api/admin/leadership-registrations/${id}/status`
    },
    subscribers: {
      base: '/api/admin/subscribers',
      delete: (id: string) => `/api/admin/subscribers/${id}`,
      sendMessage: '/api/admin/subscribers/send-message'
    },
    dental: {
      stats: '/api/admin/dental/stats',
      patients: {
        base: '/api/admin/dental/patients',
        get: (id: string) => `/api/admin/dental/patients/${id}`,
        update: (id: string) => `/api/admin/dental/patients/${id}`,
        delete: (id: string) => `/api/admin/dental/patients/${id}`,
      },
      appointments: {
        base: '/api/admin/dental/appointments',
        get: (id: string) => `/api/admin/dental/appointments/${id}`,
        update: (id: string) => `/api/admin/dental/appointments/${id}`,
        delete: (id: string) => `/api/admin/dental/appointments/${id}`,
        updateStatus: (id: string) => `/api/admin/dental/appointments/${id}/status`,
      },
      treatments: {
        base: '/api/admin/dental/treatments',
        get: (id: string) => `/api/admin/dental/treatments/${id}`,
      }
    }
  },
  publicEndpoints: {
    contact: '/api/contact',
    trackVisit: '/api/website/track-visit',
    trackDuration: '/api/website/track-duration',
    subscribe: '/api/subscribe'
  },
  apiEndpoints: {
    trackVisit: '/api/website/track-visit',
    trackDuration: '/api/website/track-duration',
    websiteAnalytics: '/api/admin/website/analytics'
  }
};

export default config;