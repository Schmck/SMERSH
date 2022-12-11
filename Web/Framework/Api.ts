declare module 'axios' {
    interface AxiosRequestConfig {
        jar?: CookieJar;
    }
}
import axios, { isCancel, AxiosError } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar, Cookie } from 'tough-cookie';
import * as dotenv from 'dotenv';

export class Api {
    public static axios() {
        const env = process.env;
        const authcred = env['AUTHCRED'];
        const url = env["BASE_URL"];

        const parsed = Api.parse(url);
        const authCookiePart = `authcred=${authcred}`
        const cookie = Cookie.parse(authCookiePart);
        cookie.path = parsed.pathName;
        cookie.domain = parsed.hostname;

        const jar = new CookieJar();
        jar.setCookie(cookie, url)
        const client = wrapper(axios.create({ jar }));

        return client;
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