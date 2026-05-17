
import { makeAutoObservable, reaction, runInAction } from "mobx";
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

class ObservableFlowStore {
    nodesMap = new Map<string, ObservableNodeModel>();
    pane: number = 0;
    isLoading = false;

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

    setNodeToEdit(id: string, isEditing: boolean){
        const node = this.nodesMap.get(id);
        if(node) {
            console.log('editing node', id);
            node.isEditing = isEditing;
            node.isSelected = isEditing;
        }
    }


}


export const observableFlowStore = new ObservableFlowStore();
   

   