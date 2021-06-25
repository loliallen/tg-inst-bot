import { IgApiClient } from "instagram-private-api"
import path from "path"
import fs from "fs"
import config from "../../config";

export default class InstagramBot {
    igs: Array<IgApiClient>;
    ig: IgApiClient | undefined;
    ids: Array<number> = [];
    accounts: Array<{ username: any; password: any; }>;
    uses: number = 0;
    requests: number = 0;
    user_name: string = config.instagram.username;
    user_pk: number = config.instagram.user_pk;

    constructor() {
        // config()
        this.accounts = config.instagram.accounts
        this.igs = [];
    }
    async run() {
        try {
            for( let account of this.accounts){
                const uname = account.username
                const upass = account.password
                console.log(`[Instagram Bot]: ⌛Login in ${uname}[${upass}]...`)
                this.ig = new IgApiClient()
                this.igs.push(this.ig)
                await this.login(uname, upass)
                console.log(`[Instagram Bot]: ✅ Logged in ${uname}`)
            }
        } catch (e) {
            console.error(e)
        }
    }

    async isFollowed(account_name: string) {
        var subs = false
        // check is need to switch
        this.swichIg()

        // incr request actions
        this.requests += 1;
        
        try {
            if(!this.ig)
                throw new Error("[Instagram Bot]: Ig is undefined");
            // get user
            const user = await this.ig.user.searchExact(account_name)
            if(user.is_private){
                console.log(`[${user.username}] Searching in followers`)
                const followers = this.ig.feed.accountFollowers(this.user_pk)
                await followers.items$.forEach(e => e.forEach(f => {
                    if (f.pk === user.pk) {
                        subs = true
                    }
                }))
                return subs
            } else {
                console.log(`[${user.username}] Searching in following`)
                const following = this.ig.feed.accountFollowing(user.pk)
                await following.items$.forEach(e => e.forEach(f => {
                    if (f.username === this.user_name) {
                        subs = true
                    }
                }))
                return subs
            }

        } catch (error) {
            console.error(error)
            return false
        }
    }

    swichIg(){
        if(this.requests % 4 === 0 && this.requests !== 0){
            this.uses += 1;
            this.ig = this.igs[this.uses % 2]
        }
    }

    async login(username:string, password: string) {
        try {
            if(!this.ig)
                throw new Error("[Instagram Bot]: Ig is undefined")

            this.ig.state.generateDevice(username);
            
            await this.ig.simulate.preLoginFlow();
            
            await this.checkSession(username, password)
            
            
            process.nextTick(async () => {
                try {
                    await this.ig?.simulate.postLoginFlow()
                } catch (error) {
                    console.error("[Instagram Bot]: Login error: ",error)
                    return;
                }
            });
            await this.ig.state.serialize()
            
        } catch (error) {
            console.error("[Instagram Bot]: Login error: ",error)
            return;
        }
    }
    async checkSession(username:string, password: string){
        const _path = path.resolve(__dirname, `../../../instagram_sessions/${username}.json`)
        const _path_cookie = path.resolve(__dirname, `../../../instagram_sessions/${username}.cookie.json`)
 
        if(fs.existsSync(_path) && fs.existsSync(_path_cookie)){
            console.log("Reading session file", _path)
            var state = fs.readFileSync(_path).toJSON().data
            var cookies = fs.readFileSync(_path_cookie).toString()
            await this.ig?.state.deserialize(state)
            await this.ig?.state.deserializeCookieJar(cookies)
            console.log(this.ig?.state.deviceString)

        } else {  
            const loggedInAccount = await this.ig?.account.login(username, password);
            if(loggedInAccount) {
                this.ids.concat(loggedInAccount.pk);
                this.saveSession(username)
            }
        }
    }
    async saveSession(username:string){
        const _path = path.resolve(__dirname, `../../../instagram_sessions/${username}.json`)
        const _path_cookie = path.resolve(__dirname, `../../../instagram_sessions/${username}.cookie.json`)
        var cookie = await this.ig?.state.serializeCookieJar()
        var value = await this.ig?.state.serialize()
        fs.writeFileSync(_path, JSON.stringify(value))
        fs.writeFileSync(_path_cookie, JSON.stringify(cookie))
    }
}