const Logger = {
    log: (tag, message, data) => {
        // Only log your own tags
        if (['Groups','Main','UI'].includes(tag)) {
            console.log(`[${tag}]`, message, data || '');
        }
    },
    warn: (tag, message, data) => {
        if (['Groups','Main','UI'].includes(tag)) {
            console.warn(`[${tag}]`, message, data || '');
        }
    },
    error: (tag, message, data) => {
        if (['Groups','Main','UI'].includes(tag)) {
            console.error(`[${tag}]`, message, data || '');
        }
    }
};
window.Logger = Logger;
