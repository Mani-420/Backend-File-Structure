import { Task } from '../../models/taskModel.js';

export const createTask = async (taskData) => {
  try {
    const task = new Task(taskData);
    return await task.save();
  } catch (error) {
    throw new Error('Error creating task: ' + error.message);
  }
};

export const getTasks = async () => {
  try {
    const tasks = await Task.find();
    return tasks;
  } catch (error) {
    throw new Error('Error fetching tasks: ' + error.message);
  }
};

export const getTask = async (taskId) => {
  try {
    const task = await Task.findById(taskId).populate('userId', 'userName');
    return task;
  } catch (error) {
    throw new Error('Error fetching task: ' + error.message);
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const task = await Task.findByIdAndUpdate(taskId, taskData, {
      new: true,
      runValidators: true
    });
    return task;
  } catch (error) {
    throw new Error('Error updating task: ' + error.message);
  }
};

export const deleteTask = async (taskId) => {
  try {
    const task = await Task.findByIdAndDelete(taskId);
    return task;
  } catch (error) {
    throw new Error('Error deleting task: ' + error.message);
  }
};
