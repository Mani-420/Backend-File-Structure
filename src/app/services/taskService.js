import * as taskRepository from '../repositories/taskRepository.js';

export const createTask = async (userId, taskData) => {
  try {
    const newTask = await taskRepository.createTask({ ...taskData, userId });
    return newTask;
  } catch (error) {
    throw new Error('Error creating task: ' + error.message);
  }
};

export const getTask = async (userId, taskId) => {
  try {
    const task = await taskRepository.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    if (task.userId.toString() !== userId) {
      throw new Error('Unauthorized: You can only access your own tasks');
    }
    return task;
  } catch (error) {
    throw new Error('Error fetching task: ' + error.message);
  }
};

export const updateTask = async (userId, taskId, taskData) => {
  try {
    const updatedTask = await taskRepository.updateTask(taskId, taskData);
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    if (updatedTask.userId.toString() !== userId) {
      throw new Error('Unauthorized: You can only update your own tasks');
    }
    return updatedTask;
  } catch (error) {
    throw new Error('Error updating task: ' + error.message);
  }
};

export const deleteTask = async (userId, taskId) => {
  const deleteTask = await taskRepository.deleteTask(userId, taskId);
  if (!deleteTask) {
    throw new Error('Task not found');
  }
  if (deleteTask.userId.toString() !== userId) {
    throw new Error('Unauthorized: You can only delete your own tasks');
  }
  return deleteTask;
};

export const getUserTasks = async (userId) => {
  try {
    const tasks = await taskRepository.getTasks();
    if (!tasks || tasks.length === 0) {
      throw new Error('No tasks found');
    }
    return tasks.filter((task) => task.userId.toString() === userId);
  } catch (error) {
    throw new Error('Error fetching user tasks: ' + error.message);
  }
};
