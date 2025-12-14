/**
 * Suppress Ant Design and React compatibility warnings
 * This file should be imported early in the app lifecycle
 */

if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args: any[]) => {
        const message = args[0];
        
        // Suppress Ant Design React version compatibility warning
        if (
            typeof message === 'string' &&
            (message.includes('[antd: compatible]') ||
             message.includes('antd v5 support React is 16 ~ 18') ||
             message.includes('React is 16 ~ 18'))
        ) {
            return; // Suppress this specific warning
        }
        
        originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
        const message = args[0];
        
        // Suppress Ant Design React version compatibility error
        if (
            typeof message === 'string' &&
            (message.includes('[antd: compatible]') ||
             message.includes('antd v5 support React is 16 ~ 18') ||
             message.includes('React is 16 ~ 18'))
        ) {
            return; // Suppress this specific error
        }
        
        originalError.apply(console, args);
    };
}


