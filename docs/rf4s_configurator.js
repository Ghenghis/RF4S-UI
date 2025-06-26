/**
 * RF4S Configurator Main Script
 * 
 * This is the main orchestrator script that ties together:
 * - UI state management (rf4s_ui_state.js)
 * - API communication (rf4s_api.js)
 * - AI model integration (rf4s_ai_models.js)
 * 
 * It handles:
 * - Event listeners for UI interactions
 * - Form data handling
 * - Profile management UI
 * - Configuration loading/saving
 */

// Main state
let currentConfig = {};
let profiles = [];

// DOM Elements cache
const domElements = {};

/**
 * Initialize the configurator
 */
async function initConfigurator() {
    // Cache frequently used DOM elements
    cacheElements();
    
    // Register event listeners
    registerEventListeners();
    
    // Initialize UI state
    if (window.setLoading) {
        setLoading(true);
    }
    
    try {
        // Load configuration from server
        currentConfig = await loadConfigFromServer();
        loadConfigToUI(currentConfig);
        
        // Load profiles
        await loadProfiles();
        
        // Initialize AI models if available
        if (window.RF4S && window.RF4S.AI) {
            window.RF4S.AI.init();
        }
    } catch (error) {
        console.error('Error initializing configurator:', error);
        if (window.showNotification) {
            showNotification('Failed to initialize configurator. Please check console for details.', 'error');
        } else {
            alert('Failed to initialize configurator');
        }
    } finally {
        if (window.setLoading) {
            setLoading(false);
        }
    }
}

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
    // Main buttons
    domElements.saveConfigBtn = document.getElementById('save-config-btn');
    domElements.loadConfigBtn = document.getElementById('load-config-btn');
    domElements.resetConfigBtn = document.getElementById('reset-config-btn');
    
    // Profile elements
    domElements.profilesList = document.getElementById('profiles-list');
    domElements.createProfileBtn = document.getElementById('create-profile-btn');
    domElements.profileNameInput = document.getElementById('profile-name');
    
    // Form sections
    domElements.formSections = document.querySelectorAll('.tab-section');
}

/**
 * Register event listeners
 */
function registerEventListeners() {
    // Main buttons
    if (domElements.saveConfigBtn) {
        domElements.saveConfigBtn.addEventListener('click', handleSaveConfig);
    }
    
    if (domElements.loadConfigBtn) {
        domElements.loadConfigBtn.addEventListener('click', handleLoadConfig);
    }
    
    if (domElements.resetConfigBtn) {
        domElements.resetConfigBtn.addEventListener('click', handleResetConfig);
    }
    
    // Profile management
    if (domElements.createProfileBtn) {
        domElements.createProfileBtn.addEventListener('click', handleCreateProfile);
    }
    
    // Form fields validation
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('blur', () => {
            if (window.validateField) {
                validateField(element);
            }
        });
    });
    
    // Collapsible sections
    document.querySelectorAll('.collapsible').forEach(element => {
        element.addEventListener('click', () => toggleSection(element));
    });
}

/**
 * Helper function to get a nested value from an object using a path
 * @param {Object} obj - The object to get the value from
 * @param {Array|string} path - The path to the value (array or dot-separated string)
 * @param {*} defaultValue - The default value to return if the path doesn't exist
 * @returns {*} - The value at the path or the default value
 */
function getNestedValue(obj, path, defaultValue = undefined) {
    if (!obj) return defaultValue;
    
    const parts = Array.isArray(path) ? path : path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length; i++) {
        if (current === undefined || current === null) return defaultValue;
        current = current[parts[i]];
    }
    
    return current !== undefined ? current : defaultValue;
}

/**
 * Helper function to set a nested value in an object using a path
 * @param {Object} obj - The object to set the value in
 * @param {Array|string} path - The path to set the value at (array or dot-separated string)
 * @param {*} value - The value to set
 */
function setNestedValue(obj, path, value) {
    const parts = Array.isArray(path) ? path : path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
}

/**
 * Load configuration data into the UI form
 * @param {Object} config - The configuration object to load
 */
function loadConfigToUI(config) {
    if (!config) return;
    
    // Find all form elements with data-config-path attribute
    document.querySelectorAll('[data-config-path]').forEach(element => {
        const path = element.getAttribute('data-config-path');
        if (!path) return;
        
        const value = getNestedValue(config, path);
        if (value === undefined) return;
        
        // Set value based on input type
        if (element.type === 'checkbox') {
            element.checked = Boolean(value);
        } else if (element.tagName === 'SELECT') {
            element.value = value;
            // Create option if it doesn't exist
            if (element.value !== String(value)) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                element.appendChild(option);
                element.value = value;
            }
        } else {
            element.value = value;
        }
    });
    
    console.log('Configuration loaded to UI');
}

/**
 * Collect form data into a configuration object
 * @returns {Object} - The collected configuration object
 */
function collectFormData() {
    const config = {};
    
    // Find all form elements with data-config-path attribute
    document.querySelectorAll('[data-config-path]').forEach(element => {
        const path = element.getAttribute('data-config-path');
        if (!path) return;
        
        let value;
        
        // Get value based on input type
        if (element.type === 'checkbox') {
            value = element.checked;
        } else if (element.type === 'number') {
            value = element.value === '' ? '' : Number(element.value);
        } else {
            value = element.value;
        }
        
        setNestedValue(config, path, value);
    });
    
    return config;
}

/**
 * Toggle visibility of a collapsible section
 * @param {HTMLElement} element - The header element of the collapsible section
 */
function toggleSection(element) {
    const content = element.nextElementSibling;
    if (content) {
        if (content.style.display === 'none' || content.classList.contains('collapsed-content')) {
            content.style.display = 'block';
            content.classList.remove('collapsed-content');
            element.classList.remove('collapsed');
        } else {
            content.style.display = 'none';
            content.classList.add('collapsed-content');
            element.classList.add('collapsed');
        }
    }
}

/**
 * Validate form fields before saving
 * @returns {boolean} True if validation passes, false otherwise
 */
function validateFormBeforeSave() {
    if (window.validateAllFields && !validateAllFields()) {
        if (window.showNotification) {
            showNotification('Please fix validation errors before saving', 'error');
        }
        return false;
    }
    return true;
}

/**
 * Display notification after save operation
 * @param {Object} result - The result from the save operation
 */
function displaySaveNotification(result) {
    if (window.showNotification) {
        showNotification('Configuration saved successfully', 'success');
    }
    console.log('Configuration saved:', result);
}

/**
 * Handle save configuration button click
 */
async function handleSaveConfig() {
    if (window.setLoading) {
        setLoading(true, 'save-config-btn');
    }
    
    try {
        // Validate form
        if (!validateFormBeforeSave()) {
            return;
        }
        
        // Collect form data
        const config = collectFormData();
        
        // Save to server
        const result = await saveConfigToServer(config);
        
        // Update current config
        currentConfig = config;
        
        // Display notification
        displaySaveNotification(result);
    } catch (error) {
        console.error('Error saving configuration:', error);
        
        if (window.showNotification) {
            const errorMessage = window.handleApiError ? handleApiError(error) : error.message;
            showNotification(`Failed to save configuration: ${errorMessage}`, 'error');
        }
    } finally {
        if (window.setLoading) {
            setLoading(false, 'save-config-btn');
        }
    }
}

/**
 * Handle load configuration button click
 */
async function handleLoadConfig() {
    if (window.setLoading) {
        setLoading(true, 'load-config-btn');
    }
    
    try {
        // Load from server
        const config = await loadConfigFromServer();
        
        // Update current config
        currentConfig = config;
        
        // Load to UI
        loadConfigToUI(config);
        
        if (window.showNotification) {
            showNotification('Configuration loaded successfully', 'success');
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
        
        if (window.showNotification) {
            const errorMessage = window.handleApiError ? handleApiError(error) : error.message;
            showNotification(`Failed to load configuration: ${errorMessage}`, 'error');
        }
    } finally {
        if (window.setLoading) {
            setLoading(false, 'load-config-btn');
        }
    }
}

/**
 * Handle reset configuration button click
 */
async function handleResetConfig() {
    if (!confirm('Are you sure you want to reset to default configuration? All changes will be lost.')) {
        return;
    }
    
    if (window.setLoading) {
        setLoading(true, 'reset-config-btn');
    }
    
    try {
        // Reset from server
        const config = await resetConfigToDefaults();
        
        // Update current config
        currentConfig = config;
        
        // Load to UI
        loadConfigToUI(config);
        
        if (window.showNotification) {
            showNotification('Configuration reset to defaults', 'success');
        }
    } catch (error) {
        console.error('Error resetting configuration:', error);
        
        if (window.showNotification) {
            const errorMessage = window.handleApiError ? handleApiError(error) : error.message;
            showNotification(`Failed to reset configuration: ${errorMessage}`, 'error');
        }
    } finally {
        if (window.setLoading) {
            setLoading(false, 'reset-config-btn');
        }
    }
}

/**
 * Load profiles from server
 */
async function loadProfiles() {
    try {
        profiles = await loadProfilesFromServer();
        renderProfiles();
    } catch (error) {
        console.error('Error loading profiles:', error);
        
        if (window.showNotification) {
            const errorMessage = window.handleApiError ? handleApiError(error) : error.message;
            showNotification(`Failed to load profiles: ${errorMessage}`, 'error');
        }
    }
}

/**
 * Render profiles in the UI
 */
function renderProfiles() {
    if (!domElements.profilesList) return;
    
    // Clear existing profiles
    domElements.profilesList.innerHTML = '';
    
    // Add each profile
    profiles.forEach(profile => {
        addProfileToUI(profile);
    });
}

/**
 * Add a profile to the UI
 * @param {Object} profile - The profile object
 */
function addProfileToUI(profile) {
    if (!domElements.profilesList) return;
    
    const profileItem = document.createElement('div');
    profileItem.className = 'profile-item';
    profileItem.dataset.profileId = profile.id;
    
    const profileHeader = document.createElement('div');
    profileHeader.className = 'profile-header';
    
    const profileName = document.createElement('div');
    profileName.className = 'profile-name';
    profileName.textContent = profile.name;
    
    const profileActions = document.createElement('div');
    profileActions.className = 'profile-actions';
    
    const loadButton = document.createElement('button');
    loadButton.className = 'btn btn-sm btn-primary';
    loadButton.textContent = 'Load';
    loadButton.addEventListener('click', () => handleLoadProfile(profile.id));
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-sm btn-danger';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => handleDeleteProfile(profile.id));
    
    profileActions.appendChild(loadButton);
    profileActions.appendChild(deleteButton);
    
    profileHeader.appendChild(profileName);
    profileHeader.appendChild(profileActions);
    
    profileItem.appendChild(profileHeader);
    
    domElements.profilesList.appendChild(profileItem);
}

/**
 * Validate profile name before creation
 * @param {string} profileName - The profile name to validate
 * @returns {boolean} True if validation passes, false otherwise
 */
function validateProfileName(profileName) {
    if (!profileName) {
        if (window.showNotification) {
            showNotification('Please enter a profile name', 'error');
        }
        return false;
    }
    return true;
}

/**
 * Update UI after successful profile creation
 * @param {Object} profile - The created profile
 * @param {string} profileName - The name of the created profile
 */
function handleSuccessfulProfileCreation(profile, profileName) {
    // Add to profiles list
    profiles.push(profile);
    
    // Render in UI
    addProfileToUI(profile);
    
    // Clear input
    if (domElements.profileNameInput) {
        domElements.profileNameInput.value = '';
    }
    
    if (window.showNotification) {
        showNotification(`Profile "${profileName}" created successfully`, 'success');
    }
}

/**
 * Handle create profile button click
 */
async function handleCreateProfile() {
    const profileName = domElements.profileNameInput ? domElements.profileNameInput.value.trim() : '';
    
    if (!validateProfileName(profileName)) {
        return;
    }
    
    if (window.setLoading) {
        setLoading(true, 'create-profile-btn');
    }
    
    try {
        // Collect current config
        const config = collectFormData();
        
        // Create profile
        const profile = await createProfileOnServer({
            name: profileName,
            config: config
        });
        
        // Update UI
        handleSuccessfulProfileCreation(profile, profileName);
    } catch (error) {
        console.error('Error creating profile:', error);
        
        if (window.showNotification) {
            const errorMessage = window.handleApiError ? handleApiError(error) : error.message;
            showNotification(`Failed to create profile: ${errorMessage}`, 'error');
        }
    } finally {
        if (window.setLoading) {
            setLoading(false, 'create-profile-btn');
        }
    }
}

/**
 * Handle load profile button click
 * @param {string} profileId - The ID of the profile to load
 */
async function handleLoadProfile(profileId) {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    if (window.setLoading) {
        setLoading(true);
    }
    
    try {
        // Load profile config to UI
        loadConfigToUI(profile.config);
        
        // Update current config
        currentConfig = profile.config;
        
        if (window.showNotification) {
            showNotification(`Profile "${profile.name}" loaded successfully`, 'success');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        
        if (window.showNotification) {
            showNotification(`Failed to load profile: ${error.message}`, 'error');
        }
    } finally {
        if (window.setLoading) {
            setLoading(false);
        }
    }
}

/**
 * Confirm profile deletion with the user
 * @param {Object} profile - The profile to delete
 * @returns {boolean} True if user confirms deletion, false otherwise
 */
function confirmProfileDeletion(profile) {
    return confirm(`Are you sure you want to delete profile "${profile.name}"?`);
}

/**
 * Remove profile from UI and data
 * @param {string} profileId - The ID of the profile to remove
 * @param {string} profileName - The name of the profile for notification
 */
function removeProfileFromUI(profileId, profileName) {
    // Remove from profiles list
    profiles = profiles.filter(p => p.id !== profileId);
    
    // Remove from UI
    const profileElement = document.querySelector(`.profile-item[data-profile-id="${profileId}"]`);
    if (profileElement) {
        profileElement.remove();
    }
    
    if (window.showNotification) {
        showNotification(`Profile "${profileName}" deleted successfully`, 'success');
    }
}

/**
 * Handle delete profile button click
 * @param {string} profileId - The ID of the profile to delete
 */
async function handleDeleteProfile(profileId) {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    if (!confirmProfileDeletion(profile)) {
        return;
    }
    
    if (window.setLoading) {
        setLoading(true);
    }
    
    try {
        // Delete from server
        await deleteProfileOnServer(profileId);
        
        // Update UI
        removeProfileFromUI(profileId, profile.name);
    } catch (error) {
        console.error('Error deleting profile:', error);
        
        if (window.showNotification) {
            const errorMessage = window.handleApiError ? handleApiError(error) : error.message;
            showNotification(`Failed to delete profile: ${errorMessage}`, 'error');
        }
    } finally {
        if (window.setLoading) {
            setLoading(false);
        }
    }
}

/**
 * Initialize the configurator
 */
function initConfigurator() {
    console.log('Initializing RF4S Configurator...');
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Register event listeners
    registerEventListeners();
    
    // Load initial configuration
    handleLoadConfig();
    
    // Load profiles
    loadProfiles();
    
    // Initialize AI models if available
    if (window.RF4S && window.RF4S.AI && typeof window.RF4S.AI.init === 'function') {
        window.RF4S.AI.init();
    }
    
    console.log('RF4S Configurator initialized');
}

/**
 * Cache DOM elements for faster access
 */
function cacheDOMElements() {
    // Main action buttons
    domElements.saveConfigBtn = document.getElementById('save-config-btn');
    domElements.loadConfigBtn = document.getElementById('load-config-btn');
    domElements.resetConfigBtn = document.getElementById('reset-config-btn');
    
    // Profile management
    domElements.profilesList = document.getElementById('profiles-list');
    domElements.profileNameInput = document.getElementById('profile-name-input');
    domElements.createProfileBtn = document.getElementById('create-profile-btn');
    
    // Form sections
    domElements.formSections = document.querySelectorAll('.form-section');
    domElements.sectionHeaders = document.querySelectorAll('.section-header');
    
    // Form inputs (all inputs with data-config-path attribute)
    domElements.configInputs = document.querySelectorAll('[data-config-path]');
}

/**
 * Register main action button event listeners
 */
function registerActionButtonListeners() {
    if (domElements.saveConfigBtn) {
        domElements.saveConfigBtn.addEventListener('click', handleSaveConfig);
    }
    
    if (domElements.loadConfigBtn) {
        domElements.loadConfigBtn.addEventListener('click', handleLoadConfig);
    }
    
    if (domElements.resetConfigBtn) {
        domElements.resetConfigBtn.addEventListener('click', handleResetConfig);
    }
}

/**
 * Register profile management event listeners
 */
function registerProfileListeners() {
    if (domElements.createProfileBtn) {
        domElements.createProfileBtn.addEventListener('click', handleCreateProfile);
    }
}

/**
 * Handle input value change and update config
 * @param {HTMLElement} input - The input element that changed
 */
function handleInputChange(input) {
    const path = input.dataset.configPath;
    let value = input.value;
    
    // Convert value based on input type
    if (input.type === 'number') {
        value = parseFloat(value);
    } else if (input.type === 'checkbox') {
        value = input.checked;
    }
    
    // Update current config
    if (path) {
        setNestedValue(currentConfig, path, value);
    }
}

/**
 * Register form field event listeners
 */
function registerFormFieldListeners() {
    domElements.configInputs.forEach(input => {
        // Add validation on blur
        input.addEventListener('blur', function() {
            if (window.validateField) {
                validateField(input);
            }
        });
        
        // Add change listener to update currentConfig
        input.addEventListener('change', function() {
            handleInputChange(this);
        });
    });
}

/**
 * Register collapsible section event listeners
 */
function registerSectionListeners() {
    domElements.sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.closest('.form-section');
            if (section) {
                toggleSection(section);
            }
        });
    });
}

/**
 * Register all event listeners
 */
function registerEventListeners() {
    // Register different types of listeners
    registerActionButtonListeners();
    registerProfileListeners();
    registerFormFieldListeners();
    registerSectionListeners();
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initConfigurator);
