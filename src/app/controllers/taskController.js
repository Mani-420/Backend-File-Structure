import * as taskService from '../services/taskService.js';
import {
  successResponse,
  errorResponse
} from '../../factories/responseFactory.js';

export const createTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, status } = req.body;

    if (!title || !description) {
      const response = errorResponse('All fields are required');
      return res.status(400).json(response);
    }

    const task = await taskService.createTask(userId, {
      title,
      description,
      status
    });
    return res
      .status(201)
      .json(successResponse(task, 'Task created successfully'));
  } catch (error) {
    const response = errorResponse('Failed to create task: ' + error.message);
    return res.status(500).json(response);
  }
};

export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await taskService.getUserTasks(userId);
    return res
      .status(200)
      .json(successResponse(tasks, 'Tasks fetched successfully'));
  } catch (error) {
    const response = errorResponse('Failed to fetch tasks: ' + error.message);
    return res.status(500).json(response);
  }
};

export const getTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.taskId;

    const task = await taskService.getTask(userId, taskId);
    return res
      .status(200)
      .json(successResponse(task, 'Task fetched successfully'));
  } catch (error) {
    const response = errorResponse('Failed to fetch task: ' + error.message);
    return res.status(500).json(response);
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.taskId;
    const { title, description, status } = req.body;

    if (!title || !description || !status) {
      const response = errorResponse('All fields are required');
      return res.status(400).json(response);
    }

    const updatedTask = await taskService.updateTask(userId, taskId, {
      title,
      description,
      status
    });
    return res
      .status(200)
      .json(successResponse(updatedTask, 'Task updated successfully'));
  } catch (error) {
    const response = errorResponse('Failed to update task: ' + error.message);
    return res.status(500).json(response);
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.taskId;

    const deletedTask = await taskService.deleteTask(userId, taskId);
    return res
      .status(200)
      .json(successResponse(deletedTask, 'Task deleted successfully'));
  } catch (error) {
    const response = errorResponse('Failed to delete task: ' + error.message);
    return res.status(500).json(response);
  }
};
