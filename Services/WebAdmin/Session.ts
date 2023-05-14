import { JSDOM, DOMWindow, CookieJar } from 'jsdom';
import { Cookie } from "tough-cookie";
import { Logger, dummyLogger } from "ts-log";
import { FileLogger } from '../../SMERSH/Utilities'

export class WebAdminSession {
    private static _instance: WebAdminSession;
    private authCred = "";

    constructor(url: string, authcred: string, cookieJar: CookieJar = new CookieJar(), private readonly log: Logger = dummyLogger) {
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

        this.log = new FileLogger('../logs/info.log')
        this.DOMs[url] = new JSDOM(url)
        this.DOMs[url].window.document.cookie += authCookiePart
    }

    public DOMs: Record<string, JSDOM> = {};

    private CookieJar: CookieJar;


    public static get Instance(): WebAdminSession {
        return this._instance
    }

    public async navigate(url: string) : Promise<JSDOM> {
        let navUrl = url;
        let baseUrl = JSON.parse(process.argv[process.argv.length - 1])["BASE_URL"];

        if (!navUrl.includes(baseUrl)) {
            navUrl = baseUrl + url
            //this.log.info(url, navUrl)
        }
        this.log.info(`navigating to: `, navUrl)

        if (this.DOMs) {
            let DOM = this.DOMs[navUrl]

            if (!DOM) {
                this.DOMs[navUrl] = new JSDOM(navUrl)
            }

            try {
                await this.close(navUrl)
                this.DOMs[navUrl] = await JSDOM.fromURL(navUrl, { cookieJar: this.CookieJar })
            }
            catch (error) {
              this.log.info(error)
            }

            //this.log.info('after fromurl', new Date().toISOString(), Object.entries(this.DOMs));

        } else {
            this.log.error('DOMs were not initialized properly')
        }
        
        return this.DOMs[navUrl];
    }

    public async close(url: string) : Promise<void> {
       // this.log.info(`closing: `, url)

        if (this.DOMs) {
            const DOM = this.DOMs[url]

            if (DOM.window) {
                await DOM.window.close()
            }
        } else {
            this.log.error('DOMs were not initialized properly')
        }

        return; //this.DOMs[url];
    }



    public static set(url: string, authcred: string) : WebAdminSession {
        if (!this._instance) {
            this._instance = new WebAdminSession(url, authcred)
            this._instance.navigate(url);
        }

        return this._instance
    }

    public static get() : WebAdminSession {
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

        if (!url) {
            return;
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