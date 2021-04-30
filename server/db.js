import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
    },
    socket_id: {
        type: String,
        required: true,
    }
})

export const Users = mongoose.model('Users', UserSchema)
