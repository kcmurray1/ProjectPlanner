import React, { useCallback, useEffect } from "react";
import { observableFlowStore } from "./ObservableFlowStore";
import { 
    Background,
    Controls,
    MiniMap,
    ReactFlow, 
    type Node,
    type Edge,
    type DefaultEdgeOptions, 
    type FitViewOptions,
    type OnBeforeDelete,
    type OnConnect,
    useReactFlow,
    type NodeMouseHandler,
    type OnNodeDrag
} from "@xyflow/react";
import { observer } from "mobx-react-lite";
import { TextNode } from "./TextNode";
import { CustomGroupComponent } from "./CustomGroupComponent";
import { PaneOptionsMenu } from "./PaneOptionsMenu";

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const nodeTypes = {textNode: TextNode, groupComponent: CustomGroupComponent}
 


export const FlowApp = observer(() => {

    const { getIntersectingNodes } = useReactFlow();
    const { screenToFlowPosition } = useReactFlow();

    const handleNodeDoubleClick = (_:React.MouseEvent, node: Node) => {

        if(node.type !== "groupComponent")
            observableFlowStore.setPane(Number(node.id))
    }

    const onBeforeDelete: OnBeforeDelete = useCallback(async ({ nodes, edges}) => {
        return await observableFlowStore.deleteNode(nodes, edges);
    }, []);


    const onConnect: OnConnect = useCallback( 
        async (connection) => {
            await observableFlowStore.onConnect(connection);
        }, []
    );


    const onPaneClick = useCallback(
        (_: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
        observableFlowStore.menu.close();

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

        observableFlowStore.menu.open({
            top: event.clientY - container.top,
            left: event.clientX - container.left,
            x: position.x,
            y: position.y
        })      
        }
        ,[screenToFlowPosition]
  )

  const onNodeContextMenu: NodeMouseHandler<Node> = useCallback(
        async (event, node) => {
            event.preventDefault();
            observableFlowStore.setNodeToEdit(node.id, true);


        }, []);

    const onNodeDrag: OnNodeDrag<Node> = useCallback(
        (_, node) => {
            const intersections = getIntersectingNodes(node).filter((nd) => {
                return nd.parentId !== node.id && node.parentId !== nd.id
            })
            const intersectionsIds = intersections.map((n) => n.id);
           
            observableFlowStore.setNodeToGroup(node, intersectionsIds);
        }, [getIntersectingNodes]);

    
    const onNodeDragStop: OnNodeDrag<Node> = useCallback(
        async (_, node) => {
    
            const intersections = getIntersectingNodes(node).filter((nd) => {
                return (
                    !nd.parentId && 
                    nd.parentId !== node.id && 
                    node.parentId !== nd.id
                );
            });

            observableFlowStore.groupNodes(node, intersections);

           
        },
        [getIntersectingNodes]);

    const defaultEdgeOptions = {
    type: 'simplebezier', // Faster than the standard 'default' bezier
    style: { strokeWidth: 2 },
    };
    

    return (
        <div className="flex h-screen w-full overflow-hidden" >
            <div className="relative flex-grow h-full">
                <ReactFlow
                nodes={observableFlowStore.nodes}
                nodeTypes={nodeTypes}
               
                edges={observableFlowStore.edges}
                onEdgesChange={observableFlowStore.onEdgesChange}
                onNodesChange={observableFlowStore.onNodesChange}
                onNodeDoubleClick={handleNodeDoubleClick}
                onBeforeDelete={onBeforeDelete}
                onConnect={observableFlowStore.onConnect}

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
                colorMode='dark'

                edgesFocusable={false}
                

                > 
                <Background />
                
                <Controls />
                <MiniMap/>
                </ReactFlow>
                <PaneOptionsMenu />
                
            </div>


        </div>
    )
});