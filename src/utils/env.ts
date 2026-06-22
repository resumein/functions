export function getEnv<T extends boolean>(key: string, strict: T): T extends true ? string : string | undefined {
    const value = process.env[key];
    if (strict && !value) {
        throw new Error(`Environment variable ${key} is required but not defined`);
    }
    return value as any; // 'as any' is only needed inside this utility helper
}
