export const BASE_URL = 'https://www.saucedemo.com';

export const STANDARD_USER = 'standard_user';
export const LOCKED_OUT_USER = 'locked_out_user';
export const PROBLEM_USER = 'problem_user';
export const PERFORMANCE_GLITCH_USER = 'performance_glitch_user';

export function getUserPass(): string {
    const userPass = process.env.USER_PASS;
    if (!userPass) throw new Error('USER_PASS is not defined in .env file');
    return userPass;
}
