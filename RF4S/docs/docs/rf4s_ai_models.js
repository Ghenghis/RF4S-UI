/**
 * RF4S AI Model Integration
 * 
 * This module provides integration with various AI models:
 * - Cloud providers (OpenAI/GPT-4o, Google/Gemini, Grok)
 * - Local models via LM Studio
 * - vLLM backend support
 */

// Configuration and state
const aiConfig = {
    providers: {
        openai: {
            name: "OpenAI",
            enabled: false,
            apiKey: "",
            models: [
                { id: "gpt-4o", name: "GPT-4o", type: "chat", capabilities: ["text"] },
                { id: "dall-e-3", name: "DALL-E 3", type: "image", capabilities: ["vision", "generation"] }
            ],
            endpoints: {
                chat: "https://api.openai.com/v1/chat/completions",
                image: "https://api.openai.com/v1/images/generations"
            }
        },
        gemini: {
            name: "Google Gemini",
            enabled: false,
            apiKey: "",
            models: [
                { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", type: "chat", capabilities: ["text", "vision"] }
            ],
            endpoints: {
                chat: "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent"
            }
        },
        grok: {
            name: "Grok",
            enabled: false,
            apiKey: "",
            models: [
                { id: "grok-3", name: "Grok 3", type: "chat", capabilities: ["text"] }
            ],
            endpoints: {
                chat: "https://api.grok.ai/v1/chat/completions"
            }
        },
        lmstudio: {
            name: "LM Studio",
            enabled: false,
            baseUrl: "http://192.168.0.3:1234",
            modelPath: "C:\\Users\\Admin\\.lmstudio\\models",
            models: [], // Will be populated dynamically
            endpoints: {
                models: "/v1/models",
                chat: "/v1/chat/completions",
                completions: "/v1/completions",
                embeddings: "/v1/embeddings"
            }
        },
        vllm: {
            name: "vLLM Backend",
            enabled: false,
            baseUrl: "http://localhost:8000",
            modelPath: "C:\\Users\\Admin\\.lmstudio\\models",
            currentModel: "",
            models: [], // Will be populated from the same directory as LM Studio
            endpoints: {
                models: "/v1/models",
                chat: "/v1/chat/completions",
                completions: "/v1/completions",
                embeddings: "/v1/embeddings"
            },
            status: {
                running: false,
                logs: [],
                stats: {
                    gpu: { used: 0, total: 0 },
                    memory: { used: 0, total: 0 },
                    throughput: 0
                }
            }
        }
    },
    activeProvider: null,
    activeModel: null,
    visionAlwaysOn: true,
    visionProvider: "openai",
    visionModel: "dall-e-3"
};

/**
 * Validate the structure of the loaded AI configuration
 * @param {Object} config - The configuration object to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidAIConfig(config) {
    // Check if config is an object
    if (!config || typeof config !== 'object') {
        console.error('Invalid AI config: not an object');
        return false;
    }
    
    // Check if providers property exists and is an object
    if (!config.providers || typeof config.providers !== 'object') {
        console.error('Invalid AI config: missing or invalid providers');
        return false;
    }
    
    return true;
}

/**
 * Safely merge properties from source to target object
 * @param {Object} target - Target object to merge into
 * @param {Object} source - Source object to merge from
 * @param {Array<string>} [excludeProps] - Properties to exclude from merging
 * @returns {Object} - The merged target object
 */
function safeObjectMerge(target, source, excludeProps = []) {
    if (!source || typeof source !== 'object') {
        return target;
    }
    
    // Create a copy of the source without excluded properties
    const filteredSource = {};
    
    Object.keys(source).forEach(key => {
        if (!excludeProps.includes(key)) {
            filteredSource[key] = source[key];
        }
    });
    
    return Object.assign(target, filteredSource);
}

/**
 * Process provider configuration from saved config
 * @param {Object} parsedConfig - Parsed configuration from localStorage
 */
function processProviderConfig(parsedConfig) {
    // Skip if providers property is missing or invalid
    if (!parsedConfig.providers || typeof parsedConfig.providers !== 'object') {
        console.warn('Missing or invalid providers in saved configuration');
        return;
    }
    
    Object.keys(parsedConfig.providers).forEach(provider => {
        // Skip if provider doesn't exist in default config
        if (!aiConfig.providers[provider]) {
            console.warn(`Skipping unknown provider: ${provider}`);
            return;
        }
        
        const providerConfig = parsedConfig.providers[provider];
        
        // Skip if provider config is not an object
        if (!providerConfig || typeof providerConfig !== 'object') {
            console.warn(`Invalid configuration for provider: ${provider}`);
            return;
        }
        
        if (provider === 'lmstudio' || provider === 'vllm') {
            processLocalProviderConfig(provider, providerConfig);
        } else {
            // For cloud providers, safely merge the configs
            safeObjectMerge(aiConfig.providers[provider], providerConfig);
        }
    });
}

/**
 * Process local provider configuration (LM Studio, vLLM)
 * @param {string} provider - Provider name
 * @param {Object} providerConfig - Provider configuration
 */
function processLocalProviderConfig(provider, providerConfig) {
    // Save models before merging
    const savedModels = providerConfig.models || [];
    
    // Merge the configuration, excluding models
    safeObjectMerge(aiConfig.providers[provider], providerConfig, ['models', 'status']);
    
    // Handle models separately to ensure proper format
    if (Array.isArray(savedModels)) {
        aiConfig.providers[provider].models = savedModels;
    }
    
    // For vLLM, preserve status.running if it exists
    if (shouldPreserveVLLMStatus(provider, providerConfig)) {
        aiConfig.providers[provider].status.running = providerConfig.status.running;
    }
}

/**
 * Check if vLLM status.running should be preserved
 * @param {string} provider - Provider name
 * @param {Object} config - Provider configuration
 * @returns {boolean} - True if status.running should be preserved
 */
function shouldPreserveVLLMStatus(provider, config) {
    if (provider !== 'vllm') {
        return false;
    }
    
    if (!config.status) {
        return false;
    }
    
    return typeof config.status.running === 'boolean';
}

/**
 * Set global AI configuration settings
 * @param {Object} parsedConfig - Parsed configuration from localStorage
 */
function setGlobalAISettings(parsedConfig) {
    // Set active provider and model using nullish coalescing
    aiConfig.activeProvider = parsedConfig.activeProvider ?? null;
    aiConfig.activeModel = parsedConfig.activeModel ?? null;
    
    // Set vision settings with defaults using nullish coalescing
    aiConfig.visionAlwaysOn = parsedConfig.visionAlwaysOn ?? true;
    aiConfig.visionProvider = parsedConfig.visionProvider ?? "openai";
    aiConfig.visionModel = parsedConfig.visionModel ?? "dall-e-3";
    
    console.log('Global AI settings loaded:', {
        activeProvider: aiConfig.activeProvider,
        activeModel: aiConfig.activeModel,
        visionEnabled: aiConfig.visionAlwaysOn
    });
}

/**
 * Load configuration from localStorage
 * @returns {boolean} - True if config was loaded successfully, false otherwise
 */
function loadAIConfig() {
    try {
        const savedConfig = localStorage.getItem('rf4s_ai_config');
        
        // If no saved config, use defaults
        if (!savedConfig) {
            console.log('No saved AI configuration found, using defaults');
            return false;
        }
        
        // Parse the saved configuration
        const parsedConfig = JSON.parse(savedConfig);
        
        // Validate the configuration structure
        if (!isValidAIConfig(parsedConfig)) {
            console.error('Invalid AI configuration structure, using defaults');
            return false;
        }
        
        // Process provider configurations
        processProviderConfig(parsedConfig);
        
        // Set global settings
        setGlobalAISettings(parsedConfig);
        
        console.log('AI configuration loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading AI configuration:', error);
        return false;
    }
}

// Save configuration to localStorage
function saveAIConfig() {
    try {
        // Create a copy of the config to sanitize
        const configToSave = JSON.parse(JSON.stringify(aiConfig));
        
        // Remove sensitive data from vLLM status
        if (configToSave.providers.vllm) {
            configToSave.providers.vllm.status = {
                running: aiConfig.providers.vllm.status.running
            };
        }
        
        localStorage.setItem('rf4s_ai_config', JSON.stringify(configToSave));
    } catch (error) {
        console.error('Error saving AI configuration:', error);
    }
}

/**
 * Transform raw LM Studio model data to our standard format
 * @param {Object} data - Response data from LM Studio API
 * @returns {Array} - Processed models array in standard format
 */
function transformLMStudioModels(data) {
    // Check if data has the expected structure
    if (!data || !Array.isArray(data.data)) {
        console.warn('Invalid LM Studio models data structure');
        return [];
    }
    
    // Map the raw model data to our standard format
    return data.data.map(model => ({
        id: model.id,
        name: model.id.split('/').pop(),
        type: "chat",
        capabilities: ["text"],
        details: model
    }));
}

/**
 * Update LM Studio configuration with discovered models
 * @param {Array} models - Processed models array
 */
function updateLMStudioConfig(models) {
    // Update the configuration
    aiConfig.providers.lmstudio.models = models;
    aiConfig.providers.lmstudio.enabled = models.length > 0;
    
    // Log the result
    if (models.length > 0) {
        console.log(`Discovered ${models.length} LM Studio models`);
    } else {
        console.warn('No LM Studio models discovered');
    }
    
    // Save the updated configuration
    saveAIConfig();
}

/**
 * Handle errors in LM Studio model discovery
 * @param {Error} error - The error that occurred
 * @returns {Array} - Empty array
 */
function handleLMStudioDiscoveryError(error) {
    // Log detailed error information
    if (error.name === 'TypeError') {
        console.error('Network error connecting to LM Studio:', error.message);
    } else {
        console.error('Error discovering LM Studio models:', error);
    }
    
    // Update provider status
    aiConfig.providers.lmstudio.enabled = false;
    aiConfig.providers.lmstudio.lastError = {
        timestamp: new Date().toISOString(),
        message: error.message
    };
    
    // Save the updated configuration
    saveAIConfig();
    
    return [];
}

/**
 * Fetch models from LM Studio API
 * @param {string} baseUrl - Base URL of LM Studio API
 * @returns {Promise<Object>} - API response data
 * @throws {Error} If the request fails
 */
async function fetchLMStudioModels(baseUrl) {
    const url = `${baseUrl}/v1/models`;
    console.log(`Fetching models from LM Studio at ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
}

/**
 * Discover local models from LM Studio
 * @returns {Promise<Array>} - Array of discovered models
 */
async function discoverLMStudioModels() {
    try {
        // Clear any previous error
        delete aiConfig.providers.lmstudio.lastError;
        
        // Get base URL from configuration
        const baseUrl = aiConfig.providers.lmstudio.baseUrl;
        if (!baseUrl) {
            throw new Error('LM Studio base URL is not configured');
        }
        
        // Fetch models from API
        const data = await fetchLMStudioModels(baseUrl);
        
        // Transform the data
        const models = transformLMStudioModels(data);
        
        // Update configuration
        updateLMStudioConfig(models);
        
        return models;
    } catch (error) {
        return handleLMStudioDiscoveryError(error);
    }
}

// Scan directory for GGUF models
async function scanForGGUFModels() {
    try {
        // This would normally be a backend call, but for now we'll simulate it
        // In a real implementation, this would be a call to a backend endpoint that scans the directory
        
        // For now, we'll just return a simulated list
        const simulatedModels = [
            { id: "llama3-8b-instruct.Q5_K_M.gguf", name: "Llama 3 8B Instruct Q5_K_M", size: "5.2 GB" },
            { id: "mistral-7b-instruct.Q4_K_M.gguf", name: "Mistral 7B Instruct Q4_K_M", size: "4.1 GB" },
            { id: "phi-2.Q4_K_M.gguf", name: "Phi-2 Q4_K_M", size: "1.8 GB" },
            { id: "openchat-3.5.Q5_K_M.gguf", name: "OpenChat 3.5 Q5_K_M", size: "4.8 GB" }
        ];
        
        // Update vLLM models
        aiConfig.providers.vllm.models = simulatedModels.map(model => ({
            id: model.id,
            name: model.name,
            type: "chat",
            capabilities: ["text"],
            details: { size: model.size }
        }));
        
        saveAIConfig();
        
        return aiConfig.providers.vllm.models;
    } catch (error) {
        console.error('Error scanning for GGUF models:', error);
        return [];
    }
}

/**
 * Make a fetch request to test API connectivity
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string} providerName - Provider name for error messages
 * @returns {Promise<Response>} - Fetch response
 */
async function testApiConnection(url, options, providerName) {
    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`${providerName} API error: ${response.status} ${response.statusText}`);
    }
    
    return response;
}

/**
 * Create a successful connection result
 * @param {string} providerName - Provider name
 * @param {string} [additionalInfo] - Optional additional information
 * @returns {Object} - Success result object
 */
function createSuccessResult(providerName, additionalInfo = '') {
    const message = `Successfully connected to ${providerName} API${additionalInfo ? ` ${additionalInfo}` : ''}`;
    return { success: true, message };
}

/**
 * Test connection to OpenAI API
 * @param {Object} provider - Provider configuration
 * @returns {Promise<Object>} - Connection test result
 */
async function testOpenAIConnection(provider) {
    const options = {
        headers: {
            'Authorization': `Bearer ${provider.apiKey}`
        }
    };
    
    await testApiConnection('https://api.openai.com/v1/models', options, 'OpenAI');
    return createSuccessResult('OpenAI');
}

/**
 * Test connection to Gemini API
 * @param {Object} provider - Provider configuration
 * @returns {Promise<Object>} - Connection test result
 */
async function testGeminiConnection(provider) {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${provider.apiKey}`;
    await testApiConnection(url, {}, 'Gemini');
    return createSuccessResult('Gemini');
}

/**
 * Test connection to Grok API
 * @param {Object} provider - Provider configuration
 * @returns {Promise<Object>} - Connection test result
 */
async function testGrokConnection(provider) {
    const options = {
        headers: {
            'Authorization': `Bearer ${provider.apiKey}`
        }
    };
    
    await testApiConnection('https://api.grok.ai/v1/models', options, 'Grok');
    return createSuccessResult('Grok');
}

/**
 * Create a failed connection result
 * @param {string} message - Error message
 * @returns {Object} - Failed result object
 */
function createFailureResult(message) {
    return { success: false, message };
}

/**
 * Test connection to LM Studio
 * @param {Object} provider - Provider configuration
 * @returns {Promise<Object>} - Connection test result
 */
async function testLMStudioConnection(provider) {
    const models = await discoverLMStudioModels();
    
    if (models.length === 0) {
        return createSuccessResult('LM Studio', 'but no models are currently loaded');
    }
    
    return createSuccessResult('LM Studio', `Found ${models.length} models.`);
}

/**
 * Test connection to vLLM server
 * @param {Object} provider - Provider configuration
 * @returns {Promise<Object>} - Connection test result
 */
async function testVLLMConnection(provider) {
    const response = await fetch(`${provider.baseUrl}/v1/models`).catch(() => null);
    
    if (!response) {
        return createFailureResult("vLLM server is not running. Start the server first.");
    }
    
    if (!response.ok) {
        throw new Error(`vLLM server error: ${response.status} ${response.statusText}`);
    }
    
    return createSuccessResult('vLLM server');
}

/**
 * Test connection to a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>} - Connection test result
 */
async function testProviderConnection(providerId) {
    const provider = aiConfig.providers[providerId];
    
    if (!provider) {
        return createFailureResult("Provider not found");
    }
    
    try {
        // Use a mapping object instead of a switch statement
        const connectionTesters = {
            'openai': testOpenAIConnection,
            'gemini': testGeminiConnection,
            'grok': testGrokConnection,
            'lmstudio': testLMStudioConnection,
            'vllm': testVLLMConnection
        };
        
        const tester = connectionTesters[providerId];
        if (!tester) {
            return createFailureResult("Unknown provider");
        }
        
        return await tester(provider);
    } catch (error) {
        console.error(`Error testing ${providerId} connection:`, error);
        return createFailureResult(`Failed to connect to ${provider.name}: ${error.message}`);
    }
}

/**
 * Add a log entry to vLLM status logs
 * @param {string} message - Log message
 */
function addVLLMLogEntry(message) {
    const timestamp = new Date().toISOString();
    aiConfig.providers.vllm.status.logs.push(`[${timestamp}] ${message}`);
    
    // Keep logs at a reasonable size
    if (aiConfig.providers.vllm.status.logs.length > 100) {
        aiConfig.providers.vllm.status.logs.shift();
    }
}

// Start vLLM server with a specific model
async function startVLLMServer(modelId) {
    try {
        // This would normally be a backend call to start the vLLM server process
        // For now, we'll simulate it
        
        // Update status
        aiConfig.providers.vllm.status.running = true;
        aiConfig.providers.vllm.currentModel = modelId;
        aiConfig.providers.vllm.status.logs = [];
        
        // Add initial log entries
        addVLLMLogEntry(`Starting vLLM server with model: ${modelId}`);
        addVLLMLogEntry(`Loading model from ${aiConfig.providers.vllm.modelPath}\\${modelId}`);
        addVLLMLogEntry(`Server started on ${aiConfig.providers.vllm.baseUrl}`);
        
        // Simulate updating stats periodically
        startVLLMStatsUpdater();
        
        return createSuccessResult('vLLM', `server started with model: ${modelId}`);
    } catch (error) {
        console.error('Error starting vLLM server:', error);
        return createFailureResult(`Failed to start vLLM server: ${error.message}`);
    }
}

// Stop vLLM server
async function stopVLLMServer() {
    try {
        // This would normally be a backend call to stop the vLLM server process
        // For now, we'll simulate it
        
        // Update status
        aiConfig.providers.vllm.status.running = false;
        aiConfig.providers.vllm.currentModel = "";
        addVLLMLogEntry("vLLM server stopped");
        
        // Stop stats updater
        stopVLLMStatsUpdater();
        
        return createSuccessResult('vLLM', 'server stopped');
    } catch (error) {
        console.error('Error stopping vLLM server:', error);
        return createFailureResult(`Failed to stop vLLM server: ${error.message}`);
    }
}

// Simulated vLLM stats updater
let vllmStatsInterval = null;

function startVLLMStatsUpdater() {
    if (vllmStatsInterval) {
        clearInterval(vllmStatsInterval);
    }
    
    vllmStatsInterval = setInterval(() => {
        if (!aiConfig.providers.vllm.status.running) {
            clearInterval(vllmStatsInterval);
            vllmStatsInterval = null;
            return;
        }
        
        // Simulate random stats
        aiConfig.providers.vllm.status.stats = {
            gpu: { 
                used: Math.floor(Math.random() * 8000) + 2000, 
                total: 12000 
            },
            memory: { 
                used: Math.floor(Math.random() * 8) + 4, 
                total: 16 
            },
            throughput: Math.floor(Math.random() * 50) + 10
        };
        
        // Add a log entry occasionally
        if (Math.random() > 0.7) {
            aiConfig.providers.vllm.status.logs.push(
                `[${new Date().toISOString()}] Processed request in ${Math.floor(Math.random() * 500) + 100}ms`
            );
            
            // Keep logs at a reasonable size
            if (aiConfig.providers.vllm.status.logs.length > 100) {
                aiConfig.providers.vllm.status.logs.shift();
            }
        }
        
        // Trigger UI update if we had an update function
        if (typeof updateVLLMStatusUI === 'function') {
            updateVLLMStatusUI();
        }
    }, 2000);
}

function stopVLLMStatsUpdater() {
    if (vllmStatsInterval) {
        clearInterval(vllmStatsInterval);
        vllmStatsInterval = null;
    }
}

/**
 * Create a base request configuration
 * @param {string} url - API endpoint URL
 * @param {Object} headers - Request headers
 * @param {Object} payload - Request payload
 * @returns {Object} - Base request configuration
 */
function createBaseRequestConfig(url, headers, payload) {
    return {
        url,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(payload)
    };
}

/**
 * Prepare request configuration for OpenAI API
 * @param {Object} providerConfig - Provider configuration
 * @param {string} endpoint - API endpoint type
 * @param {Object} payload - Request payload
 * @returns {Object} - Request configuration
 */
function prepareOpenAIRequest(providerConfig, endpoint, payload) {
    const headers = {
        'Authorization': `Bearer ${providerConfig.apiKey}`
    };
    
    return createBaseRequestConfig(
        providerConfig.endpoints[endpoint],
        headers,
        payload
    );
}

/**
 * Prepare request configuration for Gemini API
 * @param {Object} providerConfig - Provider configuration
 * @param {string} endpoint - API endpoint type
 * @param {Object} payload - Request payload
 * @returns {Object} - Request configuration
 */
function prepareGeminiRequest(providerConfig, endpoint, payload) {
    // For Gemini, we append the API key as a query parameter
    const url = `${providerConfig.endpoints[endpoint]}?key=${providerConfig.apiKey}`;
    
    return createBaseRequestConfig(url, {}, payload);
}

/**
 * Prepare request configuration for Grok API
 * @param {Object} providerConfig - Provider configuration
 * @param {string} endpoint - API endpoint type
 * @param {Object} payload - Request payload
 * @returns {Object} - Request configuration
 */
function prepareGrokRequest(providerConfig, endpoint, payload) {
    const headers = {
        'Authorization': `Bearer ${providerConfig.apiKey}`
    };
    
    return createBaseRequestConfig(
        providerConfig.endpoints[endpoint],
        headers,
        payload
    );
}

/**
 * Prepare request configuration for local model servers (LM Studio/vLLM)
 * @param {Object} providerConfig - Provider configuration
 * @param {string} endpoint - API endpoint type
 * @param {Object} payload - Request payload
 * @returns {Object} - Request configuration
 */
function prepareLocalModelRequest(providerConfig, endpoint, payload) {
    const url = `${providerConfig.baseUrl}${providerConfig.endpoints[endpoint]}`;
    
    return createBaseRequestConfig(url, {}, payload);
}

/**
 * Check if provider exists and is enabled
 * @param {string} provider - Provider ID
 * @returns {Object} - Provider configuration
 * @throws {Error} If provider doesn't exist or is disabled
 */
function validateProvider(provider) {
    // Check if provider exists
    if (!aiConfig.providers[provider]) {
        throw new Error(`Provider '${provider}' is not configured`);
    }
    
    // Check if provider is enabled
    const providerConfig = aiConfig.providers[provider];
    if (!providerConfig.enabled) {
        throw new Error(`Provider '${provider}' is disabled`);
    }
    
    return providerConfig;
}

/**
 * Check if endpoint exists for the provider
 * @param {string} provider - Provider ID
 * @param {Object} providerConfig - Provider configuration
 * @param {string} endpoint - API endpoint type
 * @throws {Error} If endpoint doesn't exist
 */
function validateEndpoint(provider, providerConfig, endpoint) {
    if (!providerConfig.endpoints || !providerConfig.endpoints[endpoint]) {
        throw new Error(`Endpoint '${endpoint}' is not defined for provider '${provider}'`);
    }
}

/**
 * Check if local provider server is running
 * @param {string} provider - Provider ID
 * @param {Object} providerConfig - Provider configuration
 * @throws {Error} If server is not running
 */
function validateServerStatus(provider, providerConfig) {
    const isLocalProvider = provider === 'lmstudio' || provider === 'vllm';
    
    if (isLocalProvider && providerConfig.status && !providerConfig.status.running) {
        throw new Error(`${provider.toUpperCase()} server is not running`);
    }
}

/**
 * Check if a specific model exists in the provider's model list
 * @param {Array} models - List of provider models
 * @param {string} modelId - Model ID to check
 * @returns {boolean} - True if model exists, false otherwise
 */
function modelExists(models, modelId) {
    return models.some(model => model.id === modelId);
}

/**
 * Check if model exists in provider configuration
 * @param {string} provider - Provider ID
 * @param {Object} providerConfig - Provider configuration
 * @param {string} model - Model ID
 */
function validateModel(provider, providerConfig, model) {
    // Only validate if model is specified
    if (!model) {
        return;
    }
    
    // Check if model exists in provider configuration
    const models = providerConfig.models || [];
    if (!modelExists(models, model)) {
        console.warn(`Model '${model}' not found in provider '${provider}' configuration`);
        // Not throwing error here as the model might be valid but not in our local config
    }
}

/**
 * Validate payload is a non-null object
 * @param {any} payload - Request payload
 * @throws {Error} If payload is invalid
 */
function validatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid payload: must be a non-null object');
    }
}

/**
 * Validate API call parameters
 * @param {string} provider - Provider ID
 * @param {string} model - Model ID
 * @param {string} endpoint - API endpoint type
 * @param {Object} payload - Request payload
 * @throws {Error} If validation fails
 */
function validateAPICallParams(provider, model, endpoint, payload) {
    const providerConfig = validateProvider(provider);
    validateEndpoint(provider, providerConfig, endpoint);
    validateServerStatus(provider, providerConfig);
    validateModel(provider, providerConfig, model);
    validatePayload(payload);
}

/**
 * Handle API response based on provider
 * @param {string} provider - Provider ID
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} - Processed API response
 * @throws {Error} If response processing fails
 */
async function handleAPIResponse(provider, response) {
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details available');
        throw new Error(`${provider.toUpperCase()} API error (${response.status}): ${errorText}`);
    }
    
    try {
        return await response.json();
    } catch (error) {
        throw new Error(`Failed to parse ${provider.toUpperCase()} API response: ${error.message}`);
    }
}

/**
 * Make the actual API request
 * @param {Object} requestConfig - Request configuration
 * @param {string} provider - Provider ID for error reporting
 * @returns {Promise<Object>} - API response
 */
async function makeAPIRequest(requestConfig, provider) {
    try {
        const response = await fetch(requestConfig.url, {
            method: 'POST',
            headers: requestConfig.headers,
            body: requestConfig.body
        });
        
        return await handleAPIResponse(provider, response);
    } catch (error) {
        // Enhance network errors with more context
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error(`Network error connecting to ${provider.toUpperCase()} API: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Generic function to make AI API calls
 * @param {string} provider - Provider ID
 * @param {string} model - Model ID
 * @param {string} endpoint - API endpoint type
 * @param {Object} payload - Request payload
 * @returns {Promise<Object>} - API response
 */
async function callAIAPI(provider, model, endpoint, payload) {
    try {
        // Validate parameters
        validateAPICallParams(provider, model, endpoint, payload);
        
        const providerConfig = aiConfig.providers[provider];
        
        // Add model to payload if specified
        if (model && !payload.model) {
            payload = { ...payload, model };
        }
        
        // Map providers to their request preparation functions
        const requestPreparers = {
            'openai': prepareOpenAIRequest,
            'gemini': prepareGeminiRequest,
            'grok': prepareGrokRequest,
            'lmstudio': prepareLocalModelRequest,
            'vllm': prepareLocalModelRequest
        };
        
        const preparer = requestPreparers[provider];
        if (!preparer) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        
        // Log API call (without sensitive data)
        console.log(`Calling ${provider.toUpperCase()} API (${endpoint})`, { 
            provider, 
            model, 
            endpoint,
            payloadSize: JSON.stringify(payload).length
        });
        
        // Prepare and make the request
        const requestConfig = preparer(providerConfig, endpoint, payload);
        const response = await makeAPIRequest(requestConfig, provider);
        
        return response;
    } catch (error) {
        console.error(`Error calling ${provider.toUpperCase()} API:`, error);
        throw error;
    }
}

// Initialize the module
function initAIModels() {
    loadAIConfig();
    
    // Check if LM Studio is available
    discoverLMStudioModels().then(models => {
        console.log(`Discovered ${models.length} LM Studio models`);
    });
    
    // Scan for GGUF models
    scanForGGUFModels().then(models => {
        console.log(`Found ${models.length} GGUF models`);
    });
}

// Export functions
window.RF4S = window.RF4S || {};
window.RF4S.AI = {
    config: aiConfig,
    init: initAIModels,
    discoverLMStudioModels,
    scanForGGUFModels,
    testProviderConnection,
    startVLLMServer,
    stopVLLMServer,
    callAIAPI,
    saveConfig: saveAIConfig
};
