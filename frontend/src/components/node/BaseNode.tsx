import { type NodeProps, NodeResizer, type OnResizeEnd, type ResizeDragEvent, type ResizeParams} from "@xyflow/react";
import React, { useCallback, useState} from "react";
import { CustomApiRequest } from "../../FetchApI";
import { observableFlowStore } from "../../MyStore";
import { observer } from "mobx-react-lite";


interface BaseNodeProps extends NodeProps {
  children?: React.ReactNode;
}

export const BaseNode = observer(({id, data, selected, children}: BaseNodeProps) => {
    
    const [value, setValue] = useState<string>(`${data.label}`);
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

            {children}



        </div>
    );
    
});