import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const tokenSchema= new mongoose.Schema({
    tutorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tutor',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    