import dotenv from "dotenv"
import { request } from "express"
import connectDB from "./db/index.js"

dotenv.config({path: "./env"})

connectDB().then(()=>{
    //Error in the database
    app.on("Error",(error)=>{
        console.log("Error: ",error);
        throw error
    })

    app.listen(process.env.PORT||800, ()=>{
        console.log(`Server is Running on port: ${process.env.PORT ||8000}`)
    })
}).catch((error)=>{
    //Error during connection with database
    console.log(" DataBase conncection failed:", error)
})