import { JSDOM, DOMWindow, CookieJar } from 'jsdom';
import { Cookie } from "tough-cookie";
import { Logger, dummyLogger } from "ts-log";
import { FileLogger } from '../../SMERSH/Utilities'
import puppeteer, { Browser, Page } from 'puppeteer';

class JSDOMDATE extends JSDOM {

    public date?: Date;
}


export class WebAdminSession {
    private static _instance: WebAdminSession;
    private authCred = "";
    private browser!: Browser;
    private pages: Record<string, { page: Page; date: Date }> = {};
    public CookieJar: CookieJar;

    constructor(url: string, authcred: string, cookieJar: CookieJar = new CookieJar(), private readonly log: Logger = dummyLogger) {
        this.authCred = authcred;
        this.CookieJar = cookieJar;

        this.log = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`);
        this.BaseUrl = process.env["BASE_URL"] || "";

        this.initialize(url).catch(error => this.log.error('Initialization error:', error));
    }

    public BaseUrl: string;

    public static get Instance(): WebAdminSession {
        return this._instance;
    }

    private async initialize(url: string): Promise<void> {
        this.browser = await puppeteer.launch({ headless: true });
        await this.createPage(url);
    }

    public static async set(url: string, authcred: string): Promise<WebAdminSession> {
        if (!this._instance) {
            this._instance = new WebAdminSession(url, authcred);
        }

        return this._instance;
    }

    public static get(): WebAdminSession {
        if (!this.Instance) {
            return null;
        }
        return this._instance;
    }

    private async createPage(url: string): Promise<void> {
        const page = await this.browser.newPage();
        await page.authenticate({ username: this.authCred.split(':')[0], password: this.authCred.split(':')[1] });
        this.pages[url] = { page, date: new Date() };
    }

    public async navigate(url: string): Promise<JSDOM> {
        let navUrl = url;

        if (!navUrl.includes(this.BaseUrl)) {
            navUrl = this.BaseUrl + url;
        }

        this.log.info(`Navigating to: ${navUrl}`);

        let pageRecord = this.pages[navUrl];

        if (!pageRecord) {
            await this.createPage(navUrl);
            pageRecord = this.pages[navUrl];
        }

        const page = pageRecord.page;

        if (navUrl.includes('chat') || (Date.now() - pageRecord.date.valueOf()) > 3000) {
            this.log.info(`Re-navigating to: ${navUrl}`);
            await this.setCookiesFromJar(navUrl, page);
            await this.retryGoto(page, navUrl);
            await this.updateCookieJar(page, navUrl);
            this.pages[navUrl].date = new Date();
        }

        const document = await this.createDOMFromPage(page);
        return document;
    }

    private async setCookiesFromJar(url: string, page: Page): Promise<void> {
        const cookies = await this.CookieJar.getCookies(url);
        const puppeteerCookies = cookies.map(cookie => ({
            name: cookie.key,
            value: cookie.value,
            domain: cookie.domain || undefined,
            path: cookie.path,
            expires: cookie.expires instanceof Date ? cookie.expires.getTime() / 1000 : undefined,
            httpOnly: cookie.httpOnly,
            secure: cookie.secure,
            sameSite: cookie.sameSite ? cookie.sameSite as 'Strict' | 'Lax' | 'None' : undefined
        }));
        await page.setCookie(...puppeteerCookies);
    }

    private async retryGoto(page: Page, url: string): Promise<void> {
        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await page.goto(url, { waitUntil: 'networkidle0' });
                return;
            } catch (error) {
                this.log.warn(`Navigation attempt ${attempt} to ${url} failed: ${error}`);
                if (attempt === maxRetries) {
                    throw error;
                }
            }
        }
    }

    private async updateCookieJar(page: Page, url: string): Promise<void> {
        const pageCookies = await page.cookies();
        for (const cookie of pageCookies) {
            const toughCookie = new Cookie({
                key: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path,
                expires: cookie.expires ? new Date(cookie.expires * 1000) : undefined,
                httpOnly: cookie.httpOnly,
                secure: cookie.secure,
                sameSite: cookie.sameSite
            });
            await this.CookieJar.setCookie(toughCookie.toString(), url);
        }
    }

    public async close(url?: string): Promise<void> {
        if (url) {
            this.log.info(`Closing page for: ${url}`);
            const pageRecord = this.pages[url];
            if (pageRecord) {
                await pageRecord.page.close();
                delete this.pages[url];
            } else {
                this.log.error(`Page for URL ${url} not found`);
            }
        } else {
            this.log.info('Closing browser');
            if (this.browser) {
                await this.browser.close();
            } else {
                this.log.error('Browser was not initialized properly');
            }
        }
    }

    private static parse(url: string) {
        const parts = {
            head: '',
            hostname: '',
            pathName: ''
        };

        if (!url) {
            return parts;
        }

        if (url.includes('//')) {
            parts.head = `${url.split('//')[0]}//`;
            url = url.split('//')[1];
        }
        if (url.includes('/')) {
            parts.hostname = url.split('/')[0];
            parts.pathName = `/${url.split('/')[1]}/`;
        }

        if (parts.hostname.includes(':')) {
            parts.hostname = parts.hostname.split(':')[0];
        }
        return parts;
    }

    private async createDOMFromPage(page: Page): Promise<JSDOM> {
        const htmlContent = await page.content();
        const dom = new JSDOM(htmlContent);
        return dom;
    }
}
export class OldWebAdminSession {
    private static _instance: OldWebAdminSession;
    private authCred = "";

    constructor(url: string, authcred: string, cookieJar: CookieJar = new CookieJar(), private readonly log: Logger = dummyLogger) {
        if (!this.DOMs) {
            this.DOMs = {};
        }
        const parsed = OldWebAdminSession.parse(url)
        const authCookiePart = `authcred=${authcred}`
        const cookie = Cookie.parse(authCookiePart);
        cookie.path = parsed.pathName;
        cookie.domain = parsed.hostname;

        this.authCred = authcred;
        if (!this.authCred) {
            this.authCred = authCookiePart;
        }

        this.CookieJar = cookieJar;
        this.CookieJar.setCookie(cookie, url);

        this.BaseUrl = process.env["BASE_URL"]

        this.log = new FileLogger(`../logs/info-${new Date().toISOString().split('T')[0]}-${this.constructor.name}.log`)
        this.DOMs[url] = new JSDOM(url);
        this.DOMs[url].date = new Date();
        this.DOMs[url].window.document.cookie += authCookiePart
    }

    public DOMs: Record<string, JSDOMDATE> = {};

    public BaseUrl: string;

    public CookieJar: CookieJar;


    public static get Instance(): OldWebAdminSession {
        return this._instance
    }

    public async navigate(url: string): Promise<JSDOM> {
        let navUrl = url;

        if (!navUrl.includes(this.BaseUrl)) {
            navUrl = this.BaseUrl + url
            //this.log.info(url, navUrl)
        }

        if (this.DOMs) {
            let DOM = this.DOMs[navUrl]

            if (!DOM) {
                this.DOMs[navUrl] = await JSDOM.fromURL(navUrl, { cookieJar: this.CookieJar })
                this.DOMs[navUrl].date = new Date();
            }

            if (navUrl.includes('chat') || (Date.now() - this.DOMs[navUrl].date.valueOf()) > 3000) {
                this.log.info(`navigating to: `, navUrl)
                try {
                    await this.close(navUrl)
                    const nav = await JSDOM.fromURL(navUrl, { cookieJar: this.CookieJar })
                    nav.window.fetch = this.fetch;
                    this.DOMs[navUrl] = await JSDOM.fromURL(navUrl, { cookieJar: this.CookieJar })
                    this.DOMs[navUrl].date = new Date();
                }
                catch (error) {
                    this.log.info(error)
                }
            }



            //this.log.info('after fromurl', new Date().toISOString(), Object.entries(this.DOMs));

        } else {
            this.log.error('DOMs were not initialized properly')
        }

        return this.DOMs[navUrl];
    }

    public async close(url: string): Promise<void> {
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



    public static async set(url: string, authcred: string): Promise<OldWebAdminSession> {
        if (!this._instance) {
            this._instance = new OldWebAdminSession(url, authcred)
            const DOM = await this._instance.navigate(url);
            if (DOM.window && DOM.window.document && DOM.window.document.cookie) {
                const cookie = Cookie.parse(DOM.window.document.cookie);
                this._instance.CookieJar.setCookie(cookie, url)
            }
        }

        return this._instance
    }

    public static get(): OldWebAdminSession {
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

    private async fetch(url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${this.authCred}`,
            }
        });

        return response;
    }
}
