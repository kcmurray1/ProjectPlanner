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

 

const nodeTypes = {textNode: TextNode, groupComponent: CustomGroupComponent}

const groupName = "groupComponent"

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
 

 
export default function App() {
  const { getIntersectingNodes } = useReactFlow();
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [menu, setMenu] = useState<{x: number; y: number; top: number; left: number} | null>(null);
  const [pane, setPane] = useState<number>(0);

  const loadNodes = useCallback(async (paneID: number) => {
      try {
        console.log('loading nodes')
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
        setNodes(myNodes);
        setEdges(myEdges)
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

  const onNodeDrag: OnNodeDrag<Node> = useCallback(
    (_ , node) => {

      const intersections = getIntersectingNodes(node).filter((nd) => {
        return nd.parentId !== node.id && node.parentId !== nd.id
      })
      const intersectionsIds = intersections.map((n) => n.id);
      
      setNodes((currentNodes) =>
        currentNodes.map((n) => {
          const isHighlighted = intersectionsIds.includes(n.id);
          if (node.parentId && node.parentId === n.id)
          {
            return n;
          }
          return {
            ...n,
            className: isHighlighted ? 'ring-4 ring-blue-500 shadow-lg' : ''
          }
        })
      );
    }, [getIntersectingNodes, setNodes])

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
  
        
        if (intersections.length > 0) {
         
          let targetNode = intersections[0]
          let newGroupNode = null

          if (targetNode.type === groupName)
          {
            console.log("adding to group")
            const res = await CustomApiRequest<GetComponent>(`components/${node.id}`, {"group_id": targetNode.id}, "PATCH")
          }
          else{
            console.log('creating group..')
            const payload = {"nodes": [node.id, targetNode.id]}
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
          setNodes((nds) => {
            const baseNodes = newGroupNode ? [newGroupNode,...nds] : nds
            const newParentNode = newGroupNode ? newGroupNode : targetNode

            return baseNodes.map((nd) => {
              if (nd.id === node.id || (newGroupNode && nd.id == targetNode.id))
              {
                console.log(nd.type, nd.id)
                return {
                  ...nd,
                  extent: 'parent',
                  parentId: newParentNode.id,
                  position : {
                    x: nd.position.x - newParentNode.position.x,
                    y: nd.position.y - newParentNode.position.y
                  }
                }
              }
              return nd
            });

          
          
          })
        }
      

      } catch (err) {
        console.error("Failed to save node position:", err);
      }
    },
    [setNodes, getIntersectingNodes],
  );

  const handleBeforeDelete: OnBeforeDelete<Node, Edge> = useCallback(
    async({nodes, edges}) => {
      try {
        if (edges.length > 0)
        {
          const result = await CustomApiRequest<{status: string}>(`edges/bulk-delete`, edges.map((edge) => Number(edge.id)).filter((id) => !isNaN(id)), "DELETE");
        }
        
        if (nodes.length > 0)
        {
           const result = await CustomApiRequest<{id: number}>(`components/bulk-delete`, nodes.map((node) => node.id), "DELETE");
        }

        return true
      } catch (err) {
        console.log(err);
        return false
      }
     

    }, []
  )


  const handleNodeDoubleClick: NodeMouseHandler<Node> = useCallback(
     async (_: React.MouseEvent, node: Node) =>
     {
        setPane(Number(node.id))
     }, [setPane]
  )

  const onNodeContextMenu: NodeMouseHandler<Node> = useCallback(
    async  (event , node) => {
      event.preventDefault();
      // popup menu to give options to delete or rename
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

  const onPaneClick = useCallback(
    (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
      setMenu(null);

    }, []
    )
 
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


  const handleAddNode = async (x: number, y: number) => {
    // API create
    try {
      const result = await CustomApiRequest<GetComponent>(`components`, {name: 'New Node', x_pos: x, y_pos: y, width: 230, height: 78, parent_id: pane}, "POST")
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
  const [isOpen, setIsOpen] = useState(true);

  return (
    
    <div className="flex h-screen w-full overflow-hidden" >
      <aside
            className={`
              transition-all duration-300 ease-in-out border-r bg-white dark:bg-zinc-900 overflow-hidden
              /* Desktop: Toggle between 64 and 0 */
              ${isOpen ? 'w-64' : 'w-0 md:w-16'} 
              /* Mobile: Fixed overlay */
              fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0
              ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
        <div className="flex flex-col h-full p-4 overflow-hidden">
            <header className="flex h-14 items-center border-b bg-white px-4 dark:bg-zinc-900">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                {/* Menu Icon */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </header>
            <nav className="mt-4 flex-grow space-y-1 overflow-y-auto">
              <button className="w-full text-left p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                {isOpen ? '🏠 Home' : '🏠'}
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                Projects
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                Settings
              </button>
            </nav>
      </div>
      </aside>
  
   
      <div className="relative flex-grow h-full">
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
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDrag={onNodeDrag}
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
                style={{ color: 'white', background: 'none', border: 'none' }}
              >
                + Add Component
              </button>
            </div> 
          )}
      </div>
      </div>
    
  );
}