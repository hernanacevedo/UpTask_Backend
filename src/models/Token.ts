import mongoose,{Schema,Document,PopulatedDoc,Types} from "mongoose";

export interface IToken extends Document{
    token: string
    user: Types.ObjectId
    createdAt: Date
}
const tokenSchema : Schema = new Schema({
    token:{
        type:String,
        required:true
    },
    user:{
        type:Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt:{
        type:Date,
        default: () => Date.now() + 10 * 60 * 1000,
        expires:0
    }
})

const Token = mongoose.model<IToken>('Token',tokenSchema)
export default Token;