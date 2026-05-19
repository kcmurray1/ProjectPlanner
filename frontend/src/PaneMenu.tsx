interface PaneMenuProps {
    menu: {x: number; y: number; top: number; left: number}
    onAddNode: (x: number, y: number) => void;
    onAddGroup: ()=> void;
}

export const PaneMenu = ({ menu , onAddNode, onAddGroup }: PaneMenuProps) => {
    
    return (
        <div className="pane-menu" style={{ top: menu.top, left: menu.left}}>
              <button 
                onClick={() => onAddNode(menu.x, menu.y)}
                className="pane-menu-btn"
              >
                + Add Component
              </button>
               <button 
                onClick={() => onAddGroup()}
                className="pane-menu-btn"
              >
                + Add Group
              </button>
            </div> 
    );



}