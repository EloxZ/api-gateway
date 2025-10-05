import express from "express"
import auth from "./middlewares/auth.js"
import routes from "./config/routes.js"
import { createProxy } from "./utils/httpClient.js"
import login from "./services/login.js"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

// Middlewares
app.use(express.json())
app.use(auth)

// Login route
app.use('/login', login)

// Set up proxy routes based on the configuration
Object.entries(routes).forEach(([path, serviceUrl]) => {
    app.use(path, createProxy(serviceUrl, path))
})

app.use((req, res) => {
    res.status(404).json({ status: 404, error: "Not Found" })
})

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`)
})