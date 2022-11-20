import { JSDOM, DOMWindow, CookieJar } from 'jsdom';
import { Cookie } from "tough-cookie";
import { Logger, dummyLogger } from "ts-log";

export class WebAdminSession {
    private static _instance: WebAdminSession = null;
    private readonly log: Logger = dummyLogger;

    constructor(url: string, authcred: string, encoding: string = 'windows-1252', cookieJar: CookieJar = new CookieJar()) {
        if (!this.DOMs) {
            this.DOMs = {};
        }
        const parsed = WebAdminSession.parse(url)
        const cookieParts: string[] = [
            `authcred=${authcred}`,
            `Domain=${parsed.hostname}`,
            `Path=${parsed.pathName}`
        ];
        const cookie = Cookie.parse(cookieParts[0]);
        cookie.path = parsed.pathName;
        cookie.domain = parsed.hostname;
       
        this.CookieJar = cookieJar;
        this.CookieJar.setCookie(cookie, url)

        
        this.DOMs[url] = new JSDOM(url)
    }

    public DOMs: Record<string, Awaited<JSDOM>> = {};

    private CookieJar: CookieJar;

    public static get Instance() {
        return this._instance
    }

    public async navigate(url: string) {
        let navUrl = url;

        if (navUrl !== process.env["BASE_URL"]) {
            navUrl = process.env["BASE_URL"] + url
        }
        this.log.info(`navigating to: `, url)

        if (this.DOMs) {
            let DOM = this.DOMs[url]

            if (!DOM) {
                this.DOMs[navUrl] = new JSDOM(navUrl)
                DOM = this.DOMs[navUrl]
            }

            if (DOM.window) {
                DOM.window.close()
            }
            this.DOMs[navUrl] = await JSDOM.fromURL(navUrl)
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
            const pathName = this.parse(url).pathName;
            this._instance.navigate(url);
        }

        return this._instance
    }

    public static get() {
        if (!this.Instance) {
            return null;
        }
        return this._instance
    }

    private static parse(url: string) {
        const parts = {
            head: '',
            hostname: '',
            pathName: ''
        }

        if (url.includes('//')) {
            parts.head = `${url.split('//')[0]}//`
            url = url.split('//')[1]
        }
        if (url.includes('/')) {
            parts.hostname = url.split('/')[0]
            parts.pathName = `/${url.split('/')[1]}/`
        }

        if (parts.hostname.includes(':')) {
            parts.hostname = parts.hostname.split(':')[0]
        }
        return parts
    }

}