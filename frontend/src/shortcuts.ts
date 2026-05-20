import { useEffect } from 'react';
import { useKeyPress } from '@xyflow/react';


interface useCanvasShortcutsProps {
    onGroup: () => void
}


export const useCanvasShortcuts = ({onGroup}: useCanvasShortcutsProps) => {
    // // 1. Define your shortcut listeners
    // const isShiftPressed = useKeyPress('Shift');
    // const isDeletePressed = useKeyPress('Delete');
    const isSelectAll = useKeyPress('Control+g');

    useEffect(() => {
    if(isSelectAll) {
        onGroup();
    }
    }, [isSelectAll]);
};