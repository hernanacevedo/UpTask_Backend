import mongoose, { Schema, Document, Types } from "mongoose";
import Project from "./Project";
import Note from "./Note";

const taskStatus = {
  PENDING: "pending",
  ON_HOLD: "onHold",
  IN_PROGRESS: "inProgress",
  UNDER_REVIEW: "underReview",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof taskStatus)[keyof typeof taskStatus];

export interface ITask extends Document {
  name: string;
  description: string;
  project: Types.ObjectId;
  status: TaskStatus;
  completedBy: {user:Types.ObjectId,status:TaskStatus }[]
  notes: Types.ObjectId[]
}
const TaskShema: Schema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    description: {
      type: String,
      require: true,
      trim: true,
    },
    project: {
      type: Types.ObjectId,
      ref: "Project",
    },
    status: {
      type: String,
      enum: Object.values(taskStatus),
      default: taskStatus.PENDING,
    },
    completedBy: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
          default: null,
        },
        status: {
          type: String,
          enum: Object.values(taskStatus),
          default: taskStatus.PENDING,
        },
      },
    ],
    notes:[
      {
        type: Types.ObjectId,
          ref: "Note",
      }
    ]
  },
  { timestamps: true }
);

//Middleware

TaskShema.pre('deleteOne',{document:true},async function(){
  const taskId= this._id
  if(!taskId) return 
  await Note.deleteMany({task:taskId})
  
})

const Task = mongoose.model<ITask>("Task", TaskShema);
export default Task;
// 1 proyecto tiene muchas tareas, y una tarea esta asignada a un porjecto
