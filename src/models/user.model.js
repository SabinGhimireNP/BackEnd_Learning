import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"

const userSchema = new Schema({
    watchHistory:[{
        type: Schema.Types.ObjectId,
        ref: 'Video',
    }],

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:{
        type: String,  //cloudnary URL
        required: true,
    },
    coverImage:{
        type: String,  //cloudnary URL
    },
    password: {
        type: String,
        required: [ true, 'Password is required' ],
        minlength: [ 8, 'Password must be at least 8 characters long' ],
    },
    refreshToken: {
        type: String,
    }
},{timestamps: true});

userSchema.pre("save", async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next;
});

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES
        }
    );
}

userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_REFRESH_SECRET,
        {
            expiresIn: process.env.ACCESS_REFRESH_EXPIRES
        }
    );
}

export const User = mongoose.model('User', userSchema);