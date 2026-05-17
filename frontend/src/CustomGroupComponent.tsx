import { NodeResizer, type NodeProps, type OnResizeEnd, type ResizeDragEvent, type ResizeParams } from "@xyflow/react";
import { useCallback } from "react";
import { CustomApiRequest } from "./FetchApI";
import { observer } from "mobx-react-lite";
import { observableFlowStore } from "./ObservableFlowStore";


export const  CustomGroupComponent= observer(({id, data, selected}: NodeProps) => {
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
        <div className={`custom-group-component ${data.className}`}>
        <NodeResizer
            color="#ff0071"
            isVisible={selected}
            minWidth={100}
            minHeight={30} 
            onResizeEnd={onResizeEnd} 
        />
        </div>
    );


})

