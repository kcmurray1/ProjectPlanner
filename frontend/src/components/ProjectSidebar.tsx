import { observer } from "mobx-react-lite";
import { observableFlowStore } from "../MyStore";

export const ProjectSidebar = observer(() => {
    const isOpen = observableFlowStore.isProjectSidebarOpen;
    const activeTab = observableFlowStore.currentProject;

    return (
        <div className="fixed top-0 left-0 h-full flex z-40 pointer-events-none">
            {/* 1. VERTICAL TAB TRIGGER RAIL 
               This strip remains permanently visible on the screen edge so you can always toggle views
            <div className="h-full w-12 bg-slate-900 border-l border-slate-800 flex flex-col items-center py-4 space-y-4 pointer-events-auto shadow-xl">
                <button
                    onClick={() => {
                        if (isOpen && activeTab === "explorer") {
                            // observableFlowStore.closeProjectSidebar();
                        } else {
                            // observableFlowStore.setProjectTab("explorer");
                        }
                    }}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                        isOpen && activeTab === "explorer" 
                            ? "bg-blue-600 text-white" 
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                    title="Project Management"
                >
                    📁
                </button>

                <button
                    onClick={() => {
                        if (isOpen && activeTab === "summary") {
                            // observableFlowStore.closeProjectSidebar();
                        } else {
                            // observableFlowStore.setProjectTab("summary");
                        }
                    }}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                        isOpen && activeTab === "summary" 
                            ? "bg-blue-600 text-white" 
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                    title="Workspace Dashboard Summary"
                >
                    📊
                </button>
            </div> */}

            {/* 2. THE EXPANDABLE DRAWER CONTENT 
               Slides out out to the left of the vertical rail */}
            <div 
                className={`h-full w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col pointer-events-auto transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
                // Offset the drawer layout precisely so it sits perfectly to the left of our 12rem (48px) vertical rail
                style={{ marginRight: "48px" }}
            >
                {/* Header Section */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Workspace Engine</span>
                        <h3 className="text-sm font-bold text-slate-800">
                            {"explorer" === "explorer" ? "Project Manager" : "Metrics Overview"}
                        </h3>
                    </div>
                    <button 
                        // onClick={() => observableFlowStore.closeProjectSidebar()}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Dynamic Content Panel Slot */}
                <div className="flex-1 p-5 overflow-y-auto bg-white">
                    {"explorer" === "explorer" ? (
                        /* PROJECT EXPLORER TAB PLACEHOLDER */
                        <div className="space-y-4 animate-fadeIn">
                            <p className="text-xs text-slate-400 italic">Project CRUD infrastructure hooks go here...</p>
                            {/* We will drop your Create/Select/Remove button array blocks here next! */}
                        </div>
                    ) : (
                        /* SUMMARY VIEW TAB PLACEHOLDER */
                        <div className="space-y-4 animate-fadeIn">
                            <p className="text-xs text-slate-400 italic">Analytical aggregation loops go here...</p>
                            {/* We will drop your task summaries and cluster completion graphs here next! */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});