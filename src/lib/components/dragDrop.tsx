'use client';

import { useCallback, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DeleteArea from "./deleteArea";
import Sidebar from "./sidebar";
import MainArea from "./mainArea";
import { BOX_TYPES } from "../model/boxType";

const DragAndDropApp: React.FC = () => {
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);

    const moveBox = useCallback((id: number, left: number, top: number) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) =>
                box.id === id ? { ...box, left, top } : box
            )
        );
    }, []);

    const addBox = useCallback((type: string, label: string, left: number, top: number) => {
        const boxType = BOX_TYPES.find(bt => bt.type === type)!;
        const newBox: Box = {
            id: Date.now(),
            type,
            title: label,
            left,
            top,
            width: boxType.defaultWidth,
            height: boxType.defaultHeight,
            settings: {
                required: true,
                rows: type === 'table' ? 4 : undefined,
                columns: type === 'table' ? 4 : undefined,
                cells: type === 'table'
                    ? Object.fromEntries(
                        Array.from({ length: 16 }).map((_, i) => [
                            `${Math.floor(i / 4)}-${i % 4}`,
                            { type: 'number', title: '' }
                        ])
                    )
                    : undefined,
                cellWidths: type === 'table' ? Array(4).fill(100) : undefined,
                cellHeights: type === 'table' ? Array(4).fill(30) : undefined,
            },
        };
        setBoxes((prevBoxes) => [...prevBoxes, newBox]);
        setSelectedBoxId(newBox.id);
    }, []);

    const resizeBox = useCallback((id: number, left: number, top: number, width: number, height: number) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) =>
                box.id === id ? { ...box, left, top, width, height } : box
            )
        );
    }, []);

    const updateTitle = useCallback((id: number, newTitle: string) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) =>
                box.id === id ? { ...box, title: newTitle } : box
            )
        );
    }, []);

    const updateSettings = useCallback((id: number, newSettings: Partial<BoxSettings>) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => {
                if (box.id === id) {
                    return { ...box, settings: { ...box.settings, ...newSettings } };
                }
                return box;
            })
        );
    }, []);

    const updateCellType = useCallback((boxId: number, cellId: string, newType: string) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => {
                if (box.id === boxId && box.settings.cells) {
                    const newCells = { ...box.settings.cells };
                    newCells[cellId] = { ...newCells[cellId], type: newType };
                    return { ...box, settings: { ...box.settings, cells: newCells } };
                }
                return box;
            })
        );
    }, []);

    const selectCell = useCallback((boxId: number, cellId: string) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => {
                if (box.id === boxId) {
                    return { ...box, settings: { ...box.settings, selectedCell: cellId } };
                }
                return box;
            })
        );
    }, []);

    const handleDelete = useCallback((id: number) => {
        setBoxes((prevBoxes) => prevBoxes.filter((box) => box.id !== id));
        if (selectedBoxId === id) {
            setSelectedBoxId(null);
        }
    }, [selectedBoxId]);

    const updateCellTitle = useCallback((boxId: number, cellId: string, newTitle: string) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => {
                if (box.id === boxId && box.settings.cells) {
                    const newCells = { ...box.settings.cells };
                    newCells[cellId] = { ...newCells[cellId], title: newTitle };
                    return { ...box, settings: { ...box.settings, cells: newCells } };
                }
                return box;
            })
        );
    }, []);

    const selectedBox = boxes.find(box => box.id === selectedBoxId) || null;

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-screen">
                <DeleteArea
                 onDrop={handleDelete} />
                <div className="flex flex-1">
                    <Sidebar
                        selectedBox={selectedBox}
                        updateSettings={updateSettings}
                        updateTitle={updateTitle}
                        updateCellTitle={updateCellTitle}
                        updateCellType={updateCellType}
                    />
                    <MainArea
                        boxes={boxes}
                        moveBox={moveBox}
                        addBox={addBox}
                        resizeBox={resizeBox}
                        selectedBoxId={selectedBoxId}
                        setSelectedBoxId={setSelectedBoxId}
                        updateTitle={updateTitle}
                        updateSettings={updateSettings}
                        selectCell={selectCell}
                        updateCellTitle={updateCellTitle}
                    />
                </div>
            </div>
        </DndProvider>
    );
};

export default DragAndDropApp;