import { useEffect } from 'react';
import { useKeyPress, useReactFlow, type Node } from '@xyflow/react';
import { observableFlowStore } from './ObservableFlowStore';

export const useCanvasShortcuts = () => {
    const { getNodes, setNodes, setEdges } = useReactFlow();

    // 1. Define your shortcut listeners
    const isShiftPressed = useKeyPress('Shift');
    const isDeletePressed = useKeyPress('Delete');
    const isSelectAll = useKeyPress('Control+g');

    // 2. Modifier Key Logics (e.g., Shift tracking)
    // useEffect(() => {
    //     if (isShiftPressed) {
    //         console.log('Shift key is actively held down on the canvas.');
    //         // Example: Enable multi-selection modifiers, uniform resizing, etc.
    //     }
    // }, [isShiftPressed]);

    // 3. Trigger Actions on Direct Key Presses (e.g., Delete Key)
    // useEffect(() => {
    //     if (isDeletePressed) {
    //         // Find which elements the user has currently selected on the viewport
    //         const selectedNodes = getNodes().filter((node) => node.selected);
            
    //         if (selectedNodes.length > 0) {
    //             console.log('Deleting selected nodes:', selectedNodes);
                
    //             // Example action: Remove them from your UI array references
    //             setNodes((nds) => nds.filter((node) => !node.selected));
    //             setEdges((eds) => eds.filter((edge) => !edge.selected));

    //             // Optional: Fire a database/MobX call here to purge them globally
    //             // selectedNodes.forEach(node => observableFlowStore.deleteNode(node.id));
    //         }
    //     }
    // }, [isDeletePressed, getNodes, setNodes, setEdges]);

    // 4. Global UI Window Management (e.g., Escape Key)
    useEffect(() => {
        if (isSelectAll) {
            console.log('Select All.');
            const selectedNodeIds: string[] = getNodes()
            .filter((node) => node.selected)   // 1. Keep only selected nodes
            .map((node) => node.id);
            
            setNodes((nds) => 
                nds.map((node: Node)=>{
                    if (selectedNodeIds.includes(node.id)){
                        return {
                            ...node,
                            selected: false
                        }
                    }
                    return node
                })
            )
            // console.log('Deleting selected nodes:', selectedNodes);
                
               
            // Automatically snap your advanced properties drawer shut!
            // observableFlowStore.closeAdvancedPanel();
        }
    }, [isSelectAll]);
};