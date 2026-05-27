
import { makeAutoObservable, reaction, runInAction, toJS } from "mobx";
import type { Node } from "@xyflow/react";
// import { CustomApiRequest, type GetComponent } from "./FetchApI";
import { NodeStore } from "./nodeStore";
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
    isProjectSidebarOpen: boolean = true;
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
                    nodeModel.tasks = [];
                    node.tasks.forEach((taskData: any) => {
                        nodeModel.addTask(taskData);
                    })
                }
            })
        })
    }

    changeProject(project: ProjectType){
        runInAction(()=>{
            this.currentProject = project;
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

        let payload = {"title": "task title", "description": "Add a task using a btn"}                  
        await this.taskStore.createTask(payload, node);
    }





}


export const canvasStore = new CanvasStore();
   

   