import { config } from "dotenv"
config()

const USERNAME = process.env.ACCOUNT_NAME;
const USER_PK = process.env.USER_PK;

const USERS = process.env.USERS
const PASSS = process.env.PASSS

if (!USERS || !PASSS)
    throw new Error("Config error, usernames or passwords isn't passed")
const accounts = USERS.split(" ").map((u, i) => ({
    username: u,
    password: PASSS.split(" ")[i],
}))

const INSTAGRAM = {
    accounts,
    username: USERNAME || "",
    user_pk: Number(USER_PK || null) 
}

const TELEGRAM = {
    token: process.env.TELEGRAM_BOT_TOKEN
}

const APP = {
    firstStepId: process.env.STEP_ID,
    port: process.env.PORT || 7080,
    database: {
        url: process.env.MONGODB_URI || ""
    }
}

if (!APP.firstStepId) {
    throw new Error("Config error, please check env varibles")
}
export default {
    app: APP,
    instagram: INSTAGRAM,
    telegram: TELEGRAM
}