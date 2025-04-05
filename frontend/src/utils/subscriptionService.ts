import config from '../config/config';

export const handleSubscribe = async (email: string) => {
  try {
    const response = await fetch(`${config.apiUrl}${config.publicEndpoints.subscribe}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to subscribe');
    }

    return data;
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
}; 