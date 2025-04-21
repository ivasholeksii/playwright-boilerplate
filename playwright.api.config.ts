import type { PlaywrightTestConfig } from '@playwright/test';
import { BASE_URL } from './constants';

const config: PlaywrightTestConfig = {
    testDir: './tests-api',
    timeout: 30 * 1000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        actionTimeout: 0,
        trace: 'retain-on-failure',
        baseURL: BASE_URL,
        headless: true,
    },
};

export default config;
