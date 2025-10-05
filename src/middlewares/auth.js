import jwt from "jsonwebtoken"

const PERMS_HIERARCHY = {
    "guest": 0,
    "user": 1,
    "admin": 2
}

const PATH_PERMS = {
    "/dog": "user",
    "/http/cat": "admin",
    "/login": "guest"
}

const auth = (req, res, next) => {
    const isGuestPath = Object.keys(PATH_PERMS).includes(req.path) 
        && PATH_PERMS[req.path] === "guest"

    if (isGuestPath) return next()

    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ message: "Authorization header required" })

    const token = authHeader.split(" ")[1]
    if (!token) return res.status(401).json({ message: "Token required" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded

        const requiredPerm = PATH_PERMS[req.path] || "user"
        const userPermLevel = PERMS_HIERARCHY[decoded.role] || 1
        const requiredPermLevel = PERMS_HIERARCHY[requiredPerm] || 1

        if (userPermLevel < requiredPermLevel) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        next()
    } catch (err) {
        res.status(403).json({ message: "Token invalid" })
    }
}

export default auth
