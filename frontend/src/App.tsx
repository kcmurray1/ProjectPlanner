import { useState, useCallback, useEffect } from 'react';
import {
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
} from '@xyflow/react';
import { CustomApiRequest, type GetComponents } from './FetchApI';
 
const initialNodes: Node[] = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 5, y: 5 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 5, y: 100 } },
];
 
const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];
 
const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
 

 
export default function App() {
  

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Check for any nodes otherwise load default initialNodes
  useEffect( () => 
  {
    const loadNodes = async () => {
      try {
        const response = await CustomApiRequest<GetComponents>('components', null, "GET")

        if (!response || response.length === 0){
          return
        }

        const myNodes = response.map((component) => ({
          id: component.id.toString(),
          data: { label: component.name },
          position: { x: component.x_pos, y: component.y_pos }
        }))

        setNodes(myNodes);
      
      } catch (err) {

      }
    
      
    }

    loadNodes();
  }, [])
 
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onNodeDragStop: OnNodeDrag<Node> = useCallback(
    async (_, node) => {
      console.log(node)

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
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );
 
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
    <ReactFlow
      nodes={nodes}
      // edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      // onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      fitView
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
    > 
    <Background />
    <Controls />
    <MiniMap/>
    </ReactFlow>
    </div>
  );
}