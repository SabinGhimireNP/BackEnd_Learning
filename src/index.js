import dotenv from "dotenv"
import { request } from "express"
import connectDB from "./db/index.js"

dotenv.config({path: "./env"})

connectDB()