import { type NodeProps, Handle, Position, NodeResizer, type OnResizeEnd, type ResizeDragEvent, type ResizeParams, useReactFlow } from "@xyflow/react";
import React, { useCallback, useState, memo} from "react";
import { CustomApiRequest } from "./FetchApI";

function TextNode({id, data, selected}: NodeProps) {

    const { setNodes } = useReactFlow();
    const [value, setValue] = useState<string>(`${data.label}`);
    const isEditing = !!data.isEditing;
    const onChange = useCallback((evt : React.ChangeEvent<HTMLInputElement>) => {
        
        setValue(evt.target.value);
    }, []);

    const onBlur = useCallback( async () => {
        try {
            await CustomApiRequest<{name: string}>(`components/${id}`, {name: value}, "PATCH")
            setNodes((nds) =>
            nds.map((node) =>
                node.id === id 
                ? { ...node, data: { ...node.data, isEditing: false } } 
                : node
            )
            );
        } catch (err) {
        console.error("Failed to change node name:", err);
        }
    }, [value]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
        event.currentTarget.blur(); 
    }
    };

    const BiDirectionalHandle = ({id, position}: {id: string, position: Position} ) =>{
        return (
            <>
             <Handle
                key={id}
                type="target"
                position={position}
                id={`handle-${id}`}
                />
                <Handle
                key={`${id}-in`}
                type="source"
                position={position}
                id={`handle-in-${id}`}
                />
            </>
        )
    }

    const onResizeEnd: OnResizeEnd = useCallback(
        async  (_: ResizeDragEvent, params: ResizeParams) =>{
            try {
                await CustomApiRequest<{name: string}>(`components/${id}`, {width: params.width, height: params.height}, "PATCH")
            } catch (err) {
                console.error(err)
            }
        }
        , []
    )

    const handleDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation()

        if (isEditing)
        {
            e.currentTarget.select();
        }
    }

    
    return (
        <div className="text-updater-node">
          
            <NodeResizer
            color="#ff0071"
            isVisible={selected}
            minWidth={100}
            minHeight={30} 
            onResizeEnd={onResizeEnd} 
            />
            <BiDirectionalHandle id={"left"} position={Position.Left} />
            <BiDirectionalHandle id={"right"} position={Position.Right} />
            <BiDirectionalHandle id={"top"} position={Position.Top} />
            <BiDirectionalHandle id={"bottom"} position={Position.Bottom} />
            <div style={{ height: '100%', width: '100%' }}>     
                <input id="text" 
                    name="text" 
                    onChange={onChange} 
                    onBlur={onBlur} 
                    onKeyDown={handleKeyDown} 
                    value={value} 
                    disabled={!isEditing} 
                    className={isEditing ? "nodrag nopan" : ""}
                    onDoubleClick={handleDoubleClick}
                    />
            </div>
   
            
            
        </div>
    )
}

export default memo(TextNode);