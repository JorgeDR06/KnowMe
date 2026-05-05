import mongoose from 'mongoose'

const porfolioSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    media: [{
        url: String,
        publicId: String,
        type: { 
            type: String, 
            enum: ['image', 'video'] 
        }
    }],
    technologies: 
        [String],
    languages: 
        [String],
    githubRepo: { 
        type: String 
    },
    liveDemo: { 
        type: String 
    },
    featured: { 
        type: Boolean, 
        default: false 
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Porfolio', porfolioSchema)