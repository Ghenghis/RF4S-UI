/**
 * RF4S API Communication Module
 * 
 * This module provides functions for communicating with the RF4S backend API, including:
 * - Loading configuration
 * - Saving configuration
 * - Validating configuration
 * - Resetting configuration
 * - Profile management
 */

/**
 * Check if response is successful
 * @param {Response} response - Fetch response object
 * @param {string} errorPrefix - Error message prefix
 * @throws {Error} If response is not ok
 */
function checkResponseStatus(response, errorPrefix) {
    if (!response.ok) {
        throw new Error(`${errorPrefix}: ${response.status} ${response.statusText}`);
    }
}

/**
 * Process JSON response and check for API success flag
 * @param {Object} data - Response data
 * @param {string} errorPrefix - Error message prefix
 * @param {string} [responseKey=null] - Key to extract from response
 * @returns {any} - Processed response data
 * @throws {Error} If API indicates failure
 */
function processApiResponse(data, errorPrefix, responseKey = null) {
    if (data.hasOwnProperty('success') && !data.success) {
        throw new Error(data.message || `${errorPrefix}`);
    }
    
    return responseKey && data.hasOwnProperty(responseKey) ? data[responseKey] : data;
}

/**
 * Helper function to make API requests
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @param {string} errorPrefix - Error message prefix
 * @param {string} [responseKey=null] - Key to extract from response
 * @returns {Promise<any>} - Response data
 */
async function fetchAPI(endpoint, options = {}, errorPrefix, responseKey = null) {
    try {
        const response = await fetch(endpoint, options);
        checkResponseStatus(response, errorPrefix);
        
        const data = await response.json();
        return processApiResponse(data, errorPrefix, responseKey);
    } catch (error) {
        console.error(`Error ${errorPrefix.toLowerCase()}:`, error);
        throw error;
    }
}

/**
 * Creates options for a JSON POST/PUT request
 * @param {string} method - HTTP method (POST, PUT)
 * @param {Object} data - Data to send
 * @returns {Object} - Request options
 */
function createJsonRequestOptions(method, data) {
    return {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
}

/**
 * Helper for GET requests
 * @param {string} endpoint - API endpoint
 * @param {string} errorPrefix - Error message prefix
 * @param {string} [responseKey=null] - Key to extract from response
 * @returns {Promise<any>} - Response data
 */
async function getRequest(endpoint, errorPrefix, responseKey = null) {
    return fetchAPI(endpoint, {}, errorPrefix, responseKey);
}

/**
 * Helper for POST requests with JSON data
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send
 * @param {string} errorPrefix - Error message prefix
 * @param {string} [responseKey=null] - Key to extract from response
 * @returns {Promise<any>} - Response data
 */
async function postJsonRequest(endpoint, data, errorPrefix, responseKey = null) {
    return fetchAPI(
        endpoint,
        createJsonRequestOptions('POST', data),
        errorPrefix,
        responseKey
    );
}

/**
 * Helper for PUT requests with JSON data
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send
 * @param {string} errorPrefix - Error message prefix
 * @param {string} [responseKey=null] - Key to extract from response
 * @returns {Promise<any>} - Response data
 */
async function putJsonRequest(endpoint, data, errorPrefix, responseKey = null) {
    return fetchAPI(
        endpoint,
        createJsonRequestOptions('PUT', data),
        errorPrefix,
        responseKey
    );
}

/**
 * Helper for DELETE requests
 * @param {string} endpoint - API endpoint
 * @param {string} errorPrefix - Error message prefix
 * @returns {Promise<any>} - Response data
 */
async function deleteRequest(endpoint, errorPrefix) {
    return fetchAPI(
        endpoint,
        { method: 'DELETE' },
        errorPrefix
    );
}

/**
 * Load configuration from the server
 * @returns {Promise<Object>} - The configuration object
 */
async function loadConfigFromServer() {
    return getRequest('/api/config', 'Failed to load configuration', 'config');
}

/**
 * Save configuration to the server
 * @param {Object} config - The configuration object to save
 * @returns {Promise<Object>} - The response from the server
 */
async function saveConfigToServer(config) {
    return postJsonRequest('/api/config', { config }, 'Failed to save configuration');
}

/**
 * Validate configuration with the server
 * @param {Object} config - The configuration object to validate
 * @returns {Promise<Object>} - Validation results
 */
async function validateConfigWithServer(config) {
    return postJsonRequest('/api/validate', { config }, 'Failed to validate configuration');
}

/**
 * Reset configuration to defaults
 * @returns {Promise<Object>} - The default configuration
 */
async function resetConfigToDefaults() {
    return postJsonRequest('/api/reset', {}, 'Failed to reset configuration', 'config');
}

/**
 * Load profiles from the server
 * @returns {Promise<Array>} - Array of profile objects
 */
async function loadProfilesFromServer() {
    return getRequest('/api/profiles', 'Failed to load profiles', 'profiles');
}

/**
 * Save profiles to the server
 * @param {Array} profiles - Array of profile objects
 * @returns {Promise<Object>} - The response from the server
 */
async function saveProfilesToServer(profiles) {
    return postJsonRequest('/api/profiles', { profiles }, 'Failed to save profiles');
}

/**
 * Create a new profile on the server
 * @param {Object} profile - The profile object to create
 * @returns {Promise<Object>} - The created profile
 */
async function createProfileOnServer(profile) {
    return postJsonRequest('/api/profiles/create', { profile }, 'Failed to create profile', 'profile');
}

/**
 * Update a profile on the server
 * @param {string} profileId - The ID of the profile to update
 * @param {Object} profileData - The updated profile data
 * @returns {Promise<Object>} - The updated profile
 */
async function updateProfileOnServer(profileId, profileData) {
    return putJsonRequest(`/api/profiles/${profileId}`, { profile: profileData }, 'Failed to update profile', 'profile');
}

/**
 * Delete a profile on the server
 * @param {string} profileId - The ID of the profile to delete
 * @returns {Promise<Object>} - The response from the server
 */
async function deleteProfileOnServer(profileId) {
    return deleteRequest(`/api/profiles/${profileId}`, 'Failed to delete profile');
}

/**
 * Handle API errors
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
function handleApiError(error) {
    console.error('API Error:', error);
    
    // Extract error message if it's a response error
    let message = error.message || 'An unknown error occurred';
    
    // Try to parse JSON error message if available
    if (message.includes('{') && message.includes('}')) {
        try {
            const jsonStart = message.indexOf('{');
            const jsonEnd = message.lastIndexOf('}') + 1;
            const jsonStr = message.substring(jsonStart, jsonEnd);
            const errorObj = JSON.parse(jsonStr);
            
            if (errorObj.message) {
                message = errorObj.message;
            }
        } catch (e) {
            // Ignore JSON parsing errors
        }
    }
    
    return message;
}
