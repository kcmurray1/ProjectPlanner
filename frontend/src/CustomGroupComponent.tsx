import { NodeResizer, useReactFlow, type NodeProps, type OnResizeEnd, type ResizeDragEvent, type ResizeParams } from "@xyflow/react";
import { memo, useCallback } from "react";
import { CustomApiRequest } from "./FetchApI";



function CustomGroupComponent({id, data, selected}: NodeProps) {
    // const { setNodes } = useReactFlow;

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

    return (
        <div className="custom-group-component">
        <NodeResizer
            color="#ff0071"
            isVisible={selected}
            minWidth={100}
            minHeight={30} 
            onResizeEnd={onResizeEnd} 
        />
        </div>
    );


}

export default memo(CustomGroupComponent);