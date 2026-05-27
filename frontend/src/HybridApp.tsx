import { useState, useCallback, useEffect, Component } from 'react';
import {
  useReactFlow,
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  MiniMap,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
  type DefaultEdgeOptions,
  type NodeMouseHandler,
  type OnBeforeDelete,
  type OnSelectionChangeParams,
} from '@xyflow/react';


import { TaskNode, GroupNode } from './components/node';
import { CustomApiRequest, type GetComponents, type GetComponent} from './FetchApI';
import { observer } from 'mobx-react-lite';

import { canvasStore } from './stores/CanvasStore';

import { ContextMenu } from './NodeMenu';
import { PaneBreadcrumbs } from './PaneBreadcrumb';
import { useCanvasShortcuts } from './shortcuts';
import { SelectionToolbar } from './NodeToolBar';
import { PaneMenu } from './PaneMenu';
import { TaskSidebar } from './TaskSidebar';
import { ProjectSidebar } from './components/ProjectSidebar';

const nodeTypes = {taskNode: TaskNode, groupNode: GroupNode}

const nodeNames = {taskNode: "taskNode", group: "groupNode"}
const groupName = "groupNode"

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  style: {
    strokeWidth: 5,
  },
  interactionWidth: 25
};


interface ProjectType {
    name: string
    description: string
    id: number
}


 
export const ProjectCanvas = observer(() => {
    const { getIntersectingNodes, screenToFlowPosition, getNodes } = useReactFlow();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [nodeMenu, setNodeMenu] = useState<{x: number; y: number; top: number; left: number, nodeID: string} | null>(null);
    const [menu, setMenu] = useState<{x: number; y: number; top: number; left: number} | null>(null);
    
    const { nodeStore } = canvasStore;

    const loadNodes = useCallback(async (paneID: number, currentProjectID: number) => {
        try {
            const res = await CustomApiRequest<{project: ProjectType, nodes: GetComponents, edges: Edge[]}>(`components/diagram?parent_id=${paneID}&project_id=${currentProjectID}`, null, "GET")

            const {project, nodes, edges} = res    
            console.log(nodes, edges,project);
            //Ensure groups nodes are created first, nested groups are unsupported
            const sortedData = [...nodes].sort((a, b) => {
                if (a.type === groupName && b.type !== groupName) return -1;
                if (a.type !== groupName && b.type === groupName) return 1;
                return 0;
            });

            const myNodes: Node[] = sortedData.map((component) => {
                return {
                id: String(component.id),
                tasks: component.tasks,
                data: { label: component.name },
                position: { x: component.x_pos, y: component.y_pos },
                type: component.type,
                width: component.width,
                height: component.height,
                ...(component.group_id && { 
                    parentId: component.group_id ? String(component.group_id) : ""})
                }
                
            });
        

            const myEdges = edges.map((edge) => ({
                id: String(edge.id),
                source: String(edge.source),
                sourceHandle: String(edge.sourceHandle),
                target: String(edge.target),
                targetHandle: String(edge.targetHandle) 
            }))
            setNodes(myNodes);
            setEdges(myEdges);
            canvasStore.loadProjectData(myNodes, project);
        } catch (err) {

        }
    
    }, []);
    useEffect( () => 
    {
        loadNodes(canvasStore.currentPane, canvasStore.currentProject.id);
    }, [canvasStore.currentPane, canvasStore.currentProject.id])

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );

    
    const onNodeContextMenu = useCallback( (event: MouseEvent | React.MouseEvent<Element, MouseEvent>, node: any) => {
    // Prevent the default browser context menu from popping up
    event.preventDefault();
    console.log('right cliked', node.id, node.position, node.width);
    // canvasStore.setNodeToEdit(node.id, true);
        const canvasViewport = document.getElementById('rf-viewport-wrapper');
        if (!canvasViewport) return;
    
    const container = canvasViewport.getBoundingClientRect();
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodeMenu({
        top: event.clientY - container.top,
        left: event.clientX - container.left,
        x: position.x,
        y: position.y,
        nodeID: node.id
      })      
    }
    ,[screenToFlowPosition]);

    const onPaneContextMenu = useCallback(
        (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
        event.preventDefault();

        const container = (event.currentTarget as HTMLElement).getBoundingClientRect();
        
        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        setMenu({
            top: event.clientY - container.top,
            left: event.clientX - container.left,
            x: position.x,
            y: position.y
        })      
        }
        ,[screenToFlowPosition]
    )


    const handleNodeDoubleClick: NodeMouseHandler<Node> = useCallback(
        async (_: React.MouseEvent, node: Node) =>
        {
            if (node.type !== "taskNode") {return;}
            canvasStore.addPaneHistory(node.id);
        }, []
    )

    const onConnect: OnConnect = useCallback(
        async (connection) => {
        try {
            const result = await CustomApiRequest<{id: number , src: number, dst: number}>(`edges`, connection, "POST")
            const newEdge = {
            ...connection,
            id: String(result.id),
            };

            setEdges((eds) => addEdge(newEdge as Edge, eds))

        } catch (err) {
            console.error("Failed to save node position:", err);
        }
        },
        [setEdges],
    );


    const onPaneClick = useCallback(() => {
        setNodeMenu(null);
        setMenu(null);
    }, []);


    const handleBeforeDelete: OnBeforeDelete<Node, Edge> = useCallback(
        async({nodes, edges}) => {
        try {
            if (edges.length > 0)
            {
                await CustomApiRequest<{status: string}>(`edges/bulk-delete`, edges.map((edge) => Number(edge.id)).filter((id) => !isNaN(id)), "DELETE");
            }
            
            if (nodes.length > 0)
            {
                await CustomApiRequest<{id: number}>(`components/bulk-delete`, nodes.map((node) => node.id), "DELETE");
            }

            return true
        } catch (err) {
            console.log(err);
            return false
        }
        

        }, []
    )

    const handleAddNode = async (x: number, y: number, type: string) => {
        const newNode = await nodeStore.createNode(x, y, type);

        if (newNode) {
            setNodes((nds) => nds.concat(newNode))
        }

        setMenu(null)
    }



    const onNodeDragStop: OnNodeDrag<Node> = useCallback(
        async (_, node) => {
          try {
            const intersections = getIntersectingNodes(node).filter((nd)=>{
                return (nd.type == groupName)
            });

            let payload: Record<string, any> = {}
            let position = {
                x_pos: node.position.x,
                y_pos: node.position.y
            }
            let updatedNode: Node = {
                ...node,
                position: {x: position.x_pos, y: position.y_pos}
            };

            if (intersections.length > 0 && node.type !== groupName)
            {
                // FIXME: currently just pick the first overlapping group, adjust so it groups to most overlappinmg node
                const newParent = intersections[0];
                // only update position if intersection with group that node is already in
                if (node.parentId !== newParent.id) {
                    position["x_pos"] = node.position.x - newParent.position.x
                    position["y_pos"] = node.position.y - newParent.position.y
                    payload["group_id"] = newParent.id;
                    updatedNode = {
                        ...node, 
                        position : {x: position.x_pos, y: position.y_pos},
                        parentId: newParent.id
                    }
                }
            }
            else{
                // check if node was in a group but was dragged outside     
                if (node.parentId)
                {
                    const oldParent = getNodes().find((nd)=>nd.id ===node.parentId);
                    if (oldParent){
                        position["x_pos"] = node.position.x + oldParent.position.x;
                        position["y_pos"] = node.position.y + oldParent.position.y;
                        payload["group_id"] = null;
                         updatedNode = {
                        ...node, 
                        position : {x: position.x_pos, y: position.y_pos},
                        parentId: undefined
                    }
                    }
                }
            }
            payload = {
                ...payload,
                x_pos: position.x_pos,
                y_pos: position.y_pos
                
            }
        
            await CustomApiRequest<{x: number, y: number}>(`components/${node.id}`, payload, "PATCH")
        

            setNodes((nds) => {
                return nds.map((nd)=> {
                    if (nd.id === node.id) {
                        return {
                            ...node,
                            parentId: updatedNode.parentId,
                            position: updatedNode.position
                        }
                    }
                    return nd;
                })
            })
          } catch (err) {
            console.error("Failed to save node position:", err);
          }
        },
        [setNodes, getIntersectingNodes]);

    const [showToolbar, setShowToolbar] = useState<boolean>(false);
    const [selectedObj, setSelectedIds] = useState<{nodes: Node[], edges: Edge[]}>({nodes:[],edges:[]});

    const handleSelectionChange = useCallback((params: OnSelectionChangeParams) => {
        setSelectedIds(params);
        setShowToolbar(params.nodes.length > 0);
    }, []);

    const foo = async () => {
            if (selectedObj.nodes.length < 1) return;
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            selectedObj.nodes.forEach((nd) => {
                if (nd.position.x < minX) minX = nd.position.x;
                if (nd.position.y < minY) minY = nd.position.y;
                
                // Fallback sizes if ReactFlow hasn't fully measured dimensions yet
                const w = nd.measured?.width || nd.width || 150;
                const h = nd.measured?.height || nd.height || 50;
                
                if (nd.position.x + w > maxX) maxX = nd.position.x + w;
                if (nd.position.y + h > maxY) maxY = nd.position.y + h;
            });

            // 2. APPLY VIEWPORT PADDING
            const padding = 10; // Pixels of spacing around the outermost selectedObj.nodes
            const calculatedX = minX - padding;
            const calculatedY = minY - padding;
            const calculatedWidth = (maxX - minX) + (padding * 2);
            const calculatedHeight = (maxY - minY) + (padding * 2);

            const selectedNodeIds = selectedObj.nodes.map((n) => n.id);

            const payload = {"nodes": selectedNodeIds, x_pos: calculatedX, y_pos: calculatedY, width: calculatedWidth, height: calculatedHeight }
            const result = await CustomApiRequest<GetComponent>(`components/groups`, payload, "POST")
            console.log(result)
            const newGroupNode = {
                id: String(result.id),
                type:  result.type,
                data: {label: 'gorup'},
                style: { width: result.width, height: result.height },
                position: {x: result.x_pos, y: result.y_pos}
            }

            setNodes((nds) => {
                const baseNodes = [newGroupNode, ...nds];

                return baseNodes.map((nd) => {
                    if (selectedNodeIds.includes(nd.id)) {
                        return {
                            ...nd,
                            parentId: newGroupNode.id,
                            selected: false,
                            position: {
                                x: nd.position.x - newGroupNode.position.x,
                                y: nd.position.y - newGroupNode.position.y
                            }
                        };
                    }
                    return nd;
                });
            });
        }
    useCanvasShortcuts({onGroup: foo});

    return (
        
        <div className="flex h-screen w-full overflow-hidden flex-col" >
            <div className="w-full px-6 py-3">
                <PaneBreadcrumbs />
            </div>
            <div 
                id="rf-viewport-wrapper" 
                className="relative flex-grow h-[calc(100vh-49px)] w-full" 
                onClick={onPaneClick}
            >
                <SelectionToolbar 
                    isVisible={showToolbar} 
                    selectedObjects={selectedObj} 
                    onClose={() => setShowToolbar(false)}
                    onGroup={foo}
                />
                <ProjectSidebar/>
                <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                onNodeDoubleClick={handleNodeDoubleClick}
                onBeforeDelete={handleBeforeDelete}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onPaneContextMenu={onPaneContextMenu}
                onNodeContextMenu={onNodeContextMenu}
                onSelectionChange={handleSelectionChange}
                onNodeDragStop={onNodeDragStop}
                fitView
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
                selectionOnDrag={true}
                selectionKeyCode={null}
                panOnDrag = {[1]}
                > 
                <Background />
                {/* <Controls />
                */}
                
                <MiniMap/>
                </ReactFlow>
            {nodeMenu && (
                    <ContextMenu 
                    id={nodeMenu.nodeID} 
                    top={nodeMenu.top} 
                    left={nodeMenu.left}
                    flowX={nodeMenu.x}
                    flowY={nodeMenu.y}
                    closeMenu={() => setNodeMenu(null)} 
                    />
                )}
                {menu && ( <PaneMenu menu={menu} onAddNode={handleAddNode}/> 
            )}
            <TaskSidebar/>
            
            
            </div>
        </div>
        
    );
})





