import { observer } from "mobx-react-lite";
import { observableFlowStore } from "./ObservableFlowStore";


export const PaneOptionsMenu = observer(() => {
    const {menu} = observableFlowStore;

    if(!menu.isOpen) return;
    console.log(menu.top, menu.left)
    return (
        <div
              style={{
                position: 'absolute',
                top: menu.top,
                left: menu.left,
                zIndex: 1000,
                backgroundColor: '#222',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '5px'
              }}
            >
              <button 
                onClick={() => observableFlowStore.menu.addNode()}
                style={{ color: 'white', background: 'none', border: 'none' }}
              >
                + Add Component
              </button>
            </div> 
    )
})
