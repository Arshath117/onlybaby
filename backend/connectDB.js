import mongoose from "mongoose";


export const connectDB = async() => {
    try{
        console.log(process.env.MONGO_URI) 
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MONGODB connected : ${conn.connection.host}`);
    }catch(error){
        console.log("Error in DB connection",error.message);
        process.exit(1); 
    }
}

