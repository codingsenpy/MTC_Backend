import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const tokenSchema= new mongoose.Schema({
    tutor