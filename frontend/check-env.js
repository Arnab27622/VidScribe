/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Manually load .env files if they exist (Next.js supports both)
const envPaths = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '.env.local')
];

envPaths.forEach(envPath => {
    if (fs.existsSync(envPath)) {
        const envFileContent = fs.readFileSync(envPath, 'utf8');
        envFileContent.split('\n').forEach(line => {
            // Remove BOM and trim whitespace
            const cleanLine = line.replace(/^\uFEFF/, '').trim();
            
            // Ignore empty lines and comments
            if (!cleanLine || cleanLine.startsWith('#')) return;

            const match = cleanLine.match(/^([^=]+?)\s*=\s*(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
});

const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Missing environment variables:');
    missingVars.forEach(varName => {
        console.error('\x1b[31m%s\x1b[0m', ` - ${varName}`);
    });
    console.log('\nPlease check your .env file or deployment environment settings.');
    process.exit(1);
} else {
    console.log('\x1b[32m%s\x1b[0m', '✅ All environment variables are set correctly.');
}
