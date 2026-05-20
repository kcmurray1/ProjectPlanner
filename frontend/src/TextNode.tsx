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
            className="default-node-handle"
            />
            <Handle
            key={`${id}-in`}
            type="source"
            position={position}
            id={`handle-in-${id}`}
            className="default-node-handle"
            />
        </>
    )
}

export const TextNode = observer(({id, data, selected}: NodeProps) => {
    
    const [value, setValue] = useState<string>(`${data.label}`);
    const [descValue, setDescValue] = useState<string>("Description..");
    const [isRenaming, setIsRenaming] = useState<boolean>(false);


   
    const onChange = useCallback((evt : React.ChangeEvent<HTMLInputElement>) => {
        
        setValue(evt.target.value);
    }, []);

    const onBlur = useCallback( async () => {
        try {
            setIsRenaming(false);
            observableFlowStore.updateLabel(id, value);
            console.log(value);
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
   
    }

    

    
    return (
        <div 
            onBlur={onBlur} 
            className={`text-updater-node ${data.className || ''} ${isRenaming ? "nodrag nopan" : ""}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                overflow: 'hidden', 
                boxSizing: 'border-box'
            }}
        >
            <NodeResizer
                color="#ff0071"
                isVisible={selected}
                minWidth={150}
                minHeight={150} // Increased min-height so header + empty body fits cleanly
                onResizeEnd={onResizeEnd} 
            />
            <BiDirectionalHandle id="left" position={Position.Left} />
            <BiDirectionalHandle id="right" position={Position.Right} />
            <BiDirectionalHandle id="top" position={Position.Top} />
            <BiDirectionalHandle id="bottom" position={Position.Bottom} />

            <div className="default-node-header" onDoubleClick={handleDoubleClick}>

                <input   
                    id="text" 
                    name="text" 
                    onChange={onChange} 
                    onKeyDown={handleKeyDown} 
                    value={value} 
                    disabled={!isRenaming}
                    className={`${isRenaming ? "nodrag nopan is-renaming" : ""}`}
                />
            </div>

            <div className="default-node-body">
                <textarea className={`${selected ? "nodrag nopan is-renaming" : ""}`}
                    onChange={(e) => {
                        e.target.style.height = 'auto'; 
                        setDescValue(e.target.value);                        
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    value={descValue}
                >
                </textarea>
            </div>



        </div>
    );
    
});