import dotenv from "dotenv"
import { request } from "express"
import connectDB from "./db/index.js"
import { app } from "./app.js"
dotenv.config({path: "./env"})
const port= process.env.PORT ||8000

connectDB().then(()=>{
    //Error in the database
    app.on("Error",(error)=>{
        console.log("Error: ",error);
        throw error
    })

    app.listen(process.env.PORT||800, ()=>{
        console.log(`Server is Running on port: ${port}`)
    })
}).catch((error)=>{
    //Error during connection with database
    console.log(" DataBase conncection failed:", error)
})