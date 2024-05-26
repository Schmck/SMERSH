import { PolicyRoute } from '../Routes';
import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";
import { Api } from '../../../Web/Framework';
import axios, { isCancel, AxiosError, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { SearchClient } from '../../../Elastic';
import { PlayerSearchReport } from '../../../Reports/Entities/player'
import { Query } from './Query';
import qs from 'qs'

export class PolicyQuery extends Query {


    public static async Get() {
        const session = WebAdminSession.get();
        const policy = await session.navigate(PolicyRoute.GetBans.Action)
        if (policy && policy.window && policy.window.document) {
            const bannedIds = Object.values(policy.window.document.querySelector('table.grid').querySelectorAll('td')).filter((td, i) => !(i % 3)).map(tr => tr.textContent);
            return bannedIds;
        }
        return [];
    }

    public static async Post(playerId: string) {
        const env = JSON.parse(process.env.NODE_ENV['PARAMS']);

        const axios = Api.axios();
        const url = env["BASE_URL"] + PolicyRoute.AddBan.Action
        const urlencoded = `action=add&uniqueid=${playerId}`

        const config: AxiosRequestConfig =
        {
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "Dnt": 1,
                "Host": env["BASE_URL"].slice(0, env["BASE_URL"].indexOf("/ServerAdmin")),
                "Origin": env["BASE_URL"].slice(7, env["BASE_URL"].indexOf("/ServerAdmin")),

            },
        }



        let result = (await axios.post(url, urlencoded, config)).data;
        let bans = (await axios.get(url, config)).data
        let resolved = result.indexOf(playerId) && bans.indexOf(playerId)
        let attempts = 0

        while (!resolved && attempts < 10) {
            result = (await axios.post(url, urlencoded, config)).data;
            bans = (await axios.get(url, config)).data
            resolved = result.indexOf(playerId) && bans.indexOf(playerId)
            attempts = attempts + 1
        }

        return;
    }


    public static async Delete(playerId: string) {
        const session = WebAdminSession.get();
        const policy = await session.navigate(PolicyRoute.GetBans.Action)
        const bans = policy && policy.window && policy.window.document && [].slice.call(policy.window.document.querySelector('table.grid>tbody').children)
        let ban,
            banId

        if (bans) {
            ban = bans.find(row => row && row.textContent && row.textContent.includes(playerId))
        }

        if (ban) {
            banId = ban.querySelector('input[name="banid"]').value
            const axios = Api.axios();
            const env = JSON.parse(process.env.NODE_ENV['PARAMS']);
            const url = env["BASE_URL"] + PolicyRoute.DeleteBan.Action
            const urlencoded = qs.stringify({
                "banid": banId,
                "action": 'delete'
            })

            const config: AxiosRequestConfig =
            {
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded',
                },
            }


            await axios.post(url, urlencoded, config);
            return true;
        }

        return false;
    }

    public static async GetNextPlainId() {
        const session = WebAdminSession.get();
        const policy = await session.navigate(PolicyRoute.GetBans.Action)

        if (policy && policy.window && policy.window.document) {
            const table : HTMLTableElement = policy.window.document.querySelector('.grid')
            const lastRow = table.rows[table.rows.length - 1]
            const input: HTMLInputElement = lastRow.querySelector('input[name=banid]')
            const plainId = parseInt(input.value.split(':')[1], 10) + 1

            return plainId;
        }
    }
}