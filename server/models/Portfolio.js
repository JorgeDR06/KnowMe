// Portfolio.js
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Portfolio', portfolioSchema);