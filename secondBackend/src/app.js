import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()
// use is mostly used for middleware and configuration
// app.use(cors()) //commen
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) //accept data from json file
app.use(express.urlencoded({extended:true, limit:"16kb"})) //accepts data from url
// extended - obj in obj nested obj
app.use(express.static("public")) //this used to store img, febicon,pdf data

app.use(cookieParser())



export {app}