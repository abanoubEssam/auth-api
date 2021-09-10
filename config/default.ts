export default {
    auth: {
        jwtSecret: "defaultxc@v$SDa&sdgg3SSAdffadfSAAACF$sfGFGBFG",
        jwtLifeTime: "10m",
        refreshTokenSecret: "super secret app",
        refreshTokenLifeTime: "10m",
    },
    dbUrl: "mongodb://localhost:27017/auth-app",
    server: {
        baseUrl: "localhost:3500"
    },
    admin: {
        "firstName": "admin",
        "lastName": "admin",
        "email": "admin@auth.com",
        "password": "admin@auth"
    }
}