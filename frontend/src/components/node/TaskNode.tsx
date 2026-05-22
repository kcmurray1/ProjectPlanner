import { type NodeProps, Handle, Position } from "@xyflow/react";
import React, { useCallback, useState, memo, useRef, useEffect} from "react";
import { CustomApiRequest } from "../../FetchApI";
import { observableFlowStore } from "../../MyStore";
import { observer } from "mobx-react-lite";
import { BaseNode } from "./BaseNode";


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

export const TaskNode = observer((nodeData: NodeProps) => {
    // const [descValue, setDescValue] = useState<string>("Description..");
    // const {id, data, selected} = nodeData;
    return (
        <BaseNode {...nodeData}>
            <BiDirectionalHandle id="left" position={Position.Left} />
            <BiDirectionalHandle id="right" position={Position.Right} />
            <BiDirectionalHandle id="top" position={Position.Top} />
            <BiDirectionalHandle id="bottom" position={Position.Bottom} />

            <div className="default-node-body">
                {/* <textarea className={`${selected ? "nodrag nopan is-renaming" : ""}`}
                    onChange={(e) => {
                        e.target.style.height = 'auto'; 
                        setDescValue(e.target.value);                        
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    value={descValue}
                >
                </textarea> */}
             </div>

        </BaseNode>
    );
});