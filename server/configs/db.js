import mongoose from "mongoose";
import 'dotenv/config'

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('MongoDB connected successfully'))
        await mongoose.connect(`${process.env.MOGODB_URI}/sino_ai`)
    } catch (error) {
        console.log(error.message)
    }
}

export default connectDB;