require("dotenv").config({ path: "variables.env" })

const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")

const createServer = require("./createServer")
const db = require("./db")

const server = createServer()

// Use Express middleware to handle cookies (JWT)
server.express.use(cookieParser())

// Decode JWT so we can get the authenticated user
server.express.use((req, res, next) => {
  const { token } = req.cookies

  if (token) {
    const { userID } = jwt.verify(token, process.env.APP_SECRET)
    console.log(userID, token)
    req.userID = userID
  }

  next()
})

// TODO: Use Express middleware to populate current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`)
  },
)
