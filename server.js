const express = require("express")
const path = require("path")
const passport = require("passport")
const InstagramStrategy = require("passport-instagram").Strategy


const INSTAGRAM_CLIENT_ID = process.env.facebook_id
const INSTAGRAM_CLIENT_SECRET = process.env.facebook_secret
const port = process.env.PORT || 7080
const app = express()

// passport.use(new InstagramStrategy({
//     clientID: INSTAGRAM_CLIENT_ID,
//     clientSecret: INSTAGRAM_CLIENT_SECRET,
//     callbackURL: "http://localhost:7080/auth/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {

//   }
// ));
app.get('/', (req, res) => {
    res.send("hello")
})
app.get('/policy', (req, res) => {
    res.sendFile(path.resolve(__dirname, '/public/html/index.html'))
})


app.listen(port, ()=>{
    console.log(`Server listening on port*${port}`)
})
