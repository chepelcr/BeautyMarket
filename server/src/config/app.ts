// ---------------------------------------------------------------------------
// APP_CONFIG — static startup configuration (env vars only).
//
// SSM-backed runtime values (Cognito, S3, email/from, SNS, frontend URL, etc.)
// are resolved via initializeAppConfig() in appConfig.ts at startup and
// bridged back into process.env so services pick them up transparently.
// ---------------------------------------------------------------------------
export const APP_CONFIG = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'demo-jwt-secret-for-development-only-change-in-production',

    // AWS Configuration
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,

    // Payment Configuration (optional integrations — not in SSM)
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,

    // External APIs
    TRANSCRIPTION_WEBHOOK_SECRET: process.env.TRANSCRIPTION_WEBHOOK_SECRET,

    // Encryption
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'demo-encryption-key-change-in-production',

    // CORS Configuration
    ALLOWED_ORIGINS: [
        'http://localhost:3000',
        'http://localhost:3001', // Landing client dev server
        'http://localhost:3002', // Dashboard dev server
        'http://localhost:5000',
        'http://localhost:5173', // Vite dev server (dashboard)
        'http://localhost:9000',
        'https://j-markets.jcampos.dev', // Landing page production (legacy domain)
        'https://tsuru.jcampos.dev', // Tsuru landing production (GitHub Pages)
        'https://admin.j-markets.jcampos.dev', // Dashboard production (legacy, being retired)
        'https://pos.j-markets.jcampos.dev', // Tsuru POS production
        // Template organization domains
        'https://jmarkets-demo-example.j-markets.jcampos.dev',
        'https://tech-gadgets-example.j-markets.jcampos.dev',
        'https://vintage-fashion-example.j-markets.jcampos.dev',
        'https://artisan-crafts-example.j-markets.jcampos.dev',
        'https://gourmet-foods-example.j-markets.jcampos.dev',
        'https://fitness-hub-example.j-markets.jcampos.dev',
        'https://pet-care-example.j-markets.jcampos.dev',
        'https://beauty-essentials-example.j-markets.jcampos.dev',
    ]
} as const;
