export type Environment = 'local' | 'staging' | 'production';

const environments: Record<
    Environment,
    { uiBaseURL: string; apiBaseURL: string }
> = {
    local: {
        uiBaseURL: 'http://localhost:3000',
        apiBaseURL: 'http://localhost:3001',
    },
    staging: {
        uiBaseURL: 'https://www.saucedemo.com',
        apiBaseURL: 'https://jsonplaceholder.typicode.com',
    },
    production: {
        uiBaseURL: 'https://www.myapp.com', // e.g. https://www.saucedemo.com
        apiBaseURL: 'https://api.myapp.com', // e.g. https://jsonplaceholder.typicode.com
    },
};

export function getEnvironmentConfig() {
    const env = (process.env.ENVIRONMENT as Environment) ?? 'production';
    const config = environments[env];
    if (!config)
        throw new Error(
            `Unknown ENVIRONMENT: "${env}". Valid values: local, staging, production`
        );
    return config;
}
