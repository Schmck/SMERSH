import { JSDOM } from 'jsdom';
export declare class WebAdminSession {
    private static _instance;
    private readonly log;
    private constructor();
    DOMs: Record<string, Awaited<JSDOM>>;
    private CookieJar;
    static get Instance(): WebAdminSession;
    navigate(url: string): Promise<JSDOM>;
    static set(url: string, authcred: string, encoding?: string): WebAdminSession;
}
