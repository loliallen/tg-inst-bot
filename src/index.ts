import express from "express"
import InstagramBot from "./service/Bots/instagram"
import TelegramBot from "./service/Bots/telegram"
import DataBase from "./service/database"

const port = process.env.PORT || 7080

const app = express()

DataBase()

app.listen(port, ()=>{
    console.log(process.env['USER'])
    console.log(process.env['PASSWORD'])
    console.log(process.env['TELEGRAM_BOT_TOKEN'])
    console.log(process.env['STEP_ID'])
    console.log(process.env['MONGODB_URI'])
    const iBot = new InstagramBot()
    iBot.run()
    const tBot = new TelegramBot(iBot)
    tBot.run()
    console.log(`Server listening on http://localhost:${port}`)
})