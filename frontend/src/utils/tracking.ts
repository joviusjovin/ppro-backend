import config from '../config/config';

export const trackPageVisit = async (page: string) => {
  try {
    // Get or create visitor ID from localStorage
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('visitorId', visitorId);
    }

    console.log('Tracking visit:', { page, visitorId, url: `${config.apiUrl}/api/website/track-visit` });

    const response = await fetch(`${config.apiUrl}/api/website/track-visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        page,
        referrer: document.referrer || 'direct',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Track visit response not OK:', response.status, errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Visit tracked successfully:', data);

  } catch (error) {
    console.error('Error tracking visit:', error);
  }
};

export const trackDuration = async (page: string) => {
  try {
    const visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      console.log('No visitorId found for duration tracking');
      return;
    }

    console.log('Tracking duration:', { page, visitorId });

    const response = await fetch(`${config.apiUrl}/api/website/track-duration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        page,
        duration: Math.floor(window.performance.now())
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Track duration response not OK:', response.status, errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Duration tracked successfully:', data);
  } catch (error) {
    console.error('Error tracking duration:', error);
  }
}; 