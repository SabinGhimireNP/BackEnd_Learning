import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';


const generateAccessAndRefreshToken = async (userId)=> {
    try {
       const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

        user.refreshToken(refreshToken)
       await user.save({ validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wronf while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    /*
        1) get details from frontend
        2) Valildation: (empty or not)
        3) check for user existance in the db
        4) check for image (if any)
        5) upload the images to the dedeicated location
        6) push the userdata into the database
        7) remove password and refresh token from response 
        8) check the status of creation of user in the database
        9) return response
    */
    
        // 1) Get users data
    const {username,email, fullName, password}=req.body
    // console.log(username)
    // console.log(req)

    // 2) Validate the given data
    // if(fullName ===" ") {throw ApiError(400, "Cant find full Name")}
    if([username, email, fullName, password].some((field)=> field?.trim()==="")){
        throw new ApiError(400, "All field are Required")
    }

    // 3) check for already exiting users
    const ExistingUser= await User.findOne({
        $or: [{email}, {username}]
    })

    if(ExistingUser){
        throw new ApiError(409, "username or email already in use");
    }

    // 4)  check for image uploads
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if(!avatarLocalPath){ throw new ApiError(400, "Avatar photo is required")}

    // 5) upload the images to their dedicated locations
   const avatar= await uploadOnCloudinary(avatarLocalPath)
   const coverImage= await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){ throw new ApiError(400, "Avatar photo is required")}
   
//    6) push the userdata into the database
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
    })

    // 7) remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // 8) check the status of creation of user in the database
    if(!createdUser) {
        throw new ApiError(500, "Error occured during registration"); 
    }

    // 9) return response
     return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registration successfully")
     )
});

const loginUser = asyncHandler(async (req, res) => {
    /*
    1) get the data from frontend.
    2) check if user exists or not
    3) find the user
    4) check password
    5) access and refresh token 
    6) send data to the frontend
    */

    // 1) request data 
    const {email, password, username} = req.body

    if(!username || !email){ throw new ApiError(400, "Please fill the required fields")}

    const UserExist =await  User.findOne({
        $or: [{ email }, {username}]
    })
    if(!UserExist) {throw new ApiError(404, "User not found")}

    const isPasswordValid = await UserExist.get.comparePassword(password)
    if(!isPasswordValid) {throw new ApiError(401, "Invalid user credentials")}

    generateAccessAndRefreshToken(user._id)

    const loggedinUser =await User.findById(user._id).select("-password -refreshToken")

    const options = {
    httpsOnly : true,
    secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedinUser,
            refreshToken,
            accessToken
        },
    "User LoggedIn successfully")
    )
})

const logOutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set: {
            refreshToken: undefined
        }
    },{
        new: true
    })
    
    const options = {
    httpsOnly : true,
    secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refresgToken",options)
    .json(new ApiResponse(200, {}, "user Logged Out"))
})

export {registerUser, loginUser, logOutUser}