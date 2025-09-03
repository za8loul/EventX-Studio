import { compareSync } from "bcrypt";
import User from "../../../DB/Models/users.model.js";
import {v4 as uuidv4} from "uuid"
import { generateToken } from "../../../Utils/tokens.utils.js";

const loginService = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated" });
        }

        const isPasswordMatch = compareSync(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        const accesstoken = generateToken(
            {id: user._id , email: user.email, role: user.role},
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
                jwtid: uuidv4()
            }
        )

        // generate refresh token
        const refreshtoken = generateToken(
            {id: user._id , email: user.email, role: user.role},
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
                jwtid: uuidv4()
            }
        )

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({ 
            message: "User signed in successfully", 
            accesstoken, 
            refreshtoken,
            user: userResponse
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", err });
    }
}

export default loginService;