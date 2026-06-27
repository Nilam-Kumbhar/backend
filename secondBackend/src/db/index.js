// db connecting in std way using saprate file and just import in main index.js file

import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

// db is another continant
const connectDB=async () => {
    try{
        console.log("MONGODB_URI:", process.env.MONGODB_URI);

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST:${connectionInstance.connection.host} `)
    }catch(error){
        console.log("error:", error);
        // throw error  
        process.exit(1)    //process ek ref hai application ek process pr chal rahi he uska
                           
    }
}

export default connectDB