import mongoose from 'mongoose'


const invitationSchema = new mongoose.Schema({
    key: { 
        type: String, 
        required: true, 
        unique: true 
    },
    generatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    isUsed: { 
        type: Boolean, 
        default: false 
    },
    usedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' // Se llena cuando alguien se registra con esta key
    }
}, { timestamps: true });

export default mongoose.model('Invitatiton', invitationSchema)