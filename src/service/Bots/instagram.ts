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
    async run(){
        await this.login()
    }

    async isFollowed(account_name:string){
        try {
            const followers = await this.ig.feed.accountFollowers(4557096531).items()
            const account = followers.findIndex(e => e.username === account_name)
            return account
        } catch (error) {
            return -1
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