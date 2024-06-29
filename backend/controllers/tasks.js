const prisma = require("../config/db");

class TasksController {
  constructor() {
    this.prisma = prisma;
  }

  async getTasks(input) {
    const { id } = input;
    return await this.prisma.tasks.findMany({
        where: {
            groupId: id
        }
    });
  }

  async createTask(input) {
    try {
        const { title, groupId, content, completeBy, assignedTo } = input;
        await this.prisma.tasks.create({
            data: {
                title,
                groupId,
                content,
                completeBy,
                assignedTo
            }
        });
        return {
            message: "Task created successfully!",
            success: true
        }
    } catch (error) {
        return {
            message: error.message,
            success: false
        }
    }
  }

  async updateTask(input) {
    try {
        const { id, title, content, completeBy, status, assignedTo } = input;
        await this.prisma.tasks.update({
            where: {
                id
            },
            data: {
                title,
                content,
                completeBy,
                status,
                assignedTo
            }
        });
        return {
            message: "Task updated successfully!",
            success: true
        }
    } catch (error) {
        return {
            message: error.message,
            success: false
        }
    }
  }

  async deleteTask(input) {
    try {
        const { id } = input;
        await this.prisma.tasks.delete({
            where: {
                id
            }
        });
        return {
            message: "Task deleted successfully!",
            success: true
        }
    } catch (error) {
        return {
            message: error.message,
            success: false
        }
    }
  }
}

module.exports = { TasksController };