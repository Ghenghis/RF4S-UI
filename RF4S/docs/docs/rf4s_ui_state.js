/**
 * RF4S UI State Management
 * 
 * This module provides functions for managing UI state, including:
 * - Loading states for buttons
 * - Notification system for user feedback
 * - Form validation
 * - Error handling
 */

// UI State Management
let isLoading = false;
let activeNotification = null;
let validationErrors = {};

/**
 * Set the loading state for the UI
 * @param {boolean} loading - Whether the UI is in a loading state
 * @param {string} buttonId - Optional ID of the specific button to set loading state
 */
function setLoading(loading, buttonId = null) {
    isLoading = loading;
    
    // If a specific button ID is provided, only update that button
    if (buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = loading;
            const loadingIndicator = button.querySelector('.loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = loading ? 'inline-block' : 'none';
            }
        }
        return;
    }
    
    // Otherwise, update all buttons with loading indicators
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = loading;
        const loadingIndicator = button.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = loading ? 'inline-block' : 'none';
        }
    });
}

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info, warning)
 * @param {number} duration - How long to show the notification in ms
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Clear any existing notification
    if (activeNotification) {
        clearTimeout(activeNotification.timeout);
        activeNotification.element.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    // Set timeout to remove
    const timeout = setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => {
            notification.remove();
            if (activeNotification && activeNotification.element === notification) {
                activeNotification = null;
            }
        }, 300); // Wait for fade out animation
    }, duration);
    
    // Store active notification
    activeNotification = {
        element: notification,
        timeout: timeout
    };
    
    return notification;
}

/**
 * Check if a field should be skipped for validation
 * @param {HTMLElement} element - The form element to validate
 * @returns {boolean} - Whether the field should be skipped
 */
function shouldSkipValidation(element) {
    return element.disabled || element.type === 'hidden' || element.style.display === 'none';
}

/**
 * Validate required field
 * @param {HTMLElement} element - The form element to validate
 * @param {string} path - Field path for error tracking
 * @returns {boolean} - Whether the field is valid
 */
function validateRequired(element, path) {
    if (element.required && !element.value) {
        showValidationError(element, 'This field is required');
        validationErrors[path] = 'This field is required';
        return false;
    }
    return true;
}

/**
 * Validate number field
 * @param {HTMLElement} element - The form element to validate
 * @param {string} path - Field path for error tracking
 * @returns {boolean} - Whether the field is valid
 */
function validateNumber(element, path) {
    if (element.type !== 'number') return true;
    
    const value = parseFloat(element.value);
    const min = parseFloat(element.getAttribute('min'));
    const max = parseFloat(element.getAttribute('max'));
    
    if (isNaN(value)) {
        showValidationError(element, 'Please enter a valid number');
        validationErrors[path] = 'Please enter a valid number';
        return false;
    }
    
    if (!isNaN(min) && value < min) {
        showValidationError(element, `Value must be at least ${min}`);
        validationErrors[path] = `Value must be at least ${min}`;
        return false;
    }
    
    if (!isNaN(max) && value > max) {
        showValidationError(element, `Value must be at most ${max}`);
        validationErrors[path] = `Value must be at most ${max}`;
        return false;
    }
    
    return true;
}

/**
 * Validate email field
 * @param {HTMLElement} element - The form element to validate
 * @param {string} path - Field path for error tracking
 * @returns {boolean} - Whether the field is valid
 */
function validateEmail(element, path) {
    if (element.type !== 'email' || !element.value) return true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(element.value)) {
        showValidationError(element, 'Please enter a valid email address');
        validationErrors[path] = 'Please enter a valid email address';
        return false;
    }
    
    return true;
}

/**
 * Validate URL field
 * @param {HTMLElement} element - The form element to validate
 * @param {string} path - Field path for error tracking
 * @returns {boolean} - Whether the field is valid
 */
function validateUrl(element, path) {
    if (element.type !== 'url' || !element.value) return true;
    
    try {
        new URL(element.value);
        return true;
    } catch (e) {
        showValidationError(element, 'Please enter a valid URL');
        validationErrors[path] = 'Please enter a valid URL';
        return false;
    }
}

/**
 * Validate pattern field
 * @param {HTMLElement} element - The form element to validate
 * @param {string} path - Field path for error tracking
 * @returns {boolean} - Whether the field is valid
 */
function validatePattern(element, path) {
    if (!element.pattern || !element.value) return true;
    
    const regex = new RegExp(element.pattern);
    if (!regex.test(element.value)) {
        const patternMessage = element.getAttribute('data-pattern-message') || 'Please match the requested format';
        showValidationError(element, patternMessage);
        validationErrors[path] = patternMessage;
        return false;
    }
    
    return true;
}

/**
 * Validate a form field
 * @param {HTMLElement} element - The form element to validate
 * @returns {boolean} - Whether the field is valid
 */
function validateField(element) {
    // Skip validation for disabled or hidden fields
    if (shouldSkipValidation(element)) {
        return true;
    }
    
    // Get field path for error tracking
    const path = element.getAttribute('data-config-path') || element.id;
    
    // Clear previous validation errors
    clearValidationError(element);
    
    // Run all validations in sequence
    return validateRequired(element, path) && 
           validateNumber(element, path) && 
           validateEmail(element, path) && 
           validateUrl(element, path) && 
           validatePattern(element, path);
}

/**
 * Show validation error for a field
 * @param {HTMLElement} element - The form element
 * @param {string} message - The error message
 */
function showValidationError(element, message) {
    // Add error class to element
    element.classList.add('invalid');
    
    // Create error message element if it doesn't exist
    let errorElement = element.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('validation-error')) {
        errorElement = document.createElement('div');
        errorElement.className = 'validation-error';
        element.parentNode.insertBefore(errorElement, element.nextSibling);
    }
    
    errorElement.textContent = message;
}

/**
 * Clear validation error for a field
 * @param {HTMLElement} element - The form element
 */
function clearValidationError(element) {
    // Remove error class
    element.classList.remove('invalid');
    
    // Remove error message element if it exists
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('validation-error')) {
        errorElement.remove();
    }
}

/**
 * Validate all form fields
 * @returns {boolean} - Whether the form is valid
 */
function validateAllFields() {
    let isValid = true;
    validationErrors = {};
    
    // Validate all form fields with data-config-path attribute
    document.querySelectorAll('[data-config-path], input, select, textarea').forEach(element => {
        if (!validateField(element)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Show validation errors from the backend
 * @param {Object} errors - Object with field paths as keys and error messages as values
 */
function showValidationErrors(errors) {
    if (!errors) return;
    
    for (const [path, message] of Object.entries(errors)) {
        const element = document.querySelector(`[data-config-path="${path}"]`);
        if (element) {
            showValidationError(element, message);
            validationErrors[path] = message;
        }
    }
    
    // If there are validation errors, scroll to the first one
    const firstErrorElement = document.querySelector('.invalid');
    if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Add CSS styles for UI state management
 */
function addUIStateStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Loading indicator */
        .loading-indicator {
            display: none;
            width: 12px;
            height: 12px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
            margin-right: 6px;
            vertical-align: middle;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Form validation */
        input.invalid, select.invalid, textarea.invalid {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }
        
        .validation-error {
            color: #ef4444;
            font-size: 11px;
            margin-top: 2px;
            margin-bottom: 8px;
        }
        
        /* Notification */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            max-width: 300px;
        }
        
        .notification.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification.info {
            background: rgba(59, 130, 246, 0.9);
            color: white;
        }
        
        .notification.success {
            background: rgba(16, 185, 129, 0.9);
            color: white;
        }
        
        .notification.error {
            background: rgba(239, 68, 68, 0.9);
            color: white;
        }
        
        .notification.warning {
            background: rgba(245, 158, 11, 0.9);
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// Initialize UI state management
document.addEventListener('DOMContentLoaded', () => {
    addUIStateStyles();
});
