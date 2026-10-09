import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      default: ""
    },
    fileUrl: {
      type: String,
      default: ""
    },
    fileName: {
      type: String,
      default: ""
    },
    fileType: {
      type: String,
      default: ""
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
