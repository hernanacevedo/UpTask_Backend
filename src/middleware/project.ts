import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Project, { IProyect } from '../models/Project';

declare global{
    namespace Express {
        interface Request{
            project:IProyect
        }
    }
}


export async function projectExist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const {projectId}=req.params
            const project= await Project.findById(projectId)
            if(!project){
                const error = new Error('Proyecto no encontrado')
                 res.status(404).json({error: error.message})
            }
            req.project =project
            next()
    }
    catch(error){
        res.status(500).json({ errors: 'Hubo un error'});
    }
    
}