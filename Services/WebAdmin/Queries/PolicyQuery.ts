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
        const session = WebAdminSession.get();
        const policy = await session.navigate(PolicyRoute.GetBans.Action)

        this.log.info(PolicyRoute.GetBans.Action, policy.window.document)
        if(policy && policy.window && policy.window.document){
            const banForm : HTMLFormElement = policy.window.document.querySelector('#addban').parentElement as HTMLFormElement;
            const banInput : HTMLInputElement = banForm.querySelector('input#uniqueid')

            banInput.value = playerId;

            console.log('banning ', playerId, banInput.value)
            banForm.submit();
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
            const env = JSON.parse(process.argv[process.argv.length - 1]);
            const url = env["BASE_URL"] + PolicyRoute.DeleteBan.Action
            const urlencoded = qs.stringify({
                "banid": banId,
                "action": 'delete'
            })

            const config: AxiosRequestConfig =
            {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                    "Cookie": `authcred="${env["AUTHCRED"]}"`
                },
            }


            await axios.post(url, urlencoded, config).then(result => {
            });
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