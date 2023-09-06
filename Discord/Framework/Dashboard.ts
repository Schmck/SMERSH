import { Client } from "./Client";
import { TextChannel, Message } from 'discord.js';
import { time } from "console";

export class Dashboard {

    private static Instance: Dashboard;

    public static async set(client: Client, channel: TextChannel) {
        if (!this.Instance) {
            const message = channel.lastMessage;
            this.Instance = new Dashboard(client, channel, message)

            return this.Instance;
        }
    }

    public static get() {
        if (!this.Instance) {
            return null;
        }
        return this.Instance;
    }
    public constructor(client: Client, channel: TextChannel, logMessage: Message) {

        this.Client = client;
        this.Channel = channel;
        this.Log = logMessage;
        this.Messages = [];
    }

    public static append(message: string) {
        const line = `${new Date().toTimeString().slice(0, 8)}\u2502 ${message}`
        if (this.Instance) {
            this.Instance.Messages.push(line)
        }
    }

    public async publish(timeout: number = 5000) {
        if (this.Messages.length) {
            const line = this.Messages.shift();
            const validMessage = this.Log && this.Log.content && this.Log.content.length < 1800
            const validNewLine = line && validMessage && this.Log.content.length + line.length < 1900


            if (validMessage && validNewLine) {
                const newContent = `${this.Log.content.slice(0, this.Log.content.length - 3)} \n ${line} \`\`\``
                this.Log = await this.Log.edit(newContent)

            } else if (validMessage) {
                const oldLine = this.Log.content.indexOf(`\n`)
                const newContent = `\`\`\`scala\n ${this.Log.content.slice(oldLine, this.Log.content.length - 3)} \n ${line} \`\`\``

                this.Log = await this.Channel.send(newContent)
            } else {
                this.Log = await this.Channel.send(`\`\`\`scala\n ${line} \`\`\``)
            }
        }

        setTimeout(() => {
            this.publish(timeout)
        }, timeout)
    }

    private Client: Client;

    private Messages: Array<string>

    private Channel: TextChannel;

    private Log: Message;

}