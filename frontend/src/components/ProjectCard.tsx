import { useState, useRef, useEffect } from "react";
import { EllipsisVertical, Edit3, ExternalLink, Trash2, Check, X } from "lucide-react";
import type { Project } from "../stores/ProjectStore";

interface ProjectCardProps {
    project: Project;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onUpdate: (id: number, newName: string) => void;
}

export const ProjectCard = ({ project, isActive, onSelect, onDelete, onUpdate}: ProjectCardProps) => {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [projectName, setProjectName] = useState<string>(project.name)


    useEffect(() => {
        if (!showMenu) return;
        
        const handleOutsideClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [showMenu]);


    const handleNameChange = () =>
    {
        onUpdate(project.id, projectName)
        project.name = projectName
        setIsEditing(false);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter' && e.key !== 'Escape') return;
        if (e.key === 'Enter') {
            handleNameChange()
        };
        if (e.key === 'Escape') setProjectName(project.name);
        setIsEditing(false);
    };

    return (
        <div 
            onClick={onSelect}
            className={`relative p-3 project-card border border-white/40 rounded-lg text-left cursor-pointer transition-all ${
                isActive 
                    ? "bg-blue-200 text-blue-500" 
                    : "hover:text-blue-300 hover:border-blue-300"
            }`}
        >
            <div className="flex justify-between items-center flex-row">
                {isEditing ? (
                    <div className="flex items-center space-x-1 flex-1 mr-2">
                        <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        autoFocus
                        className="text-xs font-bold px-1 py-0.5 border border-slate-300 rounded focus:outline-none focus:border-blue-500 w-full"
                        onKeyDown={handleKeyDown}
                        />
                        <button
                        type="button"
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                        onClick={handleNameChange}
                        >
                        <Check/>
                        </button>

                        <button
                        type="button"
                        className="p-1 text-rose-500 hover:text-rose-600"
                        onClick={()=> {setIsEditing(false); setProjectName(project.name)}}
                        >
                        <X/>    
                        </button>
                    </div>
                ): (
                    <span className="text-xs font-bold">{project.name}</span>
                )}
               
                
                {/* Options Button Anchor Container */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <EllipsisVertical className="w-4 h-4" />
                    </button>

                 
                    {showMenu && (
                        <div 
                            onClick={(e) => e.stopPropagation()} 
                            className="absolute left-full top-0 ml-2 w-36 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 text-slate-700 pointer-events-auto"
                        >
                            <button
                                onClick={() => {setIsEditing(true); setShowMenu(false)}}
                                className="w-full px-3 py-1.5 text-left text-xs flex items-center space-x-2 hover:bg-slate-50 transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Name</span>
                            </button>

                            <button
                                // onClick={() => { onExport?.(); setShowMenu(false); }}
                                className="w-full px-3 py-1.5 text-left text-xs flex items-center space-x-2 hover:bg-slate-50 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                <span>Export Data</span>
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                                onClick={onDelete}
                                className="w-full px-3 py-1.5 text-left text-xs flex items-center space-x-2 text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400 text-current" />
                                <span className="font-medium">Delete</span>
                            </button>
                        </div>
                    )}
                </div>
                
            </div>
            <p className="text-[11px] mt-1 truncate">{project.description}</p>
            
        </div>
    );
};