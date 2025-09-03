import User from "../../../DB/Models/users.model.js";
import BlackListedTokens from "../../../DB/Models/black-listed-tokens.model.js";

const logoutService = async (req , res) =>{
   const {token: {tokenId , expirationDate} , user:{_id} } = req.loggedInUser;

    await BlackListedTokens.create({
        tokenId,
        expirationDate: new Date(expirationDate * 1000),
        userId: _id
    })

    return res.status(200).json({message: "User logged out successfully"});
}

export default logoutService;