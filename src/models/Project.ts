import mongoose,{Schema,Document,PopulatedDoc,Types} from "mongoose";
import  Task, { ITask } from "./Task";
import { IUser } from "./auth";
import Note from "./Note";

export interface IProyect extends Document {
    proyectName:string;
    clientName: string;
    description: string;
    tasks: PopulatedDoc<ITask & Document>[]
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[]
}

const ProjectShema: Schema = new Schema({
    proyectName:{
        type:String,
        require: true,
        trim:true,
    },
    clientName:{
        type:String,
        require: true,
        trim:true,
    },
    description:{
        type:String,
        require: true,
        trim:true,
    },
    tasks:[{
        type:Types.ObjectId,
        ref:'Task'
    }],
    manager:{
        type:Types.ObjectId,
        ref:'User'
    },
    team:[{
        type:Types.ObjectId,
        ref:'User'
    }],

}, {timestamps:true})

// middleware

ProjectShema.pre('deleteOne',{document:true},async function(){
    const projectId= this._id
    if(!projectId) return 
    const tasks= await Task.find({ project:projectId })
    for (const task of tasks){
        await Note.deleteMany({task: task.id})
    }
    await Task.deleteMany({project:projectId})
    
  })

const Project = mongoose.model<IProyect>('Project',ProjectShema)
export default Project;