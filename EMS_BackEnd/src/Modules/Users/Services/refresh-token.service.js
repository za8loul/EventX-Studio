import { generateToken, verifyToken } from "../../../Utils/tokens.utils.js";
import {v4 as uuidv4} from "uuid"

const refreshTokenService = (req , res) =>{
    try{
        const {refreshtoken} = req.headers

        const decodedData = verifyToken(refreshtoken , process.env.JWT_REFRESH_SECRET)

        const accesstoken = generateToken({
            id: decodedData.id,  // Use id to match the structure from login service
            email: decodedData.email,
            role: decodedData.role
        },
        process.env.JWT_ACCESS_SECRET,{
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: uuidv4()
        }
    )
    return res.status(200).json({message: "User token is refreshed successfully" , accesstoken})

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Internal server error", err });
    }
}

export default refreshTokenService;