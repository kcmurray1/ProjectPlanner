import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { canvasStore } from "../stores/CanvasStore"; 
export const ProjectSidebar = observer(() => {
 
    const { projectStore } = canvasStore;
    
    const currentActiveProject = canvasStore.currentProject;

    // Local UI state for project creation form inputs
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Fetch initial projects when sidebar mounts
    useEffect(() => {
        projectStore.fetchAllProjects();
    }, []);

    // const handleCreateSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!newProjectName.trim()) return;
    //     await projectStore.createProject(newProjectName, "Custom workspace description");
    //     setNewProjectName("");
    //     setIsCreating(false);
    // };

    return (
        <div className="absolute top-0 left-0 h-full flex z-40 pointer-events-none">
            
            {/* 1. VERTICAL TAB TRIGGER RAIL (Uncommented and operational) */}
            <div className="h-full w-12 bg-slate-900 border-l border-slate-800 flex flex-col items-center py-4 space-y-4 pointer-events-auto shadow-xl">
                <button
                    onClick={() => {
                        if (projectStore.isSidebarOpen && projectStore.activeTab === "explorer") {
                            projectStore.toggleSidebar();
                        } else {
                            projectStore.setTab("explorer");
                        }
                    }}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                        projectStore.isSidebarOpen && projectStore.activeTab === "explorer" 
                            ? "bg-blue-600 text-white" 
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                    title="Project Management"
                >
                    📁
                </button>

                <button
                    onClick={() => {
                        if (projectStore.isSidebarOpen && projectStore.activeTab === "summary") {
                            projectStore.toggleSidebar();
                        } else {
                            projectStore.setTab("summary");
                        }
                    }}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                        projectStore.isSidebarOpen && projectStore.activeTab === "summary" 
                            ? "bg-blue-600 text-white" 
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                    title="Workspace Dashboard Summary"
                >
                    📊
                </button>
            </div>

            {/* 2. THE EXPANDABLE DRAWER CONTENT */}
            <div 
                className={`h-full w-[400px] bg-white border-r border-slate-200 shadow-2xl flex flex-col pointer-events-auto ${
                    /* Instant toggle: remove it completely from the page layout grid when closed */
                    projectStore.isSidebarOpen ? "block" : "hidden"
                }`}
            >
                {/* Header Section */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Workspace Engine</span>
                        <h3 className="text-sm font-bold text-slate-800">
                            {projectStore.activeTab === "explorer" ? "Project Manager" : "Metrics Overview"}
                        </h3>
                    </div>
                    <button 
                        onClick={() => projectStore.toggleSidebar()}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Dynamic Content Panel Slot */}
                <div className="flex-1 p-5 overflow-y-auto bg-white">
                    {projectStore.activeTab === "explorer" ? (
                        <div className="space-y-4">
                            {/* Create Project Mini-Form */}
                            {isCreating ? (
                                <form  className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                                    <input 
                                        type="text"
                                        placeholder="Project Name..."
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                                        autoFocus
                                    />
                                    <div className="flex justify-end space-x-2 text-[11px]">
                                        <button type="button" onClick={() => setIsCreating(false)} className="px-2 py-1 text-slate-500">Cancel</button>
                                        <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded font-medium">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <button 
                                    onClick={() => setIsCreating(true)}
                                    className="w-full border border-dashed border-slate-300 text-slate-600 rounded-md p-2 text-xs font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors"
                                >
                                    + Create New Workspace
                                </button>
                            )}

                            {/* Projects List Loop */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">All Workspaces</span>
                                {projectStore.isLoading ? (
                                    <p className="text-xs text-slate-400 animate-pulse">Loading project index...</p>
                                ) : (
                                    projectStore.projects.map((project) => {
                                        const isActive = currentActiveProject?.id === project.id;
                                        return (
                                            <div 
                                                key={project.id}
                                                onClick={() => {
                                                    // Trigger project switch orchestration sequence
                                                    canvasStore.changeProject(project);
                                                }}
                                                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                                                    isActive 
                                                        ? "bg-blue-50 border-blue-200 text-blue-900 shadow-sm" 
                                                        : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200"
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold">{project.name}</span>
                                                    {isActive && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">Active</span>}
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-1 truncate">{project.description}</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ) : (
                        /* SUMMARY VIEW TAB PANEL */
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500 font-medium">Active Workspace Details:</p>
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                                <h4 className="text-xs font-bold text-slate-800">{currentActiveProject?.name}</h4>
                                <p className="text-xs text-slate-500 mt-1">{currentActiveProject?.description}</p>
                            </div>
                            <p className="text-xs text-slate-400 italic">Analytical aggregation loops will drop here next...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});