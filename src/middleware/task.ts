import type { Request, Response, NextFunction } from 'express';

import Task, { ITask } from '../models/Task';

declare global{
    namespace Express {
        interface Request{
            task:ITask
        }
    }
}


export async function taskExist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const {taskId}=req.params
            const task = await Task.findById(taskId)
            if(!task){
                const error = new Error('tarea no encontrada')
                 res.status(404).json({error: error.message})
            }
            req.task=task
            next()
    }
    catch(error){
        res.status(500).json({ errors: 'Hubo un error'});
    }
    
}

export function taskBelongToProject(req: Request, res: Response, next: NextFunction) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error("Accion no valida");
        res.status(400).json({ error: error.message });
      }
      next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error("Accion no valida");
        res.status(400).json({ error: error.message });
      }
      next()
}