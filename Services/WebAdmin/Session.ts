import { JSDOM, DOMWindow, CookieJar } from 'jsdom';
import { Cookie } from "tough-cookie";
import { Logger, dummyLogger } from "ts-log";
import { FileLogger } from '../../SMERSH/Utilities'

export class WebAdminSession {
    private static _instance: WebAdminSession;
    private authCred = "";

    constructor(url: string, authcred: string, encoding: string = 'windows-1252', cookieJar: CookieJar = new CookieJar(), private readonly log: Logger = dummyLogger) {
        if (!this.DOMs) {
            this.DOMs = {};
        }
        const parsed = WebAdminSession.parse(url)
        const authCookiePart = `authcred=${authcred}`
        const cookie = Cookie.parse(authCookiePart);
        cookie.path = parsed.pathName;
        cookie.domain = parsed.hostname;

        if (!this.authCred) {
            this.authCred = authCookiePart;
        }

        this.CookieJar = cookieJar;
        this.CookieJar.setCookie(cookie, url)

        this.log = new FileLogger('info.log')
        this.DOMs[url] = new JSDOM(url)
        this.DOMs[url].window.document.cookie += authCookiePart
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
            this.log.info(url, navUrl)
        }
        this.log.info(`navigating to: `, navUrl)

        if (this.DOMs) {
            let DOM = this.DOMs[navUrl]

            if (!DOM) {
                this.DOMs[navUrl] = new JSDOM(navUrl)
               
            }
            this.log.info(this.CookieJar)
            //this.log.info('before fromurl', new Date().toISOString(), Object.entries(this.DOMs));
            this.DOMs[navUrl] = await JSDOM.fromURL(navUrl, {cookieJar: this.CookieJar})

            //this.log.info('after fromurl', new Date().toISOString(), Object.entries(this.DOMs));

        } else {
            this.log.error('DOMs were not initialized properly')
        }
        
        return this.DOMs[navUrl];
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