import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { canvasStore } from "../stores/CanvasStore"; 
import { Folder, ListCheck} from "lucide-react";
import { ProjectCard } from "./ProjectCard";




export const ProjectSidebar = observer(() => {
 
    const { projectStore } = canvasStore;

    const currentActiveProject = canvasStore.currentProject;

    // Local UI state for project creation form inputs
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Fetch initial projects when sidebar mounts
    useEffect(() => {
        projectStore.fetchAllProjects();
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName) return;
        await canvasStore.createProject(newProjectName, newProjectDesc);
    
        setNewProjectName("");
        setNewProjectDesc("");
        setIsCreating(false);
    };

    return (
        <div className="absolute top-0 left-0 h-full flex z-40 pointer-events-none">
            
            {/* 1. VERTICAL navbar */}
            <div className="project-rail h-full w-16 flex flex-col items-center py-4 space-y-4 pointer-events-auto">
                <button
                    onClick={() => {
                        if (projectStore.isSidebarOpen && projectStore.activeTab === "explorer") {
                            projectStore.toggleSidebar();
                        } else {
                            projectStore.setTab("explorer");
                        }
                    }}
                    className={`w-14 h-auto py-2 flex-col flex items-center justify-center  ${
                        projectStore.isSidebarOpen && projectStore.activeTab === "explorer" 
                            ? "bg-blue-600 text-white" 
                            : "hover:bg-slate-800 hover:text-white"
                    }`}
                    title="Project Management"
                >   
                    <Folder className="text-current" />
                    <span className="text-[11px] font-medium tracking-wide">Projects</span>
                </button>
                
                <button
                    onClick={() => {
                        if (projectStore.isSidebarOpen && projectStore.activeTab === "summary") {
                            projectStore.toggleSidebar();
                        } else {
                            projectStore.setTab("summary");
                        }
                    }}
                    className={`w-14 h-auto py-2 flex-col flex items-center justify-center ${
                        projectStore.isSidebarOpen && projectStore.activeTab === "summary" 
                            ? "bg-blue-600 text-white" 
                            : "hover:bg-slate-800 hover:text-white"
                    }`}
                    title="Project Summary"
                >
                    <ListCheck/>
                   <span className="text-[11px] font-medium tracking-wide">Summary</span>
                </button>
            </div>

            {/* 2. THE EXPANDABLE DRAWER CONTENT */}
            <div 
                className={`project-sidebar h-full w-[400px] shadow-2xl flex flex-col pointer-events-auto ${
                    projectStore.isSidebarOpen ? "block" : "hidden"
                }`}
            >
                {/* Header Section */}
                <div className="p-4 flex border-b justify-between items-center project-sidebar-header">
                    <div>
                        <h3 className="text-sm font-bold">
                            {projectStore.activeTab === "explorer" ? "Projects" : "Project Overview"}
                        </h3>
                    </div>
                </div>

                <div className="flex-1 p-5 ">
                    {projectStore.activeTab === "explorer" ? (
                        <div className="space-y-4">
                            {isCreating ? (
                                <form onSubmit={handleCreateSubmit} className="p-3 rounded-md space-y-2">
                                    <input 
                                        type="text"
                                        placeholder="Project Name..."
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full text-xs p-2 border  rounded focus:outline-none"
                                        autoFocus
                                    />
                                    <textarea 
                                        placeholder="Project Description..."
                                        value={newProjectDesc}
                                        onChange={(e) => setNewProjectDesc(e.target.value)}
                                        className="w-full text-xs p-2 border  rounded focus:outline-none"
                                        autoFocus
                                    />
                                    <div className="flex justify-end space-x-2 text-[11px]">
                                        <button type="button" onClick={() => setIsCreating(false)} className="px-2 py-1 rounded hover:bg-red-500">Cancel</button>
                                        <button type="submit" className="px-2 py-1 hover:bg-blue-500 rounded font-medium">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <button 
                                    onClick={() => setIsCreating(true)}
                                    className="w-full border border-dashed rounded-md p-2 text-xs font-semibold hover:border-blue-500 hover:text-blue-600"
                                >
                                    + New Project
                                </button>
                            )}

                            {/* Projects List */}
                            <div className="space-y-2">
                                {projectStore.isLoading ? (
                                    <p className="text-xs text-slate-400 animate-pulse">Loading project index...</p>
                                ) : (
                                    projectStore.projects.map((project) => {
                                        const isActive = currentActiveProject?.id === project.id;
                                        
                                        return <ProjectCard 
                                            key={project.id} 
                                            onSelect={() => canvasStore.changeProject(project)} 
                                            onDelete={() => canvasStore.projectStore.delete(project.id)}
                                            isActive={isActive} project={project}/>
                                    })
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Project Summary/overview */
                        <div className="space-y-4 p-4 project-summary rounded-lg">
                            <div className="p-1">
                                <h4 className="text-xs font-bold">{currentActiveProject?.name}</h4>
                                <p className="text-xs  mt-1">{currentActiveProject?.description}</p>
                            </div>
                            <p className="text-xs italic">Analytical aggregation loops will drop here next...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});