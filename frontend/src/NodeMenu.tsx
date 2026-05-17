import { observer } from "mobx-react-lite";
import { observableFlowStore } from "./MyStore";

interface ContextMenuProps {
  id: string;
  top: number;
  left: number;
  flowX: number;
  flowY: number;
  closeMenu: () => void;
}

export const ContextMenu = observer(({ id, top, left, flowX, flowY, closeMenu }: ContextMenuProps) => {
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Triggers MobX to activate input fields inside the node view layer
    observableFlowStore.setNodeToEdit(id, true);
    closeMenu();
  };

  const handleCopy = () => {
    // Stores node data into an internal clipboard variable inside MobX
    // observableFlowStore.copyNodeToClipboard(id);
    closeMenu();
  };

  const handleClone = async () => {
    // Immediately sends a POST to FastAPI with shifted offsets (e.g., flowX + 40, flowY + 40)
    // and copies the active subtasks/configurations over
    // await observableFlowStore.cloneNode(id, flowX + 30, flowY + 30);
    closeMenu();
  };

  const handleDelete = async () => {
    // Makes a DELETE call to your FastAPI backend routing layer
    // await observableFlowStore.deleteSingleNode(id);
    closeMenu();
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: top,
        left: left,
        zIndex: 1000,
        backgroundColor: '#313131',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '4px 0',
        minWidth: '150px',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={(e) => e.stopPropagation()} // Prevents the pane click trigger from firing early
    >
      <button  onClick={handleEdit}>Edit</button>
      <button  onClick={handleCopy}>Copy</button>
      <button  onClick={handleClone}>Clone</button>
      <hr style={{ margin: '4px 0', borderColor: '#f1f5f9' }} />
      <button style={{ color: '#ef4444' }} onClick={handleDelete}>Delete</button>
    </div>
  );
});