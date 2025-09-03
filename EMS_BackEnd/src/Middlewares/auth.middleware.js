import BlackListedTokens from "../DB/Models/black-listed-tokens.model.js";
import User from "../DB/Models/users.model.js";
import { verifyToken } from "../Utils/tokens.utils.js";

const authenticationMiddleware = async (req, res, next) => {
    const { accesstoken } = req.headers
    if (!accesstoken) return res.status(400).json({ message: "Please provide an access token" });

    try {
        // verify token
        const decodedData = verifyToken(accesstoken, process.env.JWT_ACCESS_SECRET)
        if (!decodedData.jti) {
            return res.status(401).json({ message: "invalid token" })
        }

        // check if token is black listed
        const blackListedToken = await BlackListedTokens.findOne({ tokenId: decodedData.jti })
        if (blackListedToken) {
            return res.status(401).json({ message: "Token is black listed" });
        }

        // Get User data from DB
        const user = await User.findById(decodedData?.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "User account is deactivated" });
        }

        req.loggedInUser = { user, token: { tokenId: decodedData.jti, expirationDate: decodedData.exp } }
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log(error);
            return res.status(401).json({ message: "Token has expired, please login again" });
        }
        if (error.name === 'JsonWebTokenError') {
            console.log(error);
            return res.status(401).json({ message: "Invalid token" });
        }
        console.log(error);
        return res.status(500).json({ message: "Token verification failed" });
    }
}

export default authenticationMiddleware;