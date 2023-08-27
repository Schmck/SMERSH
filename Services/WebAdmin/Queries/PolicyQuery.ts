import { PolicyRoute } from '../Routes';
import { WebAdminSession } from '..';
import { Parsers } from "../../../Web/Utils";
import { Api } from '../../../Web/Framework';
import axios, { isCancel, AxiosError, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { SearchClient } from '../../../Elastic';
import { PlayerSearchReport } from '../../../Reports/Entities/player'
import { Query } from './Query';

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
        const policy = await session.navigate(PolicyRoute.GetBans.Action)
        const bans = policy && policy.window && policy.window.document && [].slice.call(policy.window.document.querySelector('table.grid>tbody').children)
        let ban

        if (bans) {
            ban = bans.find(row => row && row.textContent && row.textContent.includes(playerId))
        }

        if (ban) {
            ban.querySelector('button').click()
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