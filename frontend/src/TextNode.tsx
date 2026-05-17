import { type NodeProps, Handle, Position, NodeResizer, type OnResizeEnd, type ResizeDragEvent, type ResizeParams, useReactFlow, NodeToolbar } from "@xyflow/react";
import React, { useCallback, useState, memo, useRef, useEffect} from "react";
import { CustomApiRequest } from "./FetchApI";
import { observableFlowStore } from "./MyStore";
import { observer } from "mobx-react-lite";


const BiDirectionalHandle = ({id, position}: {id: string, position: Position} ) =>{
    return (
        <>
            <Handle
            key={id}
            type="target"
            position={position}
            id={`handle-${id}`}
            className="textnode-handle"
            />
            <Handle
            key={`${id}-in`}
            type="source"
            position={position}
            id={`handle-in-${id}`}
            className="textnode-handle"
            />
        </>
    )
}

export const TextNode = observer(({id, data, selected}: NodeProps) => {
    
    const [value, setValue] = useState<string>(`${data.label}`);
    const [isRenaming, setIsRenaming] = useState<boolean>(false);
    const storeNode = observableFlowStore.nodesMap.get(id);
    const isEditing = storeNode?.isEditing ? storeNode.isEditing : false;
    
    const onChange = useCallback((evt : React.ChangeEvent<HTMLInputElement>) => {
        
        setValue(evt.target.value);
    }, []);

    const onBlur = useCallback( async () => {
        try {
            observableFlowStore.setNodeToEdit(id, false);
            await CustomApiRequest<{name: string}>(`components/${id}`, {name: value}, "PATCH")
            
           
        
        } catch (err) {
        console.error("Failed to change node name:", err);
        }
    }, [value, id]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
        event.currentTarget.blur(); 
    }
    };

  

    const onResizeEnd: OnResizeEnd = useCallback(
        async  (_: ResizeDragEvent, params: ResizeParams) =>{
            try {
                await CustomApiRequest<{name: string}>(`components/${id}`, {width: params.width, height: params.height}, "PATCH")
            } catch (err) {
                console.error(err)
            }
        }
        , [id]
    )

    const handleDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation()
        setIsRenaming(true);
        // if (isEditing)
        // {
        //     e.currentTarget.select();

        // }
    }

    

    
    return (
        <div 
            onBlur={onBlur} 
            className={`text-updater-node ${data.className || ''} ${isEditing ? "nodrag nopan" : ""}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                overflow: 'hidden', // Keeps custom borders clean on container edges
                boxSizing: 'border-box'
            }}
        >
            {/* Resizer overlay tracking framework */}
            <NodeResizer
                color="#ff0071"
                isVisible={selected}
                minWidth={150}
                minHeight={100} // Increased min-height so header + empty body fits cleanly
                onResizeEnd={onResizeEnd} 
            />

            <NodeToolbar isVisible={isEditing} position={Position.Top}>
                <button className="xy-theme__button" onClick={() => observableFlowStore.setNodeToEdit(id, false)}>
                    {isEditing ? "UnEdit" : "Edit"}
                </button>
                <button className="xy-theme__button">Delete</button>
                <button className="xy-theme__button">IDK</button>
            </NodeToolbar>

            <BiDirectionalHandle id="left" position={Position.Left} />
            <BiDirectionalHandle id="right" position={Position.Right} />
            <BiDirectionalHandle id="top" position={Position.Top} />
            <BiDirectionalHandle id="bottom" position={Position.Bottom} />

            {/* --- HEADER BLOCK (Component Title Input) --- */}
            <div 
                className="node-header"
                onDoubleClick={handleDoubleClick}
                style={{
                    width: '100%',
                    height: '5%',
                    padding: '4px 4px',
                    borderBottom: '1px solid #e2e8f0', // Clean separation line
                    backgroundColor: '#8db0cf',       // Slightly shaded header canvas background
                    boxSizing: 'border-box'
                }}
            >     
                <input 
                    id="text" 
                    name="text" 
                    onChange={onChange} 
                    onKeyDown={handleKeyDown} 
                    value={value} 
                    disabled={!isRenaming} 
                    className={isRenaming ? "nodrag nopan" : ""}
                   
                />
            </div>

            {/* --- BODY BLOCK (Future Tasks / Checklists / Data) --- */}
            <div 
                className="node-body"
                style={{
                    flexGrow: 1,          // Forces body wrapper element to expand into remaining space
                    width: '100%',
                    padding: '12px',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    overflowY: 'auto',    // Adds vertical scrollbars automatically if contents overflow
                    fontSize: '13px',
                    color: '#64748b'
                }}
            >
                {/* Future checklist collections, text area markdown content, or status bars drop right here */}
                <div className="placeholder-content" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                    No tasks added yet. Right-click to configure details.
                </div>
            </div>

        </div>
    );
    
});

// export default memo(TextNode);