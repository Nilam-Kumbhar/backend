import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse}from "../utils/ApiResponse.js"

// access and refresh method
const genrateAccessandRefreshTokens = async (userId) =>{
    try {
        const user= await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token.")
    }
}


const registerUser= asyncHandler( async (req,res)=>{
    // register user 

    // get user details from frontend(here postman)
    const {fullName,email,username,password}=req.body
    // console.log("email: ",email);
    
    // validation (eg,not empty,correct email/password,..)
   
    // if(fullname===""){
    //     throw new ApiError(400,"fullname is required")
    // }
    if([fullName,email,username,password].some((field)=> field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    // check if user already exists thr: username,email
    const existedUser =await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist.")
    }

    // console.log(req.files);

    // check for img, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required.")
    }

    // upload them on cloudinary,avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
                throw new ApiError(400,"Avatar file is required.")
    }

    // create user object - create entry in db (.create({}))
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser , "User registered successfully.")
    )

    // res.status(200).json({
    //     message: "ok"
    // })
    
} )

const loginUser = asyncHandler( async (req ,res) => {
    // take data from req body
    const {email,username,password}= req.body

    // username/email is available
    if (!username || !email){
        throw new ApiError(400,"username or email is required")
    }

    // find user
    const user= await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    // password check 
    const isPasswordValid =await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"invalid user password ")
    }

    // genrate access and refresh token
    const {accessToken, refreshToken} = await genrateAccessandRefreshTokens(user._id)

    // send this token in cookies 
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )//optional

    const options ={
        httpOnly: true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "user logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
// cleare cookies
    const options ={
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))
})

export {registerUser , loginUser , logoutUser}