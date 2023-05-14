import { Client } from "./Client";
import { TextChannel, Message } from 'discord.js';

export class Logger {

    private static Instance: Logger;

    public static async set(client: Client, channelId: string) {
        if (!this.Instance) {
            const channel = await client.channels.fetch(channelId) as TextChannel;
            const message = channel.lastMessage;

            this.Instance = new Logger(client, channel)
        }
    }

    public static get() {
        if (!this.Instance) {
            return null;
        }
        return this.Instance;
    }
    public constructor(client: Client, channel: TextChannel) {

        this.Client = client;
    }

    public static append(message: string) {
        const line = `${new Date().toTimeString().slice(0, 8)}\u2502 ${message}`
        if (this.Instance) {
            this.Instance.Messages.push(line)
        }
    }

    private async publish(timeout: number) {
        const line = this.Messages.shift();
        const validMessage = this.Log && this.Log.content && this.Log.content.length < 1800
        const validNewLine = line && validMessage && this.Log.content.length + line.length < 1900


        if (validMessage && validNewLine && this.Messages.length) {
            const newContent = `${this.Log.content.slice(0, this.Log.content.length - 3)} \n ${line} \`\`\``
            this.Log = await this.Log.edit(newContent)

        } else {
            this.Log = await this.Log.channel.send(`\`\`\`scala\n ${line} \`\`\``)
        }
    }

    private Client: Client;

    private Messages: Array<string>

    private Log: Message;

}