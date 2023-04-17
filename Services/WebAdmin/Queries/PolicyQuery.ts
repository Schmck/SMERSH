import { PolicyRoute } from '../Routes';
import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";
import { Api } from '../../../Web/Framework';
import axios, { isCancel, AxiosError, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { SearchClient } from '../../../Elastic';
import { PlayerSearchReport } from '../../../Reports/Entities/player'
import { Query } from './Query';

export class PolicyQuery extends Query {

    public static async Post(playerId: string) {
        const session = WebAdminSession.get();
        const policy = await session.navigate(PolicyRoute.GetBans.Action)

        this.log.info(PolicyRoute.GetBans.Action, policy.window.document)
        if(policy && policy.window && policy.window.document){
            const banForm = policy.window.document.querySelector('#addban')
            const banInput : HTMLInputElement = banForm.querySelector('input#uniqueid')
            const banSubmit = banForm.querySelector('button')

            banInput.value = playerId;

            console.log('banning ', playerId, banInput.value)
            banSubmit.click()
        }
        return;
    }


    public static async Delete(playerId: string) {
        const session = WebAdminSession.get();
        const policy = await session.navigate(PolicyRoute.DeleteBan.Action)
        const bans = policy && policy.window && policy.window.document && policy.window.document.querySelectorAll('tr>td>form')
        let ban,
            banId

        if (bans) {
            bans.forEach(bn => {
                if (bn.parentElement.parentElement.innerText.includes(playerId)) {
                    ban = bn.parentElement.parentElement
                }
            })
        }

        if (ban) {
            banId = ban.querySelector('input[name="banid"]').value


            const client = Api.axios();
            const env = process.argv[process.argv.length - 1];
            const url = env["BASE_URL"] + PolicyRoute.DeleteBan.Action
            const config: AxiosRequestConfig =
            {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
            }
            const urlencoded = new URLSearchParams();
            urlencoded.append("banid", banId);
            urlencoded.append("action", 'delete');

            let response;

            try {
                response = await client.post(url, urlencoded, config).then(result => {
                    return result
                });
            } catch (error) {
                return 'worst luck'
            }
        }

        return null;
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