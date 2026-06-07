
import { makeAutoObservable, runInAction } from "mobx";
import type { Node } from "@xyflow/react";
import { NodeStore, ObservableNodeModel } from "./NodeStore";
import { TaskStore, type ObservableTaskModel } from "./TaskStore";
import { ProjectStore } from "./ProjectStore";




interface ProjectType {
    name: string
    description: string
    id: number
}



interface Pane {
    id: string;
    label: string;
}

export class CanvasStore {

    nodeStore: NodeStore
    taskStore: TaskStore
    projectStore: ProjectStore

  
    isLoading = false;

    currentPane = 0;
    currentProject: ProjectType = {id: 0, name: "invalid", description: "invalid description"};
    paneHistory: Pane[] = [{id:"0", label: "home"}]

    
    selectedTask: ObservableTaskModel | null = null;

    constructor() {
        this.nodeStore = new NodeStore(this);
        this.taskStore = new TaskStore(this);
        this.projectStore = new ProjectStore(this);
        makeAutoObservable(this)        
    }

    getNode(nodeID: string){
        return this.nodeStore.nodesMap.get(nodeID);
    }

    selectTask(task: ObservableTaskModel | null) {
        this.selectedTask = task;
    }

    clearSelectedTask() {
        this.selectedTask = null;
    }

    loadProjectData(nodeData: Node[], project: ProjectType) {
        runInAction(() => {
            this.nodeStore.clear();
            this.currentProject = project;
            nodeData.forEach((node: any) => {
                let nodeModel = this.nodeStore.addNode(node);
                
                if (node.tasks) {
                    node.tasks.forEach((taskData: any) => {
                        this.taskStore.addTask(taskData);
                        nodeModel.taskIDs.push(taskData.id);
                    })
                }
            })
        })
    }

    changeProject(project: ProjectType){
        runInAction(()=>{
            this.currentProject = project;
            this.paneHistory = [{id:"0", label: "home"}];
            this.currentPane = 0;
        })
    }


    addPaneHistory(id: string){
        const rootNode = this.nodeStore.nodesMap.get(id);

        runInAction(() =>{
            this.currentPane = Number(id);
        })
        this.paneHistory.push({id: id, label: rootNode? rootNode.label : "TDB"});
    }

    jumpToPane(paneID: number){
        if(paneID === this.currentPane)return;

        const target = this.paneHistory.findIndex((pane)=>Number(pane.id) === paneID);
        if(target < 0) return;
        this.currentPane = paneID
        this.paneHistory = this.paneHistory.slice(0, target + 1);
    }

    setNodeToEdit(id: string, isEditing: boolean){
        const node = this.nodeStore.nodesMap.get(id);
        if(node) {
            node.isEditing = isEditing;
            node.isSelected = isEditing;
        }
    }

    updateLabel(id: string, newLabel: string){
        const node = this.nodeStore.nodesMap.get(id);

        if (node){
            runInAction(() => {
           node.label = newLabel
        });
        }
    }

    async createTask(nodeID: string) {
        const node = this.nodeStore.nodesMap.get(nodeID);
        if (!node) {return;}
        const newTask = await this.taskStore.createTask(nodeID);
        runInAction(() =>{
            if (!newTask) {return;}
            node.taskIDs.push(newTask.id);
            this.selectedTask = newTask;
        })
    
    }

    async deleteTask(task: ObservableTaskModel, node: ObservableNodeModel) {
        await this.taskStore.delete(task);
        runInAction(() => {
            node.taskIDs = node.taskIDs.filter((taskID) =>  taskID !== task.id);
        })

    }

    async createProject(projectName: string) {

        const newProject = await this.projectStore.create(projectName);

        this.changeProject(newProject);
    }





}


export const canvasStore = new CanvasStore();
   

   