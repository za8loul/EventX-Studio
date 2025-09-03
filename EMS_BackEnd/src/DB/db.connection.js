// Database Connection
import mongoose from "mongoose";

const dbConnection = async ()=>{
    try{
        
        if (!process.env.DB_URL_LOCAL) {
            throw new Error("DB_URL_LOCAL environment variable is not set");
        }
        
        await mongoose.connect(process.env.DB_URL_LOCAL);
        console.log("Database connected successfully");
        
    }catch(err){
        console.log("Database connection failed",err);
        
    }
}

export default dbConnection;