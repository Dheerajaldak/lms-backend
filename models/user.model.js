import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema({
    fullName: {  // corrected typo from 'fulName' to 'fullName'
        type: 'String',
        required: [true, 'Name is required'],
        minlength: [3, 'Name must be at least 3 characters'], // corrected from 'minLenth' to 'minlength'
        maxlength: [50, 'Name must be less than 50 characters'], // corrected from 'maxLenth' to 'maxlength'
        lowercase: true,
        trim: true,
    },
    email: {
        type: 'String',
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        unique: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please fill in a valid email address'],
    },
    password: {
        type: 'String',
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'], // corrected from 'minLenth' to 'minlength'
        select: false,
    },
    avatar: {
        public_id: {
            type: 'String'
        },
        secure_url: {
            type: 'String'
        }
    },
    role: {
        type: 'String',
        enum: ['USER', 'ADMIN'],
        default: 'USER',
    },
    forgotPasswordToken: { // corrected spelling from 'forgotPasswoedToken' to 'forgotPasswordToken'
        type: 'String',
    },
    forgotPasswordExpiry: { // corrected spelling from 'forgotPasswoedExpiry' to 'forgotPasswordExpiry'
        type: Date,
    }
}, {
    timestamps: true, // corrected 'timestapms' to 'timestamps'
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    // bcrypt is used to encrypt data
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods = {
    generateJWTToken: async function () {
        return jwt.sign(
            { id: this.id, email: this.email, subscription: this.subscription, role: this.role },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY,
            }
        );
    },

    comparePassword: async function (plainTextPassword) {  // corrected spelling from 'comprePassword' to 'comparePassword'
        return bcrypt.compare(plainTextPassword, this.password);
    },

    generatePasswordResetToken: async function () {
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        this.forgotPasswordToken = crypto  // corrected spelling from 'forgotPasswoedToken' to 'forgotPasswordToken'
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now
        return resetToken;
    }
};

const User = model('User', userSchema);

export default User;
