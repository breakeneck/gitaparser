/**
 * Retry utility with exponential backoff
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 5)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
 * @param {Function} options.onRetry - Callback called on each retry (attempt, error, delay)
 * @returns {Promise} - Result of the function or throws after all retries
 */
async function retry(fn, options = {}) {
    const {
        maxRetries = 5,
        baseDelay = 1000,
        maxDelay = 30000,
        onRetry = null
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Calculate delay with exponential backoff + jitter
            const delay = Math.min(
                baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
                maxDelay
            );
            
            if (onRetry) {
                onRetry(attempt, error, delay);
            } else {
                console.log(`Retry attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms due to: ${error.message}`);
            }
            
            await sleep(delay);
        }
    }
    
    throw lastError;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { retry, sleep };
