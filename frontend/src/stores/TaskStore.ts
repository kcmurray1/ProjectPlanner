
import { makeAutoObservable, runInAction} from "mobx";
import { CustomApiRequest } from "./../FetchApI";
import type { CanvasStore } from "./CanvasStore";
import type { ObservableNodeModel } from "./NodeStore";


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

    async createTask(taskData: any, node: ObservableNodeModel) {             
        try {
            const newTask = await CustomApiRequest<Task>(`components/${node.id}/tasks`, taskData, "POST")
            runInAction(() =>{
                this.canvasStore.selectedTask = node.addTask(newTask);
            })
            
        } catch (err) {
            console.error("failed to create task", err);
        }
    }
}