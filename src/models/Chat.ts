import mongoose, { Schema, model, models } from "mongoose";

export interface IMessage {
    role: "user" | "assistant" | "system";
    content: string;
    toolCall?: {
        toolName: string;
        args: unknown;
        result: unknown;
    };
    createdAt: Date;
}

export interface IChat {
    userId: mongoose.Types.ObjectId | string;
    title: string;
    messages: IMessage[];
    lastMessageAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    toolCall: {
        toolName: String,
        args: Schema.Types.Mixed,
        result: Schema.Types.Mixed,
    },
    createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, default: "New Chat" },
        messages: [MessageSchema],
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default models.Chat || model<IChat>("Chat", ChatSchema);
