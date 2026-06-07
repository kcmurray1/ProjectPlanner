
import { makeAutoObservable, runInAction} from "mobx";
import { CustomApiRequest } from "./../FetchApI";
import type { CanvasStore } from "./CanvasStore";


interface Task {
    description: string
    title: string
    status: string
    id: number
}



export class ObservableTaskModel {
    id: number;
    title: string;
    status: string;
    description: string = "";

    constructor(id: number, title: string, status: string = "not_started", description: string) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.description = description;
        makeAutoObservable(this);
    }

    updateStatus(newStatus: string) {
        this.status = newStatus;
    }

    async updateProperty(id: number, payload: Partial<ObservableTaskModel>) {
        try {
            Object.assign(this, payload);
            await CustomApiRequest<{name: string}>(`tasks/${id}`, payload, "PATCH");
        }
        catch (err) {
            console.error('failed to update task', err);
        }
    }
}


export class TaskStore {
    canvasStore: CanvasStore
    tasksMap = new Map<string, ObservableTaskModel>();

    constructor(rootStore: CanvasStore) {
        this.canvasStore = rootStore; 
    }

    addTask(taskData: Task) {
        const newTaskModel =  new ObservableTaskModel(
                    taskData.id,
                    taskData.title,
                    taskData.status,
                    taskData.description
            )
        this.tasksMap.set(String(taskData.id), newTaskModel)
        return newTaskModel;
    }

    async createTask(nodeID: string) {
        try {
            let defaultTask = {"title": "task title", "description": "Add a task using a btn"}
            const newTask = await CustomApiRequest<Task>(`components/${nodeID}/tasks`, defaultTask, "POST")
            return runInAction(() =>{
                return this.addTask(newTask);
            })
         } catch (err) {
            console.error("failed to create task", err);
            return null;
        }
    }

    async delete(task: ObservableTaskModel) {
        try {
            await CustomApiRequest<{status: string}>(`tasks/${task.id}`, {}, "DELETE")
            runInAction(() => {
                this.tasksMap.delete(String(task.id));
            })
        } catch (err) {

        }
    }
}