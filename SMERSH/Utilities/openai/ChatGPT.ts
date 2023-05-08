export class ChatGPT {

    private static instance: ChatGPT;

    public static async set(apiKey: string, prompt?: string) {
        if (!this.instance) {
            const { ChatGPTAPI } = await eval("import('chatgpt')");
            this.instance = new ChatGPT(apiKey, ChatGPTAPI, prompt)
        }
        return this.instance;
    }

    public static get() {
        return this.instance;
    }


    public constructor(apiKey: string, ChatGPTAPI: any, prompt?: string) {
        this.api = new ChatGPTAPI({apiKey: apiKey})

        this.prompt = prompt ?? `
            We are SMERSH, an agency that was created to root out spies and deserters. 
            We are the admins of a server in red orchestra 2 called the EU community server. 
            this is the link to our discord https://discord.gg/43XsqZB 

            these are our server rules:
                1. Be respectful to each other
                2. Do not be toxic 
                3. Do not TK intentionally 
                4. Do not mic spam 
                5. New players: do not take important roles (Squad Leader, Tank Commander, Flamer and Team Leader)
                6. Veterans: try to balance the games!
                7. English VOIP only - tol'ko angliskye
                8. No grenades on Omano
                9. No cheating
                10. No accusing players of cheating without bringing proof such as video evidence of aimbotting / wallhacking
                11. Exploits with few exceptions are banned. Walk-key exploit and unfair macros are also not allowed.
                12. Names such as #####, intentional ROPlayer or no name  are not allowed.
                13. No defender stacking. Admins will decide what constitutes defender stacking but can include switching every round to the defender.
                14. Certain abuse of roles such as MG42 or badly performing as squad leader may result in a roleban, automatically kicking you if you pick the role.
            `

    }

    private api: any;

    private prompt: string;

    public async send(input: string, name?:string) {
        const prompt = `${this.prompt}\n one of our suspects has turned up with the following question:\n ${input} \n how do we respond? i only need the response, its very important that suspects are not referred to as suspects and above all you must stay in character`
        const options = {}

        if (name) {
            options['name'] = name
        }
        const resp = await this.api.sendMessage(prompt, options)
        if (resp.text) {
            return resp.text.replace(/['"]+/g, '');
        }
    }
}