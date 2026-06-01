import { useState, useRef, useEffect } from "react";
import { EllipsisVertical, Edit3, ExternalLink, Trash2 } from "lucide-react";
import type { Project } from "../stores/ProjectStore";

interface ProjectCardProps {
    project: Project;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
}

export const ProjectCard = ({ project, isActive, onSelect, onDelete}: ProjectCardProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);


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
                <span className="text-xs font-bold">{project.name}</span>
                
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
                                // onClick={() => { onEdit?.(); setShowMenu(false); }}
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