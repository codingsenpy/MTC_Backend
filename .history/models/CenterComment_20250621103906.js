import mongoose from 'mongoose';


const centerCommentSchema = new mongoose.Schema({
  : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supervisor',
    required: true
  },center
  rating:{
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CenterComment = mongoose.model('CenterComment', centerCommentSchema);

export default CenterComment;
