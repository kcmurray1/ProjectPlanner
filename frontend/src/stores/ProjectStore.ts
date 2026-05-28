
import { makeAutoObservable, runInAction} from "mobx";
import { CustomApiRequest } from "./../FetchApI";
import type { CanvasStore } from "./CanvasStore";
// import type { ObservableNodeModel } from "./nodeStore";
interface Project {
    id: number
    name: string
    description: string
}



export class ProjectStore {
    canvasStore: CanvasStore
    projects: Project[] = []
    isSidebarOpen: boolean = true;
    activeTab: "explorer" | "summary" = "explorer";
    isLoading: boolean = false;

    constructor(rootStore: CanvasStore) {
        this.canvasStore = rootStore; 
        makeAutoObservable(this);
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    setTab(tab: "explorer" | "summary") {
        this.activeTab = tab;
        this.isSidebarOpen = true; // Ensure it slides open if clicked while shut
    }

    async fetchAllProjects() {
        try {
            const data = await CustomApiRequest<Project[]>("projects", null, "GET");
            runInAction(() => { this.projects = data; });
        } catch (err) {
            console.error("Failed to load projects", err);
        }
    }

    
}