import { SteamUser, EResult, EChatEntryType, EFriendRelationship } from 'steam-user';
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
            bot.once('loggedOn', () => {
                resolve();
            });
        });

        // Check if the user is already a friend of the bot
        const isFriend = await new Promise<any>((resolve) => {
            bot.on('friendsList', function () {
                let friends = Object.keys(bot.myFriends).filter(steamId => bot.myFriends[steamId] == EFriendRelationship.Friend);

                if (friends.includes(steamId64)) {
                    resolve(friends.includes(steamId64))
                }
            });
        })

            if (!isFriend) {
                // Send a friend request to the user
                bot.addFriend(steamId64, () => { });

                // Wait for the user to accept the friend request
                const addFriendResult = await new Promise<any>((resolve) => {
                    bot.once('friendRelationship', (steamId: any, relationship: any) => {
                        if (relationship === EFriendRelationship.Friend && steamId === steamId64) {
                            resolve(EResult.OK);
                        }
                    });
                });

                if (addFriendResult !== EResult.OK) {
                    throw new Error(`Failed to add user with ID ${id} as a friend`);
                }
            }

            // Send the message to the user
            await bot.sendFriendMessage(steamId64, message, EChatEntryType.ChatMsg, () => { });
    }
}