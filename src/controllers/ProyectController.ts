import type { Request, Response } from "express";

import Project from "../models/Project";
import { isPropertyDeclaration } from "typescript";

export class ProjectController {
  static createProjects = async (req: Request, res: Response) => {
    const project = new Project(req.body);
    //Asigna un manager
    project.manager= req.user.id
    try {
      await project.save();
      res.send("Proyecto Creado correctamente");
    } catch (error) {
      console.log(error);
    }
  };
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or:[
          {manager:{$in:req.user.id}},
          {team:{$in:req.user.id}}
      ]});
      res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };
  static getProjectById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id).populate("tasks");
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        res.status(404).json({ error: error.message });
        return
      }
      if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)){
        const error = new  Error('Accion no valida')
        res.status(404).json({ error: error.message });
        return
      }
      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };
  static updateProject = async (req: Request, res: Response): Promise<void> => {

    try {
     
      req.project.clientName = req.body.clientName;
      req.project.proyectName = req.body.proyectName;
      req.project.description = req.body.description;

      await req.project.save();

      res.send("proyecto actualizado");
    } catch (error) {
      console.log(error);
    }
  };
  static deleteProject = async (req: Request, res: Response): Promise<void> => {
   try{

      await req.project.deleteOne()
      res.send("proyecto eliminado");
    } catch (error) {
      console.log(error);
    }
  };
}
