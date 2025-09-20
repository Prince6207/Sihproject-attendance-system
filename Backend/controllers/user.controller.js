import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import Student from "../models/student.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken ,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating token");
    }
}

// const registerUser = asyncHandler( async(req,res) => {
//     // res.status(200).json({
//     //     message: "ok"
//     // })

//     //steps to register 
//     //get user detail from frontend

//     //validation - not empty

//     // check if user already exists : username,email

//     //check for images,check fro avatar

//     //upload them to cloudinary

//     //create uer object - create entry in db

//     //remove password and refresh token field from response

//     //check for user creation

//     //retunr res

//     const {name, rollNumber, class, section,studentMail,attendance } = req.body

//     console.log("Name : " , name);
//     console.log("Roll Number : " , rollNumber);
//     console.log("Class : " , class);
//     console.log("Section : " , section);
//     console.log("Email : " , studentMail);
//     console.log("Attendance : " , attendance);

//     // if(name === "")
//     // {
//     //     throw new ApiError(400,"controller Not working")
//     // }

//     if([name ,rollNumber ,class, section, studentMail, attendance].some((field)=>
//         field?.trim() === ""
//     )){
//         throw new ApiError(400,"All fields are required");
//     }

//     const existedUser = await Student.findOne({
//         $or : [{username},{email}]
//     })

//     if(existedUser)
//     {
//         throw new ApiError(409,"User already exists")
//     }
//     console.log("🧾 Files received:", req.files);

//     const avatarLocalPath = req.files?.avatar[0]?.path;

//     const coverImageLocalPath = req.files?.coverImage[0]?.path;

//     if(!avatarLocalPath)
//     {
//         throw new ApiError(400,"Avatar file is required")
//     }

//     // const avatar = await uploadOnCloudinary(avatarLocalPath)

//     // const coverImage = await uploadOnCloudinary(coverImageLocalPath)
//     console.log("📂 Uploading avatar from:", avatarLocalPath);
//     const avatar = await uploadOnCloudinary(avatarLocalPath);

// const coverImage = coverImageLocalPath
//   ? await uploadOnCloudinary(coverImageLocalPath)
//   : null;

//     if(!avatar)
//     {
//         throw new ApiError(400," avatar field required");
//     }

//     const newUser  = await Student.create({
//         name,
//         rollNumber,
//         class: class,
//         section,
//         studentMail,
//         attendance,
//     })

//     const createdUser = await Student.findById(newUser._id).select(
//         "-password -refreshToken"
//     )

//     if(!createdUser)
//     {
//         throw new ApiError(500,"Not able to register the user")
//     }

//     return res.status(201).json(
//         new ApiResponse(200, createdUser, "User registered successfully")
//     )
// })
const registerStudent = asyncHandler(async (req, res) => {
  const { name, rollNumber, sclass, section, studentMail,avatar } = req.body;

  // Validation
  if ([name, rollNumber,sclass, section, studentMail, avatar].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if student already exists
  const existedStudent = await Student.findOne({
    $or: [{ rollNumber }, { studentMail }],
  });

  if (existedStudent) {
    throw new ApiError(409, "Student already exists");
  }

  // Optional: profile picture upload
  let avatarUrl = null;
  if (req.files?.avatar?.[0]?.path) {
    const avatarUpload = await uploadOnCloudinary(req.files.avatar[0].path);
    avatarUrl = avatarUpload?.url;
  }

  // Create new student
  const newStudent = await Student.create({
    name,
    rollNumber,
    class: studentClass,
    section,
    studentMail,
    attendance: 0, // default
    avatar: avatarUrl,
  });

  const createdStudent = await Student.findById(newStudent._id).select("-password -refreshToken");

  if (!createdStudent) {
    throw new ApiError(500, "Not able to register the student");
  }

  return res.status(201).json(
    new ApiResponse(200, createdStudent, "Student registered successfully")
  );
});


const loginUser = asyncHandler(async (req,res) => {
    //req body - access username and password from user
    //check if user alreadyy exists
    //if exists password check
    //access and refresh token
    //send cookie

    const {email,password} = req.body

    if(!email)
    {
        throw new  ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or : [{email}]
    })

    if(!user)
    {
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    console.log(isPasswordValid)

    if(!isPasswordValid)
    {
        throw new ApiError(401,"Invalid User Credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async ( req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"unauthorized")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user)
        {
            throw new ApiError(401,"Invalid refreshtoken ")
        }
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"Refresh Token is expired")
        }
    
        const options = {
            httpOnly : true ,
            secure : true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken : newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?.id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(
        200 ,{},"Password changed Succesfully"
    ))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(200,req.user,"current user fetched");
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body

    if(!fullName || !email)
    {
        throw new ApiError(400,"All fields are required")
    }
})



export default registerUser;
export {loginUser,
    logoutUser,
    refreshAccessToken,changeCurrentPassword,getCurrentUser};