import { config } from "dotenv"
config()

const USERNAME = process.env.ACCOUNT_NAME;
const accounts = [
    {
        username: process.env.USER2,
        password: process.env.PASS2,
    },
    {
        username: process.env.USER3,
        password: process.env.PASS3,
    }
]


const INSTAGRAM = {
    accounts,
    username: USERNAME || ""
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

if (!APP.firstStepId || !accounts[0].username || !accounts[1].username) {
    throw new Error("Config error, please check env varibles")
}
console.log("APP", APP)
console.log("INSTAGRAM", INSTAGRAM)
console.log("TELEGRAM", TELEGRAM)
export default {
    app: APP,
    instagram: INSTAGRAM,
    telegram: TELEGRAM
}