import { useCallback, useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { BOX_TYPES } from "../model/boxType";

interface DraggableBoxProps {
    id: number;
    type: string;
    title: string;
    label: string;
    left: number;
    top: number;
    width: number;
    height: number;
    moveBox: (id: number, left: number, top: number) => void;
    resizeBox: (id: number, left: number, top: number, width: number, height: number) => void;
    isSelected: boolean;
    onClick: (id: number) => void;
    updateTitle: (id: number, newTitle: string) => void;
    updateSettings: (id: number, newSettings: Partial<BoxSettings>) => void;
    settings: BoxSettings;
    selectCell: (boxId: number, cellId: string) => void;
    updateCellTitle: (boxId: number, cellId: string, newTitle: string) => void;
}


const DraggableBox: React.FC<DraggableBoxProps> = ({
    id,
    type,
    title,
    label,
    left,
    top,
    width,
    height,
    moveBox,
    resizeBox,
    isSelected,
    onClick,
    updateTitle,
    updateSettings,
    settings,
    selectCell,
    updateCellTitle
}) => {
    const [editingCellId, setEditingCellId] = useState<string | null>(null);
    const [resizingCell, setResizingCell] = useState<string | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);


    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: 'box',
        item: (monitor) => {
            const initialOffset = monitor.getInitialClientOffset();
            const initialSourceOffset = monitor.getInitialSourceClientOffset();
            return {
                id,
                left,
                top,
                width,
                height,
                type,
                initialMouseOffset: {
                    x: initialOffset!.x - initialSourceOffset!.x,
                    y: initialOffset!.y - initialSourceOffset!.y
                }
            };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    useEffect(() => {
        preview(previewRef.current);
        drag(dragRef.current);
    }, [preview, drag]);


    const handleResize = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = width;
        const startHeight = height;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.max(BOX_TYPES.find(bt => bt.type === type)!.minWidth, startWidth + moveEvent.clientX - startX);
            const newHeight = Math.max(BOX_TYPES.find(bt => bt.type === type)!.minHeight, startHeight + moveEvent.clientY - startY);
            resizeBox(id, left, top, newWidth, newHeight);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [id, left, top, width, height, resizeBox, type]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        updateTitle(id, e.target.value);
    };

    const getLabelColor = () => {
        switch (type) {
            case 'text': return 'bg-red-200 text-red-800';
            case 'number': return 'bg-blue-200 text-blue-800';
            case 'date': return 'bg-green-200 text-green-800';
            case 'table': return 'bg-yellow-200 text-yellow-800';
            case 'multiline': return 'bg-purple-200 text-purple-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    const getCellTypeIcon = (cellType: string) => {
        switch (cellType) {
            case 'number':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm1-8a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V8z" clipRule="evenodd" />
                    </svg>
                );
            case 'text':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v10h8V6H6z" clipRule="evenodd" />
                    </svg>
                );
            case 'date':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const handleCellTitleChange = (cellId: string, newTitle: string) => {
        updateCellTitle(id, cellId, newTitle);
    };

    const handleCellResize = useCallback((e: React.MouseEvent, rowIndex: number, colIndex: number, isHorizontal: boolean) => {
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const cellWidths = settings.cellWidths || Array(settings.columns).fill(100);
        const cellHeights = settings.cellHeights || Array(settings.rows).fill(30);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (isHorizontal) {
                const diff = moveEvent.clientX - startX;
                const newWidths = [...cellWidths];
                newWidths[colIndex] = Math.max(30, cellWidths[colIndex] + diff);
                updateSettings(id, { cellWidths: newWidths });
            } else {
                const diff = moveEvent.clientY - startY;
                const newHeights = [...cellHeights];
                newHeights[rowIndex] = Math.max(20, cellHeights[rowIndex] + diff);
                updateSettings(id, { cellHeights: newHeights });
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setResizingCell(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        setResizingCell(isHorizontal ? `h-${rowIndex}-${colIndex}` : `v-${rowIndex}-${colIndex}`);
    }, [id, settings, updateSettings]);

    const handleCellClick = (e: React.MouseEvent, cellId: string) => {
        e.stopPropagation();
        selectCell(id, cellId);
    };

    const renderTableContent = () => {
        if (type !== 'table') return null;

        const rows = settings.rows || 1;
        const columns = settings.columns || 1;
        const cellWidths = settings.cellWidths || Array(columns).fill(100);
        const cellHeights = settings.cellHeights || Array(rows).fill(30);

        return (
            <table ref={tableRef} className="w-full h-full table-fixed border-collapse">
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex} style={{ height: `${cellHeights[rowIndex]}px` }}>
                            {Array.from({ length: columns }).map((_, colIndex) => {
                                const cellId = `${rowIndex}-${colIndex}`;
                                const cell = settings.cells?.[cellId] || { type: 'number', title: '' };
                                return (
                                    <td
                                        key={cellId}
                                        className="border border-gray-300 p-1 relative"
                                        style={{
                                            width: `${cellWidths[colIndex]}px`,
                                            backgroundColor: settings.selectedCell === cellId ? 'lightyellow' : 'white'
                                        }}
                                        onClick={(e) => handleCellClick(e, cellId)}
                                    >
                                        <div className="absolute top-0 right-0 p-1">
                                            {getCellTypeIcon(cell.type)}
                                        </div>
                                        {editingCellId === cellId ? (
                                            <input
                                                type="text"
                                                value={cell.title}
                                                onChange={(e) => updateCellTitle(id, cellId, e.target.value)}
                                                onBlur={() => setEditingCellId(null)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        setEditingCellId(null);
                                                    }
                                                }}
                                                className="w-full h-full text-xs border-none focus:outline-none bg-transparent"
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full text-xs truncate cursor-text"
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCellId(cellId);
                                                }}
                                            >
                                                {cell.title || 'Double-click to edit'}
                                            </div>
                                        )}
                                        {colIndex < columns - 1 && (
                                            <div
                                                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                                                onMouseDown={(e) => handleCellResize(e, rowIndex, colIndex, true)}
                                            />
                                        )}
                                        {rowIndex < rows - 1 && (
                                            <div
                                                className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-500"
                                                onMouseDown={(e) => handleCellResize(e, rowIndex, colIndex, false)}
                                            />
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div
            ref={previewRef}
            onClick={(e) => {
                e.stopPropagation();
                onClick(id);
            }}
            style={{
                opacity: isDragging ? 0.5 : 1,
                position: 'absolute',
                left,
                top,
                width: `${width}px`,
                height: `${height}px`,
                border: isSelected ? '2px solid blue' : '1px solid #ccc',
                backgroundColor: 'white',
                borderRadius: '4px',
                padding: '4px',
                cursor: resizingCell ? 'auto' : 'move',
                overflow: 'hidden',
            }}
        >
            <div ref={dragRef} className="w-full h-full flex flex-col relative">
                {type === 'table' ? (
                    renderTableContent()
                ) : (
                    <>
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className="text-sm font-semibold bg-transparent border-none focus:outline-none pr-20"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="absolute top-0 right-0 flex flex-col items-end">
                            <span className={`text-xs font-medium px-2 py-1 rounded-bl ${getLabelColor()}`}>
                                {label}
                            </span>
                        </div>
                    </>
                )}
            </div>
            <div
                style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '10px',
                    height: '10px',
                    cursor: 'se-resize',
                }}
                onMouseDown={handleResize}
            />
        </div>
    );
};

export default DraggableBox;

