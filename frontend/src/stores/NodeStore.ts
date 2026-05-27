import { makeAutoObservable, reaction, runInAction, toJS } from "mobx";
import type { Node } from "@xyflow/react";
import { CustomApiRequest, type GetComponent } from "./../FetchApI";
import { ObservableTaskModel } from "./TaskStore";
import type { CanvasStore } from "./CanvasStore";

export class ObservableNodeModel {
    id: string;
    label: string;
    type: string;
    parent_id: string | null;
    isPriority: boolean = false;
    isEditing: boolean = false;
    isSelected: boolean = false;
   

    tasks: ObservableTaskModel[] = []

    constructor(id: string, name: string, type: string, parent_id: string | null) {
        this.id = id;
        this.label = name;
        this.type = type;
        this.parent_id = parent_id;
        makeAutoObservable(this);
    }

    addTask(taskData: any) {
        const newTask = new ObservableTaskModel(
                taskData.id,
                taskData.title,
                taskData.status,
                taskData.description
            )
        this.tasks.push(
            newTask
        );

        return newTask
    }

    get progress() {
        if (this.tasks.length === 0) return 100;
        return (this.tasks.filter(t => t.status === "completed").length / this.tasks.length) * 100;
    }

    

    
}

export class NodeStore {

    canvasStore: CanvasStore
    nodesMap = new Map<string, ObservableNodeModel>();

    constructor(rootStore: CanvasStore) {
        this.canvasStore = rootStore; 

    }

    clear() {
        this.nodesMap.clear();
    }

    addNode(node: any) {
        const { label } = node.data as {label: string};
        const nodeModel = new ObservableNodeModel(
            node.id,
            label,
            node.type ? node.type : "textNode",
            node.parentId ? node.parentId : null
        )

        this.nodesMap.set(node.id, nodeModel);
        return nodeModel;
    }

    async createNode (x: number, y: number, type: string) {
        const payload = {
            name: 'New Node', 
            x_pos: x, 
            y_pos: y, 
            width: 230, 
            height: 150, 
            parent_id: this.canvasStore.currentPane, 
            project_id: this.canvasStore.currentProject.id,
            type: type

        }
        try {
            const result = await CustomApiRequest<GetComponent>(`components`, payload, "POST")
            const newNode: Node = {
                id: String(result.id),
                type: type,
                data: {label: result.name},
                position: {x: result.x_pos, y: result.y_pos},
                width: result.width,
                height: result.height
            }
            this.addNode(newNode);

            return newNode
        } catch (err) {
            console.log(err);
        }
    }
}