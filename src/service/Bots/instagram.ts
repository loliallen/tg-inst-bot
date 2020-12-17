import { IgApiClient } from "instagram-private-api"
import { config } from "dotenv"

export default class InstagramBot {
    ig: IgApiClient;
    id!: number;
    user: string;
    password: string;
    constructor() {
        config()
        this.user = process.env.USER || "";
        this.password = process.env.PASSWORD || "";
        this.ig = new IgApiClient();
    }
    async run() {
        await this.login()
    }

    async isFollowed(account_name: string) {
        try {
            // 4557096531
            var subs = false
            const id = await this.ig.user.getIdByUsername("thatsnoisy")
            const followers = await this.ig.feed.accountFollowers(id)
            await followers.items$.forEach(e => e.forEach(f => {
                if (f.username === account_name) {
                    subs = true
                }
            }))
            return subs
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async login() {
        console.log("[Instagram Bot]: ⌛Login...")
        this.ig.state.generateDevice(this.user);
        await this.ig.simulate.preLoginFlow();
        const loggedInAccount = await this.ig.account.login(this.user, this.password);
        this.id = loggedInAccount.pk
        await this.ig.simulate.postLoginFlow();
        console.log("[Instagram Bot]: ✅ Logged")
    }
}