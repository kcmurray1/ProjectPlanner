import { type NodeProps} from "@xyflow/react";
import { observer } from "mobx-react-lite";
import { BaseNode } from "./BaseNode";
import { useCallback, useState } from "react";
import { canvasStore } from "../../stores/CanvasStore";


export const NoteNode = observer((nodeData: NodeProps) => {
    const {id } = nodeData;
    const { nodeStore } = canvasStore;
    const node = nodeStore.nodesMap.get(id);

    const [nodeDesc, setNodeDesc] = useState(node?.description || "");


     const onBlur = useCallback(async () => {
        if (node) {
            await nodeStore.updateDesc(node, nodeDesc);
        }
    }, [id, nodeDesc]);
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Shift + Enter creates a new line; bare Enter commits changes
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.blur();
        }
    };

    return (
        <BaseNode {...nodeData}>
            <div className="w-full h-full p-2 bg-amber-100">          
                <textarea
                    className="nodrag nopan nowheel no-scrollbar w-full h-full 
                               font-medium text-black bg-transparent resize-none 
                               overflow-y-auto block border-none outline-none focus:outline-none focus:ring-0"
                    placeholder="Quick Note..."
                    value={nodeDesc}
                    onChange={(e) => {setNodeDesc(e.target.value);}}
                    onBlur={onBlur}
                    onKeyDown={handleKeyDown}
                  
                />
            </div>
        </BaseNode>
    );
});
