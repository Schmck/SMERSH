const SteamUser = require('steam-user');
import { hexToDec } from 'hex2dec'

export class SteamBot {

    public constructor() {
        this.steam = new SteamUser();
    }

    public steam;

    /*
    public async setGameStatus() {
        const env = JSON.parse(process.argv[process.argv.length - 1])

        await this.steam.logOn({
            accountName: env["STEAM_ACCOUNT_NAME"],
            password: env["STEAM_ACCOUNT_PASSWORD"],
        });

        await new Promise<void>((resolve) => {
            this.steam.once('loggedOn', () => {
                resolve();
            });
        });
        this.steam.setPersona(SteamUser.EPersonaState.Online);
        this.steam.gamesPlayed(9800);
    }
    */

    public async sendMessageToFriend(id: string, message: string) {
        const env = JSON.parse(process.argv[process.argv.length - 1])
        const steamId64 = hexToDec(id);

        await this.steam.logOn({
            accountName: env["STEAM_ACCOUNT_NAME"],
            password: env["STEAM_ACCOUNT_PASSWORD"],
        });

      
        await new Promise<void>((resolve) => {
            this.steam.once('loggedOn', () => {
                resolve();
            });
        });

        this.steam.setPersona(SteamUser.EPersonaState.Online);
        this.steam.gamesPlayed(9800);

        const isFriend = await new Promise<any>((resolve) => {
            let friends = Object.keys(this.steam.myFriends).filter(steamId => this.steam.myFriends[steamId] == SteamUser.EFriendRelationship.Friend);
            resolve(friends.includes(steamId64))
        })

        if (!isFriend) {
            await this.steam.addFriend(steamId64, () => { });

            const addFriendResult = await new Promise<any>((resolve) => {
                this.steam.on('friendRelationship', (steamId: any, relationship: any) => {
                    if (relationship === SteamUser.EFriendRelationship.Friend && steamId.getSteamID64() === steamId64) {
                        resolve(SteamUser.EResult.OK);
                    } else {
                        resolve(SteamUser.EResult.AccountNotFriends)
                    }
                });
            });

            if (addFriendResult !== SteamUser.EResult.OK) {
                console.log(`Failed to add user with ID ${id} as a friend`);
            }
        }

        await this.steam.chat.sendFriendMessage(steamId64, message, { chatEntryType: SteamUser.EChatEntryType.ChatMsg }, () => { });

    }
}