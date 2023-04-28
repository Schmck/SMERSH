const SteamUser = require('steam-user');
import { hexToDec } from 'hex2dec'

export class SteamBot {
    public static async set(accountName: string, password: string) {
        this.bot = new SteamBot();
        this.bot.steam = new SteamUser();
        await this.bot.steam.logOn({
            accountName: accountName,
            password: password,
        });

        await new Promise<void>((resolve) => {
        this.bot.steam.once('loggedOn', () => {
                resolve();
            });
        });

        await this.bot.setStatus();
    }

    public static get() {
        if (!this.bot) {
            return null
        }
        return this.bot;
    }

    public static bot: SteamBot;

    public steam;

    public async setStatus() {
        
        this.steam.setPersona(SteamUser.EPersonaState.Online);
        this.steam.gamesPlayed(9800);
    }

    public async sendMessageToFriend(id: string, message: string) {
        const env = JSON.parse(process.argv[process.argv.length - 1])
        const steamId64 = hexToDec(id);

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