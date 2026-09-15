import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectDiscussion extends Document {
  projectId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  attachments?: {
    name: string;
    url: string;
    fileSize: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const projectDiscussionSchema = new Schema<IProjectDiscussion>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        fileSize: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const ProjectDiscussion = mongoose.model<IProjectDiscussion>(
  'ProjectDiscussion',
  projectDiscussionSchema
);
