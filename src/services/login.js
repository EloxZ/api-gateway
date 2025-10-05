import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const USERS = [
    { 
        id: 1, 
        username: "admin", 
        password: "$2b$10$Yig72HsJQ9NTPBVTfelqV.Q2dkROaQBY9vwof6TM6bU4ZsgBubVoy",
        role: "admin"
    }, // 1234
]

const generateUserToken = (user) => {
    const safeUser = ({ password, ...rest }) => rest

    return jwt.sign(
        safeUser(user), 
        process.env.JWT_SECRET, 
        { 
            expiresIn: "1h" 
        }
    )
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body

        const user = USERS.find(u => u.username === username)
        if (!user) return res.status(401).json({ message: "User not found" })

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return res.status(401).json({ message: "Wrong credentials" })

        const token = generateUserToken(user)
        res.json({ token })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export default login

