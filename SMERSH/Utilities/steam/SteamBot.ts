const SteamUser = require('steam-user');
import { hexToDec } from 'hex2dec'

export class SteamBot {

    public async sendMessageToFriend(id: string, message: string) {
        const env = JSON.parse(process.argv[process.argv.length - 1])
        // Convert the hexadecimal ID string to a SteamID64 object
        const steamId64 = hexToDec(id);

        // Create a SteamUser object to represent the bot
        const bot = new SteamUser();

        // Log in to Steam using the bot's credentials
        await bot.logOn({
            accountName: env["STEAM_ACCOUNT_NAME"],
            password: env["STEAM_ACCOUNT_PASSWORD"],
        });

        // Wait for the bot to become logged in and ready
        await new Promise<void>((resolve) => {
            bot.on('loggedOn', () => {
                resolve();
            });
        });

        // Check if the user is already a friend of the bot
        const isFriend = await new Promise<any>((resolve) => {
            bot.on('friendsList', function () {
                let friends = Object.keys(bot.myFriends).filter(steamId => bot.myFriends[steamId] == SteamUser.EFriendRelationship.Friend);
                resolve(friends.includes(steamId64))
            });
        })

        if (!isFriend) {
            // Send a friend request to the user
            bot.addFriend(steamId64, () => { });

            // Wait for the user to accept the friend request
            const addFriendResult = await new Promise<any>((resolve) => {
                bot.on('friendRelationship', (steamId: any, relationship: any) => {
                    if (relationship === SteamUser.EFriendRelationship.Friend && steamId === steamId64) {
                        resolve(SteamUser.EResult.OK);
                    } else {
                        resolve(SteamUser.EResult.AccountNotFriends)
                    }
                });
            });

            if (addFriendResult !== SteamUser.EResult.OK) {
                throw new Error(`Failed to add user with ID ${id} as a friend`);
            }
        }

        const isFriendNow = await new Promise<any>((resolve) => {
            bot.on('friendsList', function () {
                let friends = Object.keys(bot.myFriends).filter(steamId => bot.myFriends[steamId] == SteamUser.EFriendRelationship.Friend);
                resolve(friends.includes(steamId64))
            });
        })

        if (isFriendNow) {
            await bot.sendFriendMessage(steamId64, message, SteamUser.EChatEntryType.ChatMsg, () => { });
        } else {
            console.log(id, ' did not want to be friends')
        }
            // Send the message to the user
    }
}