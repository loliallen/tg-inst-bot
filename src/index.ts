import express from "express"
import BodyParser from "body-parser"

import InstagramBot from "./service/Bots/instagram"
import TelegramBot from "./service/Bots/telegram"
import DataBase from "./service/database"

const port = process.env.PORT || 7080

const app = express()

app.use(BodyParser.urlencoded({ extended: true }))
app.use(BodyParser.json())
DataBase()

app.listen(port, ()=>{
    const iBot = new InstagramBot()
    iBot.run()
    const tBot = new TelegramBot(iBot)
    tBot.run()
    console.log(`[Server]: ✅ Listening on http://localhost:${port}`)
})