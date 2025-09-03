import mongoose from "mongoose";

const blackListedTokensSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
        unique: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const BlackListedTokens = mongoose.model("blackListedTokens" , blackListedTokensSchema)

export default BlackListedTokens;