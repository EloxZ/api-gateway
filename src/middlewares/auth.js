import jwt from "jsonwebtoken"

const PERMS_HIERARCHY = {
    "guest": 0,
    "user": 1,
    "admin": 2
}

const PATH_PERMS = {
    "/dog": "user",
    "/cat": "guest",
    "/login": "guest"
}

const auth = (req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.path}`)
    const requiredPerms = Object.entries(PATH_PERMS).find(([prefix]) =>
        req.path.startsWith(prefix)
    )?.[1] || "user"
    console.log(`Required permission for this path: ${requiredPerms}`)

    if (requiredPerms === "guest") return next()

    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ message: "Authorization header required" })

    const token = authHeader.split(" ")[1]
    if (!token) return res.status(401).json({ message: "Token required" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded

        const userPermLevel = PERMS_HIERARCHY[decoded.role] || 1
        const requiredPermLevel = PERMS_HIERARCHY[requiredPerms] || 1

        if (userPermLevel < requiredPermLevel) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        next()
    } catch (err) {
        res.status(403).json({ message: "Token invalid" })
    }
}

export default auth
