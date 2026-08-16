import { type NodeProps, Handle, Position } from "@xyflow/react";
import React from "react";

import { canvasStore } from "../../stores/CanvasStore";
import {type  ObservableNodeModel } from "../../stores/NodeStore";
import { ObservableTaskModel } from "../../stores/TaskStore";
import { Plus, CircleMinus, Pencil, PencilOff} from "lucide-react";
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


const handleAddTask = async (node: ObservableNodeModel | undefined) => {
    if(!node){return}
    canvasStore.createTask(node.id);
}

interface TaskItemProps {
    task: ObservableTaskModel;
    node: ObservableNodeModel;
}

const TaskItem = ({task, node} : TaskItemProps) => {

    const handleTaskDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        canvasStore.deleteTask(task, node);
    }
    const openTaskBar = (e: React.MouseEvent) => {
        e.stopPropagation();

        canvasStore.selectTask(task)

    }

    return (
        <div 
            key={task.id} 
            className="task-item-row rounded-[5px] pl-3" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'white', justifyContent: 'space-between' }}
            onClick={openTaskBar}
        >
            <span className={`text-xs font-medium truncate max-w-[120px] ${
                task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'
            }`}>
                {task.title}
            </span>

            <select
                value={task.status}
                onChange={(e) => task.updateProperty(task.id,{status: e.target.value})}
                className={`text-xs font-semibold px-1.5 py-0.5 rounded border cursor-pointer outline-none transition-colors ${
                    task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    task.status === 'not_started' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-slate-50 text-slate-600 border-slate-300' // fallback / todo / backlog
                }`}
            >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>
            {node.isEditing && <CircleMinus onClick={handleTaskDelete} color="Red" className="shrink-0 p-1"/>}
        </div>
                
    )
}




export const TaskNode = observer((nodeData: NodeProps) => {
    const {id } = nodeData;
    // const node = canvasStore.getNode(id);

    const { nodeStore } = canvasStore;
    const node = nodeStore.nodesMap.get(id);


    let progressColor = '#22c55e';

    if (node && nodeStore.progress(node) < 25) {
        progressColor = '#ef4444'; // Red
    } else if (node && nodeStore.progress(node) <= 50) {
        progressColor = '#f97316'; // Orange
    } else if (node && nodeStore.progress(node) < 75) {
        progressColor = '#dfef86'; // Light Green
    } else if (node && nodeStore.progress(node) < 100) {
        progressColor = '#4ade80'; 
    }


    const progress = (
        <>
            {node?.isEditing ? 
            <PencilOff className="h-4.5" onClick={() => canvasStore.toggleNodeEdit(id)}/>
            : <Pencil className="h-4.5" onClick={() => canvasStore.toggleNodeEdit(id)}/> }
            <Plus onClick={()=> handleAddTask(node)} />
            <p 
            style={{ 
                color: progressColor, 
                fontWeight: 'bold',
                transition: 'color 0.3s ease'
            }}
        >
            {node ? Math.round(nodeStore.progress(node)) : 0}%
        </p>
        </>
      
    );

 

    return (
        <BaseNode {...nodeData} headerRight={progress}>
            <BiDirectionalHandle id="left" position={Position.Left} />
            <BiDirectionalHandle id="right" position={Position.Right} />
            <BiDirectionalHandle id="top" position={Position.Top} />
            <BiDirectionalHandle id="bottom" position={Position.Bottom} />

            <div className="default-node-body">
                
                <div className="tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}
                    onClick={(e)=>e.stopPropagation()}
                >
                    {node && canvasStore.nodeStore.tasks(node).map((task) =>
                        TaskItem({task, node})
                    )}
                </div>    
                
            </div>
        </BaseNode>
    );
});