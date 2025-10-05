import { createProxyMiddleware } from "http-proxy-middleware"

const createProxy = (serviceUrl, prefix = "") => {
    const baseUrl = serviceUrl.endsWith("/") ? serviceUrl.slice(0, -1) : serviceUrl

    return createProxyMiddleware({
        target: baseUrl,
        changeOrigin: true,
        secure: true,
        pathRewrite: (path, req) => {
            let newPath = path.replace(prefix, "")
            if (!newPath.startsWith("/")) newPath = "/" + newPath
                console.log(`Proxying request to: ${baseUrl}${newPath}`)
                return newPath
            },
        on: {
            proxyReq: (proxyReq, req, res) => {
                proxyReq.setHeader("x-gateway", "NodeAPI-Gateway")
                proxyReq.setHeader("User-Agent", "Node.js Proxy")
                proxyReq.setHeader("Accept", "application/json")
            },
            proxyRes: (proxyRes, req, res) => {
                // You can log or modify the response here if needed
            },
            error: (err, req, res) => {
                console.error("Proxy error:", err)
                res.status(500).json({ message: "Proxy error", error: err.message })
            }
        }
    })
}

export {
    createProxy
}