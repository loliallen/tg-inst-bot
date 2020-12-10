import express from "express"
import InstagramBot from "./service/Bots/instagram"
import TelegramBot from "./service/Bots/telegram"
import DataBase from "./service/database"

const port = process.env.PORT || 7080

const app = express()

DataBase()

app.listen(port, ()=>{
    const iBot = new InstagramBot()
    iBot.run()
    const tBot = new TelegramBot(iBot)
    tBot.run()
    console.log(`Server listening on http://localhost:${port}`)
})