import mongoose from 'mongoose'

const VALID_CATEGORIES = ['frontend', 'backend', 'devops', 'base de datos', 'mobile', 'otros']

const technologySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        enum: VALID_CATEGORIES,
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Technology', technologySchema)