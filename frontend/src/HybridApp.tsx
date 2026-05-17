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
} from '@xyflow/react';

import { TextNode } from './TextNode';
import { CustomGroupComponent } from './CustomGroupComponent';
import { CustomApiRequest, type GetComponents, type GetComponent} from './FetchApI';
import { observer } from 'mobx-react-lite';
import { observableFlowStore } from './MyStore';
import { ContextMenu } from './NodeMenu';
 

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
    const [menu, setMenu] = useState<{x: number; y: number; top: number; left: number, nodeID: string} | null>(null);
    const [pane, setPane] = useState<number>(0);

    const loadNodes = useCallback(async (paneID: number) => {
        try {
        console.log('loading nodes')
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
                parentId: component.group_id ? String(component.group_id) : "",
                extent: component.type === groupName ? null : "parent" as const})
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
        setEdges(myEdges)
        observableFlowStore.loadProjectData(myNodes);
        } catch (err) {

        }
    
    }, []);
    useEffect( () => 
    {
    loadNodes(pane);
    }, [pane])

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );

    const onNodeDragStop = async (event: any, node: any) => {
            await fetch(`/api/components/${node.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ x_pos: node.position.x, y_pos: node.position.y })
            });
        };
    
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

      setMenu({
        top: event.clientY - container.top,
        left: event.clientX - container.left,
        x: position.x,
        y: position.y,
        nodeID: node.id
      })      
    }
    ,[screenToFlowPosition]);


//     const handleNodeDoubleClick: NodeMouseHandler<Node> = useCallback(
//      async (_: React.MouseEvent, node: Node) =>
//      {
//         setPane(Number(node.id))
//      }, [setPane]
//   )


    const onPaneClick = useCallback(() => setMenu(null), []);

    return (
        
        <div className="flex h-screen w-full overflow-hidden" >
    
    
        <div id="rf-viewport-wrapper" className="relative flex-grow h-full" onClick={onPaneClick}>
            <ReactFlow
            nodes={nodes}
            nodeTypes={nodeTypes}
            // onNodeDoubleClick={handleNodeDoubleClick}
            //   onBeforeDelete={handleBeforeDelete}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}

            
            //   onConnect={onConnect}
            //   onPaneContextMenu={onPaneContextMenu}
            //   onPaneClick={onPaneClick}
            onNodeContextMenu={onNodeContextMenu}
            //   onNodeDrag={onNodeDrag}
            //   onNodeDragStop={onNodeDragStop}
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
           {menu && (
                <ContextMenu 
                id={menu.nodeID} 
                top={menu.top} 
                left={menu.left}
                flowX={menu.x}
                flowY={menu.y}
                closeMenu={() => setMenu(null)} 
                />
            )}
        
        </div>
        </div>
        
    );
})