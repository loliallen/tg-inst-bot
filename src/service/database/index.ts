import mongoose from "mongoose"
import { config } from "dotenv"

export default () => {
    try {
        console.log("[Database]: ⌛ Connecting...")

        config()
        const DB_URI: string = process.env.MONGODB_URI || ""
        const CONNECT_OPTIONS = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        }
        mongoose.connect(
            DB_URI,
            CONNECT_OPTIONS
        )

        const connection = mongoose.connection

        connection.on("error", () => {
            console.error('[Database]: ❌ Connection error')
        });

        connection.once("open", () => {
            console.log('[Database]: ✅ Connection success')
        })
    } catch (error) {
        console.error(error)
    }

}