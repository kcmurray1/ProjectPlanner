import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { canvasStore } from "./stores/CanvasStore";


interface TaskDraft {
    title: string;
    description: string;
    status: string;
}



export const TaskSidebar = observer(() => {
    const task = canvasStore.selectedTask;
    const isOpen = task !== null;
    const defaultTask = {
         title: "",
        description: "",
        status: "not_started"
    }
    const [desc, setDescValue] = useState<TaskDraft>(defaultTask);
    
    useEffect(() => {
        setDescValue(task? {title: task.title, description: task.description, status: task.status} : defaultTask)
    }, [task, task?.description]); 

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        setDescValue((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const onBlur = useCallback( async () => {
            try {
                await task?.updateProperty(task.id, desc);                
    
            } catch (err) {
            console.error("Failed to change node name:", err);
            }
        }, [desc, task]);

    
    const onTitleChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.currentTarget.blur(); 
        }
        };

    return (
        <div 
            className={`project-sidebar absolute top-0 right-0 h-full w-[450px] z-50 flex flex-col  ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="project-sidebar-header p-4 flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-bold truncate max-w-[340px]">
                        <input 
                        type="text"
                        name="title"
                        value={desc.title}
                        onChange={handleInputChange}
                        onBlur={onBlur}
                        onKeyDown={onTitleChange}
                        className="w-full font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 outline-none"
                    />
                    </h3>
                </div>
     
                <button 
                    onClick={() => canvasStore.clearSelectedTask()} 
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors font-bold text-sm"
                >
                    ✕
                </button>
            </div>

   
            <div className="flex-1 p-2 overflow-y-auto">
                <textarea 
                    onBlur={onBlur}
                    className="w-full h-3/4 p-3 border border-white/40 rounded-md bg-[var(--accent-bg)] outline-none text-sm"
                    placeholder="Write your system specs, network rules, or execution notes here..."
                    value={desc.description}
                    name="description"
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
});