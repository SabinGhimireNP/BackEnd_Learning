import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';

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
    console.log(username)

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
        throw new ApiError(409, "username or password already in use");
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
        coverImage: coverImage.url || "",
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
export {registerUser}