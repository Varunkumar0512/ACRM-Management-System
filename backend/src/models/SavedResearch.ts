import mongoose, { Document, Schema } from 'mongoose';

export type SavedItemType = 'PAPER' | 'TOPIC' | 'IDEA';

export interface ISavedResearch extends Document {
  userId: mongoose.Types.ObjectId;
  itemType: SavedItemType;
  paperId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  ideaId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const savedResearchSchema = new Schema<ISavedResearch>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['PAPER', 'TOPIC', 'IDEA'],
      required: true,
      index: true,
    },
    paperId: {
      type: Schema.Types.ObjectId,
      ref: 'ResearchPaper',
      default: null,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'ResearchTopic',
      default: null,
    },
    ideaId: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectIdea',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

savedResearchSchema.index({ userId: 1, itemType: 1, paperId: 1 });
savedResearchSchema.index({ userId: 1, itemType: 1, topicId: 1 });
savedResearchSchema.index({ userId: 1, itemType: 1, ideaId: 1 });

export const SavedResearch = mongoose.model<ISavedResearch>('SavedResearch', savedResearchSchema);
