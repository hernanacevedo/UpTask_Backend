import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProyectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import { hasAuthorization, taskBelongToProject, taskExist } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/teamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();
router.use(authenticate)

router.get("/", ProjectController.getAllProjects);

router.post( "/",
  body("proyectName")
    .notEmpty()
    .withMessage("el nombre del Proyecto es Obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("el nombre del cliente es Obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripcion del Proyecto es Obligatorio"),
  handleInputErrors,
  ProjectController.createProjects
);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID no valido"),
  ProjectController.getProjectById
);

/**Routes for task */

router.param("projectId", projectExist);

router.put(
  "/:projectId",
  param("projectId").isMongoId().withMessage("ID no valido"),
  body("proyectName")
    .notEmpty()
    .withMessage("el nombre del Proyecto es Obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("el nombre del cliente es Obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripcion del Proyecto es Obligatorio"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
);

router.delete(
  "/:projectId",
  param("projectId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
);



router.post(
  "/:projectId/task",
  hasAuthorization,
  body("name").notEmpty().withMessage("el nombre de la tarea es Obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripcion del Proyecto es Obligatorio"),
  TaskController.createTask
);

router.get("/:projectId/task", TaskController.getProjectTask);

router.param('taskId',taskExist)
router.param('taskId',taskBelongToProject)

router.get(
  "/:projectId/task/:taskId",
  param("taskId").isMongoId().withMessage("ID no valido"),
  TaskController.getTaskById
);

router.put(
  "/:projectId/task/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("ID no valido"),
  body("name").notEmpty().withMessage("el nombre de la tarea es Obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripcion del Proyecto es Obligatorio"),
  handleInputErrors,
  TaskController.updateTask
);


router.delete(
  "/:projectId/task/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("ID no valido"),
  
  TaskController.deleteTask
);

router.post( "/:projectId/task/:taskId/status",
  param("taskId").isMongoId().withMessage("ID no valido"),
  body('status').notEmpty().withMessage('El estadoi es obligatorio'),
  
  TaskController.updateStatus
);

/**routes for teams */

router.post('/:projectId/team/find',
  body("email").isEmail().toLowerCase().withMessage("El email no valido"),
  handleInputErrors,
  TeamController.findMemberByEmail

)
router.get('/:projectId/team',TeamController.getProjectTeam )

router.post('/:projectId/team',
  body("id").isMongoId().withMessage("El id no valido"),
  handleInputErrors,
  TeamController.addMemberById

)
router.delete('/:projectId/team/:userId',
  param("userId").isMongoId().withMessage("El id no valido"),
  handleInputErrors,
  TeamController.removeMemberById

)


/**Routes for Notes */


router.post('/:projectId/task/:taskId/notes',
  body("content").notEmpty().withMessage("El contenido de la nota es obligatorio"),
  handleInputErrors,
  NoteController.createNote

)

router.get('/:projectId/task/:taskId/notes',
  body("content").notEmpty().withMessage("El contenido de la nota es obligatorio"),
  //handleInputErrors,
  NoteController.getTaskNotes

)
router.delete('/:projectId/task/:taskId/notes/:noteId',
  param("noteId").isMongoId().withMessage("El id no valido"),
  handleInputErrors,
  NoteController.deleteNote

)
export default router;
