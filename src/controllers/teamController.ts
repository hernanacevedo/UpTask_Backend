import { Request ,Response } from "express"
import User from "../models/auth";
import Project from "../models/Project";

export class TeamController {
    static findMemberByEmail = async (req: Request, res: Response): Promise<void> => {
      try {
        const{email}= req.body
        const user = await User.findOne({email}).select('id email name')
        if(!user){
            const error= new Error("Usuario no Encontrado")
            res.status(404).json({error:error.message})
            return
        }
        res.json(user)
      } catch (error) {
        res.status(500).json({ errors: "Hubo un error" });
        return
      }
    }
    static addMemberById = async (req: Request, res: Response): Promise<void> => {
        try {
        const{id}= req.body
        console.log(id)
        const user = await User.findById(id).select('id')
        console.log(User)
        if(!user){
            const error= new Error("Usuario no Encontrado")
            res.status(404).json({error:error.message})
            return
        }
        if(req.project.team.some(team=> team.toString()=== user.id.toString())){
            const error= new Error("El usuario ya existe en el proyecto")
            res.status(409).json({error:error.message})
            return
        }
        req.project.team.push(user.id)
        await req.project.save()
        res.send("usuario agregado correctamente")
        } catch (error) {
          res.status(500).json({ errors: "Hubo un error" });
          return
        }
      }

      static removeMemberById = async (req: Request, res: Response): Promise<void> => {
        const{userId}= req.params

        if(!req.project.team.some(team=> team.toString()=== userId)){
            const error= new Error("El usuario no existe en el proyecto")
            res.status(409).json({error:error.message})
            return
        }

        req.project.team=req.project.team.filter(teamMember=> teamMember.toString() !==userId)
        await req.project.save()
        res.send("usuario removido correctamente")
      }

      
      static getProjectTeam = async (req: Request, res: Response): Promise<void> => {
        const project = await Project.findById(req.project.id).populate({
          path:'team',
          select: 'id email name'
        })
        res.json(project.team)
       
      }
}