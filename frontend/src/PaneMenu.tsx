interface PaneMenuProps {
    menu: {x: number; y: number; top: number; left: number}
    onAddNode: (x: number, y: number, type: string) => void;
}

export const PaneMenu = ({ menu , onAddNode}: PaneMenuProps) => {
    
    return (
        <div className="pane-menu" style={{ top: menu.top, left: menu.left}}>
              <button 
                onClick={() => onAddNode(menu.x, menu.y, "taskNode")}
                className="pane-menu-btn"
              >
                + Add Component
              </button>
               <button 
                onClick={() => onAddNode(menu.x, menu.y, "groupNode")}
                className="pane-menu-btn"
              >
                + Add Group
              </button>
            </div> 
    );



}