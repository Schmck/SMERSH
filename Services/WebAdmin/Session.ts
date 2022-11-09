import { JSDOM, DOMWindow, CookieJar } from 'jsdom';
import { Cookie } from "tough-cookie";
import { Logger, dummyLogger } from "ts-log";
import { parse } from "url-parse";

export class WebAdminSession {
    private static _instance: WebAdminSession = null;
    private readonly log: Logger = dummyLogger;

    constructor(url: string, authcred: string, encoding: string = 'windows-1252', cookieJar: CookieJar = new CookieJar()) {

        const parsed = parse(url)
        const cookieParts: string[] = [
            `authcred=${authcred}`,
            `Domain=${parsed.hostname}`,
            `Path=${parsed.pathName}`
        ];
        const cookie: Cookie = Cookie.parse('; '.concat(cookieParts.join()))

        this.CookieJar = cookieJar;
        this.CookieJar.setCookie(cookie, url)
        this.DOMs = {}
    }

    public DOMs: Record<string, Awaited<JSDOM>>;

    private CookieJar: CookieJar;

    public static get Instance() {
        return this._instance
    }

    public async navigate(url: string) {
        this.log.info(`navigating to: `, url)

        if (this.DOMs) {
            const DOM = this.DOMs[url]

            if (DOM.window) {
                DOM.window.close()
            }
            this.DOMs[url] = await JSDOM.fromURL(url)
        } else {
            this.log.error('DOMs were not initialized properly')
        }

        return this.DOMs[url];
    }

    public async close(url: string) {
        this.log.info(`closing: `, url)

        if (this.DOMs) {
            const DOM = this.DOMs[url]

            if (DOM.window) {
                DOM.window.close()
            }
        } else {
            this.log.error('DOMs were not initialized properly')
        }

        return this.DOMs[url];
    }



    public static set(url: string, authcred: string, encoding: string = 'windows-1252') {
        if (!this._instance) {
            this._instance = new WebAdminSession(url, authcred, encoding)
            this._instance.navigate(url)
        }

        return this._instance
    }


}