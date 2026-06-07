import { makeAutoObservable } from "mobx";
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
   
    taskIDs: number[] = []

    constructor(id: string, name: string, type: string, parent_id: string | null) {
        this.id = id;
        this.label = name;
        this.type = type;
        this.parent_id = parent_id;
        makeAutoObservable(this);
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

    get tasks() {
        return (node: ObservableNodeModel): ObservableTaskModel[] => {
            if (!node) return [];
            return node.taskIDs.map(id => this.canvasStore.taskStore.tasksMap.get(String(id))).filter((task): task is ObservableTaskModel => !!task);
        }
    }

    get progress() {
        return (node: ObservableNodeModel): number => {
            if (!node) return 0;
            const nodeTasks = this.tasks(node);
            if(nodeTasks.length === 0) return 100;
            return (nodeTasks.filter(
                t => t.status === "completed").length / nodeTasks.length) * 100;
        }
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