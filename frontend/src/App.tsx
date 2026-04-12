import { useState, useCallback, useEffect } from 'react';
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
  type OnNodesDelete,
  type OnEdgesDelete,
} from '@xyflow/react';

import TextNode from './TextNode';
import { CustomApiRequest, type GetComponents, type GetComponent} from './FetchApI';
 

const nodeTypes = {textNode: TextNode}
 
// const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];
 

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
 

 
export default function App() {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [menu, setMenu] = useState<{x: number; y: number; top: number; left: number} | null>(null);

  const loadNodes = async () => {
      try {
        const response = await CustomApiRequest<GetComponents>('components', null, "GET")

        if (!response || response.length === 0){
          return
        }
        const myNodes = response.map((component) => ({
          id: component.id.toString(),
          data: { label: component.name },
          position: { x: component.x_pos, y: component.y_pos },
          type: 'textNode',
          width: component.width,
          height: component.height
        }))

        const edgeResponse = await CustomApiRequest<Edge[]>('edges', null, "GET")
        
        const myEdges = edgeResponse.map((edge) => ({
          id: String(edge.id),
          source: String(edge.source),
          sourceHandle: String(edge.sourceHandle),
          target: String(edge.target),
          targetHandle: String(edge.targetHandle) 
        }))
        console.log(myEdges)
        setNodes(myNodes);
        setEdges(myEdges)
      } catch (err) {

      }
    
    }
  // Check for any nodes otherwise load default initialNodes
  useEffect( () => 
  {
    loadNodes();
  }, [])
  
  // Allows movement of Nodes
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  // save location of node to DB
  const onNodeDragStop: OnNodeDrag<Node> = useCallback(
    async (_, node) => {
      const payload = {
        x_pos : node.position.x,
        y_pos: node.position.y
      };
      try {
        const result = await CustomApiRequest<{x: number, y: number}>(`components/${node.id}`, payload, "PATCH")
        console.log("Position synced to DB:", result);

      } catch (err) {
        console.error("Failed to save node position:", err);
      }
    },
    [setNodes],
  );

  const handleNodeDelete: OnNodesDelete<Node> = useCallback(
    async (nodes: Node[]) => {
      try {

        const result = await CustomApiRequest<{id: number}>(`components/bulk-delete`, nodes.map((node) => node.id), "DELETE");
        console.log(result);
      } catch (err) {
        console.log(err);
      }
    }, [setNodes]
  )

  const handleEdgeDelete: OnEdgesDelete<Edge> = useCallback(
    async (edges: Edge[]) => {
      try {
        console.log(edges)
        const result = await CustomApiRequest<{status: string}>(`edges/bulk-delete`, edges.map((edge) => edge.id), "DELETE");
        console.log(result);
      } catch (err) {
        console.log(err);
      }
    }, [setEdges]
  )

  const handleNodeDoubleClick: NodeMouseHandler<Node> = useCallback(
     async (_: React.MouseEvent, node: Node) =>
     {
        console.log(node);
     }, []
  )

  const onNodeContextMenu: NodeMouseHandler<Node> = useCallback(
    async  (event , node) => {
      event.preventDefault();
      
      // popup menu to give options to delete or rename
      console.log(node)
      setNodes((nds) =>
      nds.map((nd) => {
        if (nd.id === node.id) {
          // Return a new nd object with isEditing flipped on
          return { 
            ...nd, 
            data: { ...nd.data, isEditing: true } 
          };
        }
        return nd;
      })
  );
    },
    [setNodes]
  )

  // Edge callbacks
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    async (connection) => {
      
      setEdges((eds) => addEdge(connection, eds))
      try {
        const result = await CustomApiRequest<{id: number , src: number, dst: number}>(`edges`, connection, "POST")
        console.log(result)

      } catch (err) {
        console.error("Failed to save node position:", err);
      }
    },
    [setEdges],
  );

  const onPaneClick = useCallback(
    (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
      setMenu(null);

    }, []
    )
 
  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
      event.preventDefault();

      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setMenu({
        top: event.clientY,
        left: event.clientX,
        x: position.x,
        y: position.y
      })      
    }
    ,[screenToFlowPosition]
  )



  const handleAddNode = async (x: number, y: number) => {
    // API create
    try {
      const result = await CustomApiRequest<GetComponent>(`components`, {name: 'New Node', x_pos: x, y_pos: y, width: 230, height: 78}, "POST")
      const newNode = {
        id: String(result.id),
        type: 'textNode',
        data: {label: result.name},
        position: {x: result.x_pos, y: result.y_pos},
        width: result.width,
        height: result.height
      }
      setNodes((nds) => nds.concat(newNode))
    } catch (err) {
      console.log(err);
    }

    setMenu(null)
  }

  return (
    <div style={{ width: '50vw', height: '100vh' }}>
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodeDoubleClick={handleNodeDoubleClick}
      onNodesDelete={handleNodeDelete}
      onEdgesDelete={handleEdgeDelete}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneContextMenu={onPaneContextMenu}
      onPaneClick={onPaneClick}
      onNodeContextMenu={onNodeContextMenu}
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
     {menu && (  
        <div
          style={{
            position: 'absolute',
            top: menu.top,
            left: menu.left,
            zIndex: 1000,
            backgroundColor: '#222',
            border: '1px solid #555',
            borderRadius: '4px',
            padding: '5px'
          }}
        >
          <button 
            onClick={() => handleAddNode(menu.x, menu.y)}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            + Add Component
          </button>
        </div> 
      )}
    </div>
  );
}