import { SteamUser, SteamID, SteamCommunity, EResult } from 'steam-chat-bot';


export class SteamBot {
    
    public async sendMessageToFriend(id: string, message: string) {
        const env = JSON.parse(process.argv[process.argv.length - 1]);

        // Convert the hexadecimal ID string to a SteamID object
        const steamId = new SteamID(id, SteamID.Type.INDIVIDUAL);

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
        const isFriend = await new Promise<boolean>((resolve) => {
            bot.getPersonas([steamId], (personas : any) => {
                const persona = personas[steamId.toString()];
                resolve(!!persona && persona.friendRelationship === SteamUser.EFriendRelationship.Friend);
            });
        });

        if (!isFriend) {
            // Send a friend request to the user
            bot.addFriend(steamId);

            // Wait for the user to accept the friend request
            const addFriendResult = await new Promise<any>((resolve) => {
                bot.on('friendRelationship', (steamId: any, relationship: any) => {
                    if (relationship === SteamUser.EFriendRelationship.Friend) {
                        resolve(EResult.OK);
                    }
                });
            });

            if (addFriendResult !== EResult.OK) {
                throw new Error(`Failed to add user with ID ${id} as a friend`);
            }
        }

        // Create a SteamCommunity object to handle Steam-related tasks
        const community = new SteamCommunity();

        // Get the chat object for the user we want to message
        const chat = await community.getSteamChat(steamId);

        // Send the message to the user
        await chat.sendMessage(message);
    }
}