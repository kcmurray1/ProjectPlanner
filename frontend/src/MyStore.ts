
import { makeAutoObservable, reaction, runInAction, toJS } from "mobx";
import type { Node } from "@xyflow/react";
import { CustomApiRequest } from "./FetchApI";



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

interface Pane {
    id: string;
    label: string;
}

class ObservableFlowStore {
    nodesMap = new Map<string, ObservableNodeModel>();
    isLoading = false;

    currentPane = 0;
    paneHistory: Pane[] = [{id:"0", label: "home"}]

    
    selectedTask: ObservableTaskModel | null = null;

    constructor() {
        makeAutoObservable(this)        
    }


    selectTask(task: ObservableTaskModel | null) {
        this.selectedTask = task;
    }

    // 3. Clear action to close the workspace panel cleanly
    clearSelectedTask() {
        this.selectedTask = null;
    }

    loadProjectData(nodeData: Node[]) {
        runInAction(() => {
            this.nodesMap.clear();

            nodeData.forEach((node: any) => {
                const { label } = node.data as {label: string};
                const nodeModel = new ObservableNodeModel(
                    node.id,
                    label,
                    node.type ? node.type : "textNode",
                    node.parentId ? node.parentId : null
                )

                this.nodesMap.set(node.id, nodeModel);
                
                if (node.tasks) {
                    nodeModel.tasks = [];
                    node.tasks.forEach((taskData: any) => {
                        nodeModel.addTask(taskData);
                    })
                }
            })
        })
    }

    addNode(node: Node){
        runInAction(()=>{
            const { label } = node.data as {label: string};
            const nodeModel = new ObservableNodeModel(
                node.id,
                label,
                node.type ? node.type : "textNode",
                node.parentId ? node.parentId : null
            );
            this.nodesMap.set(node.id, nodeModel);
        })
    }

    setNodeToEdit(id: string, isEditing: boolean){
        const node = this.nodesMap.get(id);
        if(node) {
            console.log('editing node', id);
            node.isEditing = isEditing;
            node.isSelected = isEditing;
        }
    }

    addPaneHistory(id: string){
        const rootNode = this.nodesMap.get(id);

        runInAction(() =>{
            this.currentPane = Number(id);
        })
        this.paneHistory.push({id: id, label: rootNode? rootNode.label : "TDB"});
    }

    jumpToPane(paneID: number){
        if(paneID === observableFlowStore.currentPane)return;

        const target = this.paneHistory.findIndex((pane)=>Number(pane.id) === paneID);
        if(target < 0) return;
        this.currentPane = paneID
        this.paneHistory = this.paneHistory.slice(0, target + 1);
    }

    updateLabel(id: string, newLabel: string){
        const node = this.nodesMap.get(id);

        if (node){
            runInAction(() => {
           node.label = newLabel
        });
        }
    }

    async createTask(nodeID: string) {
        const node = this.nodesMap.get(nodeID);

        if (!node) {return;}

        let payload = {"title": "task title", "description": "Add a task using a btn"}                  
        try {
            const newTask = await CustomApiRequest<Task>(`components/${node.id}/tasks`, payload, "POST")
            runInAction(() =>{
                this.selectedTask = node.addTask(newTask);
            })
            
        } catch (err) {
            console.error("failed to create task", err);
        }
    }





}


export const observableFlowStore = new ObservableFlowStore();
   

   