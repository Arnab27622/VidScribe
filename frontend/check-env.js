const fs = require('fs');
const path = require('path');

// Manually load .env file if it exists
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envFileContent = fs.readFileSync(envPath, 'utf8');
    envFileContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            process.env[key] = value;
        }
    });
}

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
