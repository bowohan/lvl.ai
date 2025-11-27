import mongoose, { Schema, Document } from 'mongoose';

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SessionType {
  POMODORO = 'pomodoro',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break',
}

export interface IFocusSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionType: SessionType;
  status: SessionStatus;
  plannedDuration: number;
  actualDuration?: number;
  startTime: Date;
  endTime?: Date;
  tasksWorkedOn: mongoose.Types.ObjectId[];
  tasksCompleted: mongoose.Types.ObjectId[];
  focusScore?: number;
  distractionCount: number;
  aiAnalysis?: {
    summary: string;
    strengths: string[];
    improvements: string[];
    productivityScore: number;
    recommendations: string[];
    generatedAt: Date;
  };
  flowXpEarned: number;
  streakBonus: number;
  userNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FocusSessionSchema = new Schema<IFocusSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionType: {
      type: String,
      enum: Object.values(SessionType),
      default: SessionType.POMODORO
    },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.ACTIVE
    },
    plannedDuration: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 minute'],
      max: [120, 'Duration cannot exceed 120 minutes']
    },
    actualDuration: {
      type: Number,
      min: [0, 'Actual duration cannot be negative']
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    tasksWorkedOn: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],
    tasksCompleted: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],
    focusScore: {
      type: Number,
      min: 0,
      max: 100
    },
    distractionCount: {
      type: Number,
      default: 0,
      min: [0, 'Distraction count cannot be negative']
    },
    aiAnalysis: {
      summary: String,
      strengths: [String],
      improvements: [String],
      productivityScore: {
        type: Number,
        min: 0,
        max: 100
      },
      recommendations: [String],
      generatedAt: Date
    },
    flowXpEarned: {
      type: Number,
      default: 0,
      min: [0, 'Flow XP cannot be negative']
    },
    streakBonus: {
      type: Number,
      default: 0,
      min: [0, 'Streak bonus cannot be negative']
    },
    userNotes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  { 
    timestamps: true
  }
);

FocusSessionSchema.index({ userId: 1, status: 1 });
FocusSessionSchema.index({ startTime: -1 });
FocusSessionSchema.index({ userId: 1, createdAt: -1 });

FocusSessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime && !this.actualDuration) {
    const durationMs = this.endTime.getTime() - this.startTime.getTime();
    this.actualDuration = Math.round(durationMs / 60000);
  }
  next();
});

const FocusSession = mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema);
export default FocusSession;

