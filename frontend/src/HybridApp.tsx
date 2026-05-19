import { useState, useCallback, useEffect, Component } from 'react';
import {
  useReactFlow,
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
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

import { TextNode } from './TextNode';
import { CustomGroupComponent } from './CustomGroupComponent';
import { CustomApiRequest, type GetComponents, type GetComponent} from './FetchApI';
import { observer } from 'mobx-react-lite';
import { observableFlowStore } from './MyStore';
import { ContextMenu } from './NodeMenu';
import { PaneBreadcrumbs } from './PaneBreadcrumb';
import { useCanvasShortcuts } from './shortcuts';
import { SelectionToolbar } from './NodeToolBar';
import { PaneMenu } from './PaneMenu';

const nodeTypes = {textNode: TextNode, groupComponent: CustomGroupComponent}

const groupName = "groupComponent"

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
 


 
export const ProjectCanvas = observer(() => {
    const { getIntersectingNodes } = useReactFlow();
    const { screenToFlowPosition } = useReactFlow();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [nodeMenu, setNodeMenu] = useState<{x: number; y: number; top: number; left: number, nodeID: string} | null>(null);
    const [menu, setMenu] = useState<{x: number; y: number; top: number; left: number} | null>(null);
    useCanvasShortcuts();
    // const [pane, setPane] = useState<number>(0);

    const currentPane = observableFlowStore.currentPane;

    const loadNodes = useCallback(async (paneID: number) => {
        try {
            const res = await CustomApiRequest<{nodes: GetComponents, edges: Edge[]}>(`components/diagram?parent_id=${paneID}`, null, "GET")

            const {nodes, edges} = res    
            

            //Ensure groups nodes are created first, nested groups are unsupported
            const sortedData = [...nodes].sort((a, b) => {
                if (a.type === groupName && b.type !== groupName) return -1;
                if (a.type !== groupName && b.type === groupName) return 1;
                return 0;
            });

            const myNodes: Node[] = sortedData.map((component) => {
                return {
                id: String(component.id),
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
            observableFlowStore.loadProjectData(myNodes);
        } catch (err) {

        }
    
    }, []);
    useEffect( () => 
    {
    loadNodes(currentPane);
    }, [currentPane])

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
    console.log('right cliked', node.id)
    // observableFlowStore.setNodeToEdit(node.id, true);
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
            observableFlowStore.addPaneHistory(node.id);
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

    const handleAddNode = async (x: number, y: number) => {
        try {
            const result = await CustomApiRequest<GetComponent>(`components`, {name: 'New Node', x_pos: x, y_pos: y, width: 230, height: 150, parent_id: currentPane}, "POST")
            const newNode: Node = {
                id: String(result.id),
                type: 'textNode',
                data: {label: result.name},
                position: {x: result.x_pos, y: result.y_pos},
                width: result.width,
                height: result.height
            }
            observableFlowStore.addNode(newNode);
            setNodes((nds) => nds.concat(newNode))
        } catch (err) {
            console.log(err);
        }

        setMenu(null)
    }


    const onNodeDragStop: OnNodeDrag<Node> = useCallback(
        async (_, node) => {
    
          const payload = {
            x_pos : node.position.x,
            y_pos: node.position.y
          };
          try {
            const result = await CustomApiRequest<{x: number, y: number}>(`components/${node.id}`, payload, "PATCH")
           
            
            const intersections = getIntersectingNodes(node).filter((nd) => {
              return (
                  !nd.parentId && 
                  nd.parentId !== node.id && 
                  node.parentId !== nd.id
                );
            });

           
      
            
            // if (intersections.length > 0) {
             
            //   let targetNode = intersections[0]
            //   let newGroupNode = null
    
            //   if (targetNode.type === groupName)
            //   {
            //     console.log("adding to group")
            //     const res = await CustomApiRequest<GetComponent>(`components/${node.id}`, {"group_id": targetNode.id}, "PATCH")
            //   }
            //   else{
            //     console.log('creating group..')
            //     const payload = {"nodes": [node.id, targetNode.id]}
            //     const result = await CustomApiRequest<GetComponent>(`components/groups`, payload, "POST")
              
            //     console.log('created', result)
            //     newGroupNode = {
            //       id: String(result.id),
            //       type:  result.type,
            //       data: {label: 'gorup'},
            //       style: { width: result.width, height: result.height },
            //       position: {x: result.x_pos, y: result.y_pos}
            //     }
            //   }
             
             
            //   // dragged node adds component as group parent
            //   setNodes((nds) => {
            //     const baseNodes = newGroupNode ? [newGroupNode,...nds] : nds
            //     const newParentNode = newGroupNode ? newGroupNode : targetNode
    
            //     return baseNodes.map((nd) => {
            //       if (nd.id === node.id || (newGroupNode && nd.id == targetNode.id))
            //       {
            //         console.log(nd.type, nd.id)
            //         return {
            //           ...nd,
            //           extent: 'parent',
            //           parentId: newParentNode.id,
            //           position : {
            //             x: nd.position.x - newParentNode.position.x,
            //             y: nd.position.y - newParentNode.position.y
            //           }
            //         }
            //       }
            //       return nd
            //     });
    
              
              
            //   })
            // }
          
    
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

    return (
        
        <div className="flex h-screen w-full overflow-hidden" >
            
        <div id="rf-viewport-wrapper" className="relative flex-grow h-full" onClick={onPaneClick}>
            <PaneBreadcrumbs/>
            <SelectionToolbar 
                isVisible={showToolbar} 
                selectedObjects={selectedObj} 
                onClose={() => setShowToolbar(false)}
            />
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
            // onNodeDrag={onNodeDrag}
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
            <Controls />
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
             {menu && ( <PaneMenu menu={menu} onAddNode={handleAddNode} onAddGroup={()=>{}}/> 
          )}
        
        </div>
        </div>
        
    );
})





