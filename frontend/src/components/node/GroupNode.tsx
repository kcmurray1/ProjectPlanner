import { type NodeProps} from "@xyflow/react";
import { observer } from "mobx-react-lite";
import { BaseNode } from "./BaseNode";


export const GroupNode = observer((nodeData: NodeProps) => {
    // const { setNodes } = useReactFlow;
    const {id, data, selected} = nodeData
   
    return (
        <BaseNode {...nodeData}>
            <div className={`custom-group-component ${data.className}`}>
        
            </div>
        </BaseNode>
    );


})

