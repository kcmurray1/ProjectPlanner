import { observer } from "mobx-react-lite";
import { canvasStore } from "./stores/CanvasStore";


const CustomBreadcrumbItem = (({label, id}: {label: string, id: string}) =>{



    return (
        <button onClick={() => canvasStore.jumpToPane(Number(id))}>
            <span>{label}</span>
        </button>
    )
});


export const PaneBreadcrumbs = observer(() => {

    const history = canvasStore.paneHistory;

    return (
        <nav className="pane-breadcrumbs">
            {history.map((step, index)=> {

                const isLast = index == history.length - 1;
                return (
                    isLast ? 
                       <CustomBreadcrumbItem key={index} label={step.label} id={step.id}/>
                    : (<span key={index} ><CustomBreadcrumbItem label={step.label} id={step.id}/>/</span>)
                )
            })}
        </nav>
    )
});