const express = require("express")
require("dotenv").config()
const app = express()
const path = require("path")
const ejsMate = require("ejs-mate")
const managerRoutes = require("./routes/manage")
const homeRoutes = require("./routes/home")
const adminRoutes = require("./routes/admin")
const session = require("express-session")
const flash = require("connect-flash")
var MySQLStore = require("express-mysql-session")(session)

const { options } = require("./config/dbconfig.js")

var sessionStore = new MySQLStore(options)
app.use(
  session({
    secret: "dsx4geOoI9oTFd65URkM",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
  })
)

app.use(flash())
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash()
  next()
})
app.use(express.json())

app.engine("ejs", ejsMate)

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))

app.use("/public", express.static("public"))

app.get("/web/health", (req, res) => {
  res.send("ok")
})

app.use("/", homeRoutes)

app.use("/manage", managerRoutes)

app.use("/admin", adminRoutes)

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/error.html")
})

app.listen(process.env.SERVER_PORT||8080, () => {
  console.log(`Server started at localhost::${process.env.SERVER_PORT||8080}`)
})
