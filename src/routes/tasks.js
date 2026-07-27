const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');
const { getTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/tasks');

const taskSchema = Joi.object({
    title: Joi.string().required(),
    status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
    due_date: Joi.date().iso().optional(),
    project_id: Joi.number().integer().required()
});

const taskUpdateSchema = Joi.object({
    title: Joi.string().optional(),
    status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
    due_date: Joi.date().iso().optional(),
});

router.use(auth);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get tasks with pagination and filtering
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of tasks
 *   post:
 *     summary: Create task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - project_id
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               project_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created task
 */
router.route('/')
    .get(getTasks)
    .post(validate(taskSchema), createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task object
 *   patch:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Updated task
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 */
router.route('/:id')
    .get(getTask)
    .patch(validate(taskUpdateSchema), updateTask)
    .delete(deleteTask);

module.exports = router;
