import type { Request, Response } from "express";

import Task from "../models/Task";
import Project from "../models/Project";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      // aca agrego a cada tareas al proyecto
      const task = new Task(req.body);
      task.project = req.project.id;
      // aca le agrego al proyecto todas las tareas
      req.project.tasks.push(task.id);
      await Promise.allSettled([task.save(), req.project.save()]);
      res.send("Tarea creada correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static getProjectTask = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ errors: "Hubo un error" });
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task= await Task.findById(req.task.id)
      .populate({path: 'completedBy.user',select: 'id name email' })
      .populate({path: 'notes',populate:{path: 'createdBy', select: 'id name email'}})
      res.json(task);
    } catch (error) {
      res.status(500).json({ errors: "Hubo un error" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {

      req.task.name = req.body.name;
      req.task.description = req.body.description;

      await req.task.save();

      res.send("Tarea actualizada correctamente");
    } catch (error) {
      res.status(500).json({ errors: "Hubo un error" });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
    

      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== req.task.id.toString()
      );

      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);

      res.send("Tarea eliminada correctamente");
    } catch (error) {
      res.status(500).json({ errors: "Hubo un error" });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      const {status}= req.body
      req.task.status=status
      const data= {
        user:req.user.id,
        status
      }
      req.task.completedBy.push(data)
      
      await req.task.save();
      res.send("Tarea actualizada")

    } catch (error) {
      res.status(500).json({ errors: "Hubo un error" });
    }
  };
}
