
import { makeAutoObservable, runInAction} from "mobx";
import { CustomApiRequest } from "./../FetchApI";
import type { CanvasStore } from "./CanvasStore";
export interface Project {
    id: number
    name: string
    description: string
}



export class ProjectStore {
    canvasStore: CanvasStore
    projects: Project[] = []
    isSidebarOpen: boolean = false;
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
        this.isSidebarOpen = true;
    }

    async fetchAllProjects() {
        try {
            const data = await CustomApiRequest<Project[]>("projects/", null, "GET");
            runInAction(() => { this.projects = data; });
        } catch (err) {
            console.error("Failed to load projects", err);
        }
    }


    async create(projectName: string, projectDescription: string) {
        const default_desc = "A custom project"
        const payload = {
            name: projectName,
            description: projectDescription ? projectDescription : default_desc
        }
        const data = await CustomApiRequest<Project>("projects", payload, "POST");

        runInAction(() => { this.projects.push(data) });

        return data;



    }
    

    async delete(projectID: number) {
         try {
            const payload = {}
            console.log('deleting')
            await CustomApiRequest<{status: string}>(`projects/${projectID}`, payload, "DELETE");
            runInAction(() => { this.projects = this.projects.filter((project) => project.id !== projectID) });
        } catch (err) {
            console.error("Failed to load projects", err);
        }
    }

    
}