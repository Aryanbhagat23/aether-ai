// js/utils.js

// This file contains reusable utility functions for the app.

/**
 * A reusable function to make API calls to the backend server.
 * Includes a retry mechanism with exponential backoff for resilience.
 * @param {string} endpoint The server endpoint to call (e.g., 'generate-text').
 * @param {object} payload The data to send in the request body.
 * @returns {Promise<object>} The parsed JSON response from the server.
 */
async function callServerApi(endpoint, payload) {
    const serverUrl = `https://aether-ai-r1dh.onrender.com/${endpoint}`;
    const maxRetries = 5;
    const baseDelay = 1000; // 1 second
    
    for (let retries = 0; retries < maxRetries; retries++) {
        try {
            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            }
            
            if (response.status === 503) {
                const delay = baseDelay * Math.pow(2, retries);
                console.warn(`Service unavailable. Retrying in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw new Error(`Server responded with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Network or server error, retrying...', error);
            const delay = baseDelay * Math.pow(2, retries);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw new Error('Failed to connect to the server after multiple retries.');
}
