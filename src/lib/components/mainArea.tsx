import { useRef } from "react";
import { useDrop } from "react-dnd";
import DraggableBox from "./dragableBox";
import { BOX_TYPES } from "../model/boxType";

interface MainAreaProps {
    boxes: Box[];
    moveBox: (id: number, left: number, top: number) => void;
    addBox: (type: string, label: string, left: number, top: number) => void;
    resizeBox: (id: number, left: number, top: number, width: number, height: number) => void;
    selectedBoxId: number | null;
    setSelectedBoxId: (id: number | null) => void;
    updateTitle: (id: number, newTitle: string) => void;
    updateSettings: (id: number, newSettings: Partial<BoxSettings>) => void;
    selectCell: (boxId: number, cellId: string) => void;
    updateCellTitle: (boxId: number, cellId: string, newTitle: string) => void;
}

const MainArea: React.FC<MainAreaProps> = ({ boxes, moveBox, addBox, resizeBox, selectedBoxId, setSelectedBoxId, updateTitle, updateSettings, selectCell, updateCellTitle }) => {
    const mainAreaRef = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop(() => ({
        accept: ['box', 'new-box'],
        drop: (item: any, monitor) => {
            const mainAreaRect = mainAreaRef.current?.getBoundingClientRect();
            const clientOffset = monitor.getClientOffset();

            if (!clientOffset || !mainAreaRect) {
                return;
            }

            if (item.id !== undefined) {
                // Moving an existing box
                const left = Math.round(clientOffset.x - mainAreaRect.left - item.initialMouseOffset.x);
                const top = Math.round(clientOffset.y - mainAreaRect.top - item.initialMouseOffset.y);
                moveBox(item.id, left, top);
            } else {
                // Adding a new box
                const left = Math.round(clientOffset.x - mainAreaRect.left - 40);
                const top = Math.round(clientOffset.y - mainAreaRect.top - 20);
                addBox(item.type, item.label, left, top);
            }
        },
    }));


    return (
        <div
            ref={(node) => {
                drop(node);
                mainAreaRef.current = node;
            }}
            className="w-3/4 bg-white p-4 relative"
            style={{
                height: 'calc(100vh - 40px)',
                border: '1px solid #ccc',
                overflow: 'hidden'
            }}
            onClick={() => setSelectedBoxId(null)}
        >
            {boxes.map((box) => (
                <DraggableBox
                    key={box.id}
                    id={box.id}
                    type={box.type}
                    title={box.title}
                    label={BOX_TYPES.find(bt => bt.type === box.type)!.label}
                    left={box.left}
                    top={box.top}
                    width={box.width}
                    height={box.height}
                    moveBox={moveBox}
                    resizeBox={resizeBox}
                    isSelected={box.id === selectedBoxId}
                    onClick={setSelectedBoxId}
                    updateTitle={updateTitle}
                    updateSettings={updateSettings}
                    settings={box.settings}
                    selectCell={selectCell}
                    updateCellTitle={updateCellTitle}
                />
            ))}
        </div>
    );
};

export default MainArea;

