const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const userModel = require("./models/userSchema");

// for has pasword
const bcrypt = require("bcryptjs")

// for creating token for login
const jwt = require("jsonwebtoken");
const middlewares = require("./middlewares");

const PORT = process.env.PORT || 5000;

const BASE_URI = `mongodb+srv://devahtesham:devahtesham@cluster0.tjplgan.mongodb.net/CRUD-APP`
    
// DB connection
mongoose.connect(BASE_URI)
    .then((res) => console.log("MongoDB Connect"))
    .catch((err)=> console.log("error",err))


// body parser for getting json body on a server (always place on top of al apis )
app.use(express.json())

// this is a package need to install when we are calling the below apis from frontend application via fetch or axios etc.
app.use(cors())

// ====================== AUTHENTICATION APIS ===========================
// signup api 
app.post("/api/signup",async(request,response)=>{
    const {name,email,password,mobileNumber} = request.body
    if(!name || !email || !password || !mobileNumber){
        response.json({
            message:"Required Fields are missing !"
        })
        return
    }

     // hash our password
    const hashPassword = await bcrypt.hash(password,10) // hash(password,round/layer) is a method which is asynchronous so we will use async await

    // Note:- Before sending the data on DB to signup, first we will check if the same users also exist on db, if this we dont signup this user again, we will show an error message that email already in use, we compare email for checking duplicate user bcz email must be unique for every user
    userModel.findOne({email})
        .then((user)=>{
            if (user){
                response.json({
                    message:"Email Address already in use !"
                })
            }else{
               
                // sending data to db for signing up
                const objectToSend = {
                    ...request.body, // is jgaa mera phone number is key men aaegaa (mobileNumber) but is poory object men db pr srf wohi fields jaengi jo mene schema men btai hongi 
                    mobile_number:mobileNumber,
                    password:hashPassword,      // password in hashed form
                }
                userModel.create(objectToSend)
                    .then((user)=>{
                        response.json({
                            message:"User successfully signup",
                            data:user,
                            status:true
                        })
                    })
                    .catch(()=>{
                        response.json({
                            message:"Something Went Wrong !",
                        })
                    })
            }
        })
        .catch((err)=>{
            // this catch is for DB throws an error
            response.json({
            message:`error:- ${err}`
        })
    })
})

// login api
app.post("/api/login",(request,response)=>{ 
    const {email,password} = request.body

    if (!email || !password){
        response.send({
            message:"Required Fields are missing !"
        })
        return
    }

    userModel.findOne({email})
        .then(async(user)=>{
            if(user){
                const isPasswordMatched = await bcrypt.compare(password,user.password)
                // console.log("isPasswordMatched",isPasswordMatched);   // it return true n case of match, else false
                if (isPasswordMatched){
                    // create token for sending when user has successfully logged in
                    const tokenObj = {
                        ...user
                    }
                    const token = jwt.sign(tokenObj,"UserLoginTokenKey")
                    // console.log("token",token);

                    response.json({
                        message:"user login successfully !",
                        data:user,
                        status:true,
                        token
                    })
                }else{
                    response.json({
                        message:"Credentials not found !"
                    })

                }

            }else{
                 response.json({
                        message:"User not found !"
                    })
            }
        })
        .catch((err)=>{
            response.json({
                message:`error:- ${err}`
            })
        })
})

// ================= MIDDLEWARE ======================

// to understand the working of middlewares
// app.use("/",(request,response,next)=>{
//     const user = false;
//     if (user){
//         next()
//     }else{
//         response.json({
//             message:"Invalid User"
//         })
//     }
// })


// this is our private API because in this API we are performing authentication
app.get("/api/checking",middlewares.authMiddleware,(request,response)=>{
    response.json({
        message:"Api Hit Successfully !"
    })
})

app.listen(PORT,() => console.log(`server is running on localhost: ${PORT}`))