import { useReactFlow, type Edge, type Node } from '@xyflow/react';
import React from 'react';
import { CustomApiRequest } from './FetchApI';
// import { useReactFlow } from '@xyflow/react';
// import { observableFlowStore } from './ObservableFlowStore';

interface SelectionToolbarProps {
    isVisible: boolean;
    selectedObjects: {nodes: Node[], edges: Edge[]};
    onClose: () => void;
}

export const SelectionToolbar = ({ isVisible, selectedObjects, onClose }: SelectionToolbarProps) => {
    const { deleteElements, getNodes, setEdges } = useReactFlow();

    if (!isVisible) return null;

    const {nodes, edges} = selectedObjects

    const handleDeleteSelected = async () => {
        try {
            await deleteElements(selectedObjects);   
        } catch (err) {
            console.log(err);
            
        }    
        onClose();
    };

    const handleGroupSelected = async () => {
        console.log("Wrapping nodes into a sub-hierarchy:", nodes);
        
        // Example: Trigger a MobX action or FastAPI call to assign these nodes a parent_id
        // await observableFlowStore.clusterNodesIntoGroup(nodeIds);
        
        onClose();
    };

    return (
        <div className="node-toolbar-wrapper">
            <span style={{ marginRight: '12px', fontWeight: 500 }}>
                {nodes.length} Selected
            </span>
            
            <button className="node-toolbar-btn-default" onClick={handleGroupSelected}>
                Group
            </button>
            
            
            <button className="node-toolbar-btn-default">
                Copy
            </button>
            <button className="node-toolbar-btn-delete" onClick={handleDeleteSelected} >
                Delete
            </button>
        </div>
    );
};