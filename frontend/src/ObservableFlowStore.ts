import { 
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Connection,
    type Edge, 
    type Node, 
    type OnConnect, 
    type OnEdgesChange, 
    type OnNodesChange 
} from "@xyflow/react";
import { action, autorun, computed, makeAutoObservable, makeObservable, observable, reaction, runInAction, toJS } from "mobx";
import { CustomApiRequest, type GetComponent, type GetComponents } from "./FetchApI";


const groupName = "groupComponent"

class ObservablePaneMenu {
    isOpen = false;
    top = 0;
    left = 0;
    x = 0;
    y = 0;
    flowStore: ObservableFlowStore;

   constructor(parentStore: ObservableFlowStore) {
        this.flowStore = parentStore;

        makeObservable(this, {
            isOpen: observable,
            top: observable,
            left: observable,
            x: observable,
            y: observable,
            open: action.bound,
            close: action.bound
        });
    }


    open(data: { top: number, left: number, x: number, y: number }) {
        console.log("opening menu")
        this.top = data.top;
        this.left = data.left;
        this.x = data.x;
        this.y = data.y;
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

    async addNode() {
       const success = await this.flowStore.addNode(this.x, this.y);

       if(success) {this.close()}


    }
}

class ObservableFlowStore {
    nodes: Node[] = [];
    edges: Edge[] = [];
    pane: number = 0;
    isLoading = false;
    menu = new ObservablePaneMenu(this);

    constructor() {
        makeAutoObservable(this, {
            nodes: observable.shallow,
            edges: observable.shallow,
            // pane: observable,
            // onNodesChange: action.bound,
            // onEdgesChange: action.bound,
            // setPane: action.bound,
            // onConnect: action.bound,
            // deleteNode: action.bound,
            // addNode: action.bound,
            // setNodeToEdit: action.bound,
            // setNodeToGroup: action.bound,
            // groupNodes: action.bound,
            // plainEdges: computed
        })

        // autorun(() => {
        //     console.log(`Current Pane: ${this.pane} | Nodes:`, toJS(this.nodes));
        // });

        reaction(
            () => this.pane,
            (paneID) => this.loadNodes(paneID)
        );

        this.loadNodes(this.pane);
    }

    loadNodes = async (paneID: number) => {
       try {
              console.log('loading nodes')
              this.isLoading = true;
              const res = await CustomApiRequest<{nodes: GetComponents, edges: Edge[]}>(`components/diagram?parent_id=${paneID}`, null, "GET")
              console.log(res)
              const {nodes, edges} = res      
      
              //Ensure groups nodes are created first, nested groups are unsupported
              const sortedData = [...nodes].sort((a, b) => {
                if (a.type === groupName && b.type !== groupName) return -1;
                if (a.type !== groupName && b.type === groupName) return 1;
                return 0;
              });
      
               const myNodes = sortedData.map((component) => {
                return {
                  id: component.id.toString(),
                  data: { label: component.name },
                  position: { x: component.x_pos, y: component.y_pos },
                  type: component.type,
                  width: component.width,
                  height: component.height,
                  ...(component.group_id && { 
                    parentId: component.group_id ? String(component.group_id) : "",
                    extent: component.type === groupName ? null : "parent" as const})
                }
                
              })
      
              const myEdges = edges.map((edge) => ({
                id: String(edge.id),
                source: String(edge.source),
                sourceHandle: String(edge.sourceHandle),
                target: String(edge.target),
                targetHandle: String(edge.targetHandle) 
              }))

              runInAction(() => {
                this.nodes = myNodes;
                this.edges = myEdges;
                this.isLoading = false;
              })
            
        } catch (err) {
            runInAction(()=>{this.isLoading = false;});
            console.error("Failed to load project nodes", err);
        }
    }

    setPane = (id: number) => {
        this.pane = id;
    }


    onNodesChange: OnNodesChange = (changes) => {
        // console.log(changes);
        runInAction(() => {
            this.nodes = [...applyNodeChanges(changes, this.nodes)];
        })
        
    };

    onEdgesChange: OnEdgesChange = (changes) => {
         runInAction(() => {
            this.edges = [...applyEdgeChanges(changes, this.edges)];
        })
       
    }
    
    get plainEdges() {
        return toJS(this.edges);
    }
    async onConnect(connection: Connection){
         try {
            console.log(connection);
            const result = await CustomApiRequest<{id: number , src: number, dst: number}>(`edges`, connection, "POST")
            const newEdge = {
                ...connection,
                id: String(result.id),
            };

            runInAction(() => {
                this.edges = [...this.edges, newEdge];
            })
            
        } catch (err) {
        console.error("Failed to save connection:", err);
       
        }
    }
   
    async deleteNode(nodes: Node[], edges: Edge[]): Promise<boolean> {
        try {
            if (edges.length > 0) {
                const edgeIds = edges.map((edge) => Number(edge.id)).filter((id) => !isNaN(id))
                await CustomApiRequest<{status: string}>(`edges/bulk-delete`, edgeIds, "DELETE");
            }
            
            if (nodes.length > 0) {
                await CustomApiRequest<{id: number}>(`components/bulk-delete`, nodes.map((node) => node.id), "DELETE");
            }
            return true
      } catch (err) {
        console.log(err);
        return false
      }
        
    };

    // FIXME: maybe make the new node editable when it's first created
    async addNode(x: number, y:number): Promise<boolean> {
        try{
            const result = await CustomApiRequest<GetComponent>(`components`, {name: 'New Node', x_pos: x, y_pos: y, width: 230, height: 78, parent_id: this.pane}, "POST")
             const newNode = {
                id: String(result.id),
                type: 'textNode',
                data: {label: result.name},
                position: {x: result.x_pos, y: result.y_pos},
                width: result.width,
                height: result.height
            }
            runInAction(() => {
                this.nodes = [...this.nodes, newNode];
            });
            return true
        } catch (err) {
            console.log("unable to add node", err)
            return false;
        }
    }

    setNodeToEdit(id: string, isEditing: boolean){
        const node = this.nodes.find((n)=> n.id === id);
        if(node) {
            node.data.isEditing = isEditing;
            node.selected = isEditing;
        }
    }

    setNodeToGroup(draggedNode: Node, intersectionsIds: string[]){
        this.nodes.forEach((node)=> {

            if(node.id == draggedNode.id) {return}

            const isHightlighted = intersectionsIds.includes(node.id);

            if (isHightlighted){
                node.data.className =  'ring-4 ring-blue-500 shadow-lg'
            }
            else {
                node.data.className = "";
            }
          
        })

    }

    groupNodes = async (draggedNode: Node, intersections: Node[]) => {
        try {

         const payload = {
            x_pos : draggedNode.position.x,
            y_pos: draggedNode.position.y
        };
        const result = await CustomApiRequest<{x: number, y: number}>(`components/${draggedNode.id}`, payload, "PATCH")
        
        
        
    
        
        if (intersections.length > 0) {
            
            let targetNode = intersections[0]
            let newGroupNode = null

            if (targetNode.type === groupName)
            {
            console.log("adding to group")
            const res = await CustomApiRequest<GetComponent>(`components/${draggedNode.id}`, {"group_id": targetNode.id}, "PATCH")
            }
            else{
            console.log('creating group..')
            const payload = {"nodes": [draggedNode.id, targetNode.id]}
            const result = await CustomApiRequest<GetComponent>(`components/groups`, payload, "POST")
            
            console.log('created', result)
            newGroupNode = {
                id: String(result.id),
                type:  result.type,
                data: {label: 'gorup'},
                style: { width: result.width, height: result.height },
                position: {x: result.x_pos, y: result.y_pos}
            }
            }
            
            
            // dragged node adds component as group parent

            // runInAction(() => {
            //     const baseNodes = newGroupNode ? [newGroupNode,...this.nodes] : this.nodes
            //     const newParentNode = newGroupNode ? newGroupNode : targetNode

            //     return baseNodes.map((nd) => {
            //         if (nd.id === draggedNode.id || (newGroupNode && nd.id == targetNode.id))
            //         {
            //         console.log(nd.type, nd.id)
            //         return {
            //             ...nd,
            //             extent: 'parent',
            //             parentId: newParentNode.id,
            //             position : {
            //             x: nd.position.x - newParentNode.position.x,
            //             y: nd.position.y - newParentNode.position.y
            //             }
            //         }
            //         }
            //         return nd
            //     });

                
                
            //     })
        }
        

        } catch (err) {
        console.error("Failed to save node position:", err);
        }
    }

}



export const observableFlowStore = new ObservableFlowStore();