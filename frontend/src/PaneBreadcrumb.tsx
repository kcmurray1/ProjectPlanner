import { observer } from "mobx-react-lite";
import { observableFlowStore } from "./MyStore";


const CustomBreadcrumbItem = (({label, id}: {label: string, id: string}) =>{



    return (
        <button onClick={() => observableFlowStore.jumpToPane(Number(id))}>
            <span>{label}</span>
        </button>
    )
});


export const PaneBreadcrumbs = observer(() => {

    const history = observableFlowStore.paneHistory;

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