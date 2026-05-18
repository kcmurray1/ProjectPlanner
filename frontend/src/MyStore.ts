
import { makeAutoObservable, reaction, runInAction, toJS } from "mobx";
import { CustomApiRequest, type GetComponent, type GetComponents } from "./FetchApI";
import type { Node, Edge} from "@xyflow/react";

export class ObservableNodeModel {
    id: string;
    label: string;
    type: string;
    parent_id: string | null;
    isPriority: boolean = false;
    isEditing: boolean = false;
    isSelected: boolean = false;

    constructor(id: string, name: string, type: string, parent_id: string | null) {
        this.id = id;
        this.label = name;
        this.type = type;
        this.parent_id = parent_id;
        makeAutoObservable(this);
    }

    // High-performance computed progress propagation
    // get progress() {
    //     if (this.todos.length === 0) return 100;
    //     return (this.todos.filter(t => t.done).length / this.todos.length) * 100;
    // }

    // get nodeColor() {
    //     if (this.progress < 30) return "#ef4444";
    //     if (this.progress < 80) return "#f59e0b";
    //     return "#10b981";
    // }
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


    constructor() {
        makeAutoObservable(this)        
    }

    loadProjectData(nodeData: Node[]) {
        runInAction(() => {
            this.nodesMap.clear();

            nodeData.forEach((node: Node) => {
                const { label } = node.data as {label: string};
                const nodeModel = new ObservableNodeModel(
                    node.id,
                    label,
                    node.type ? node.type : "textNode",
                    node.parentId ? node.parentId : null
                )

                this.nodesMap.set(node.id, nodeModel);
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





}


export const observableFlowStore = new ObservableFlowStore();
   

   