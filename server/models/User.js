import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    bio: { 
        type: String 
    },
    skills: 
        [String],
    languages: 
        [String],
    role: { 
        type: String, 
        enum: ['admin', 'user'], 
        default: 'user' 
    },
    avatar: { 
        type: String, 
        default: null
    },
    socialLinks: {
        github: String,
        linkedin: String,
        twitter: String,
        website: String
    },
    invitedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema)