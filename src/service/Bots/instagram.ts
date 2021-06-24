import { IgApiClient } from "instagram-private-api"
import path from "path"
import fs from "fs"
import config from "../../config";

export default class InstagramBot {
    igs: Array<IgApiClient>;
    ig: IgApiClient | undefined;
    ids: Array<number> = [];
    users: Array<string>;
    passwords: Array<string>;
    uses: number = 0;
    requests: number = 0;
    user_name: string = config.instagram.username;
    user_pk: number = config.instagram.user_pk;

    constructor() {
        // config()
        this.users = config.instagram.accounts.map(a => a.username || "");
        this.passwords = config.instagram.accounts.map(a => a.password || "");
        this.igs = [new IgApiClient(),new IgApiClient()];
    }
    async run() {
        for( let i = 0; i < this.users.length; i++){
            const uname = this.users[i]
            const upass = this.passwords[i]
            this.ig = this.igs[i]
            await this.login(uname, upass)
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

            console.log(`[Instagram Bot]: ⌛Login in ${username}...`)
            this.ig.state.generateDevice(username);
            
            await this.ig.simulate.preLoginFlow();
            
            await this.checkSession(username, password)
            
            process.nextTick(async () => await this.ig?.simulate.postLoginFlow());
            
            await this.ig.state.serialize()
            
            console.log(`[Instagram Bot]: ✅ Logged in ${username}`)
        } catch (error) {
            console.error(error)
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