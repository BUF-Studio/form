
'use client';


import dynamic from 'next/dynamic';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const PDFViewer = dynamic(() => import('./PDFViewer'), {
    ssr: false,
    loading: () => <p>Loading PDF...</p>
});


interface BoxType {
    color: string;
    type: string;
    label: string;
    defaultWidth: number;
    defaultHeight: number;
    minWidth: number;
    minHeight: number;
}

const BOX_TYPES: BoxType[] = [
    { color: 'red', type: 'text', label: 'Text', defaultWidth: 150, defaultHeight: 30, minWidth: 100, minHeight: 30 },
    { color: 'blue', type: 'number', label: 'Number', defaultWidth: 150, defaultHeight: 30, minWidth: 100, minHeight: 30 },
    { color: 'green', type: 'date', label: 'Date', defaultWidth: 150, defaultHeight: 30, minWidth: 100, minHeight: 30 },
    { color: 'yellow', type: 'table', label: 'Table', defaultWidth: 300, defaultHeight: 150, minWidth: 200, minHeight: 100 },
    { color: 'purple', type: 'multiline', label: 'Multiline', defaultWidth: 300, defaultHeight: 150, minWidth: 150, minHeight: 100 },
    { color: 'cyan', type: 'signature', label: 'Signature', defaultWidth: 150, defaultHeight: 150, minWidth: 60, minHeight: 60 },
];

interface BoxSettings {
    required: boolean;
    rows?: number;
    columns?: number;
    cells?: { [key: string]: { type: string; title: string } };
    cellWidths?: number[];
    cellHeights?: number[];
    min?: number;
    max?: number;
    maxLines?: number;
    selectedCell?: string;
}

interface Box {
    id: number;
    type: string;
    title: string;
    width: number;
    height: number;
    settings: BoxSettings;
    pdfPageNumber: number;
    pdfX: number;
    pdfY: number;
}

// interface PDFBox extends Omit<Box, 'left' | 'top'> {
//     pdfPageNumber: number;
//     pdfX: number;
//     pdfY: number;
// }

interface DraggableBoxProps {
    id: number;
    type: string;
    title: string;
    label: string;
    width: number;
    height: number;
    pdfPageNumber: number;
    pdfX: number;
    pdfY: number;
    moveBox: (id: number, pdfPageNumber: number, pdfX: number, pdfY: number) => void;
    resizeBox: (id: number, width: number, height: number) => void;
    isSelected: boolean;
    onClick: (id: number) => void;
    updateTitle: (id: number, newTitle: string) => void;
    updateSettings: (id: number, newSettings: Partial<BoxSettings>) => void;
    settings: BoxSettings;
    selectCell: (boxId: number, cellId: string) => void;
    updateCellTitle: (boxId: number, cellId: string, newTitle: string) => void;
}


const DraggableBox: React.FC<DraggableBoxProps & { pdfPageNumber: number; pdfX: number; pdfY: number }> = ({
    id,
    type,
    title,
    label,
    width,
    height,
    pdfPageNumber,
    pdfX,
    pdfY,
    moveBox,
    resizeBox,
    isSelected,
    onClick,
    updateTitle,
    updateSettings,
    settings,
    selectCell,
    updateCellTitle,
}) => {
    const [editingCellId, setEditingCellId] = useState<string | null>(null);
    const [resizingCell, setResizingCell] = useState<string | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);


    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: 'box',
        item: { id, pdfPageNumber, pdfX, pdfY, width, height, type },
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
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const newWidth = Math.max(BOX_TYPES.find(bt => bt.type === type)!.minWidth, startWidth + dx);
            const newHeight = Math.max(BOX_TYPES.find(bt => bt.type === type)!.minHeight, startHeight + dy);

            resizeBox(id, newWidth, newHeight);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [id, width, height, type, resizeBox]);

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
                position: 'absolute',
                left: `${pdfX}%`,
                top: `${pdfY}%`,
                width: `${width}px`,
                height: `${height}px`,
                // position: 'absolute',
                // left,
                // top,
                // width: `${width}px`,
                // height: `${height}px`,
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

interface SidebarBoxProps {
    color: string;
    type: string;
    label: string;
}

const SidebarBox: React.FC<SidebarBoxProps> = ({ color, type, label }) => {
    const [, drag] = useDrag(() => ({
        type: 'new-box',
        item: { type, label },
    }));

    const dragRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        drag(dragRef.current);
    }, [drag]);

    return (
        <div
            ref={dragRef}
            style={{
                backgroundColor: color,
                width: '80px',
                height: '40px',
                margin: '5px',
                cursor: 'move',
                border: '1px solid black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                borderRadius: '4px',
            }}
        >
            {label}
        </div>
    );
};

interface SettingsPanelProps {
    selectedBox: Box | null;
    updateSettings: (id: number, newSettings: Partial<BoxSettings>) => void;
    updateTitle: (id: number, newTitle: string) => void;
    updateCellTitle: (boxId: number, cellId: string, newTitle: string) => void;
    updateCellType: (boxId: number, cellId: string, newType: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ selectedBox, updateSettings, updateTitle, updateCellTitle, updateCellType }) => {
    if (!selectedBox) return <div className="p-4">No box selected</div>;

    const handleSettingChange = (setting: string, value: any) => {
        updateSettings(selectedBox.id, { [setting]: value });
    };

    const handleCellTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedBox.settings.selectedCell) {
            updateCellTitle(selectedBox.id, selectedBox.settings.selectedCell, e.target.value);
        }
    };

    const handleCellTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (selectedBox.settings.selectedCell) {
            updateCellType(selectedBox.id, selectedBox.settings.selectedCell, e.target.value);
        }
    };

    return (
        <div className="p-4">
            <h3 className="font-bold mb-4">Box Settings</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={selectedBox.title}
                        onChange={(e) => updateTitle(selectedBox.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <input
                        type="text"
                        value={selectedBox.type}
                        readOnly
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
                    />
                </div>

                {selectedBox.type === 'number' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                            <input
                                type="number"
                                value={selectedBox.settings.min || ''}
                                onChange={(e) => handleSettingChange('min', e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                            <input
                                type="number"
                                value={selectedBox.settings.max || ''}
                                onChange={(e) => handleSettingChange('max', e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </>
                )}

                {selectedBox.type === 'multiline' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Lines</label>
                        <input
                            type="number"
                            value={selectedBox.settings.maxLines || ''}
                            onChange={(e) => handleSettingChange('maxLines', parseInt(e.target.value, 10))}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                            min="1"
                        />
                    </div>
                )}

                {selectedBox.type === 'table' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
                            <input
                                type="number"
                                value={selectedBox.settings.rows || 1}
                                onChange={(e) => handleSettingChange('rows', parseInt(e.target.value, 10))}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
                            <input
                                type="number"
                                value={selectedBox.settings.columns || 1}
                                onChange={(e) => handleSettingChange('columns', parseInt(e.target.value, 10))}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                                min="1"
                            />
                        </div>
                        {selectedBox.settings.selectedCell && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selected Cell</label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={selectedBox.settings.cells?.[selectedBox.settings.selectedCell]?.title || ''}
                                        onChange={handleCellTitleChange}
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        placeholder="Cell Title"
                                    />
                                    <select
                                        value={selectedBox.settings.cells?.[selectedBox.settings.selectedCell]?.type || 'number'}
                                        onChange={handleCellTypeChange}
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="number">Number</option>
                                        <option value="text">Text</option>
                                        <option value="date">Date</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={selectedBox.settings.required}
                            onChange={(e) => handleSettingChange('required', e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Required</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

interface SidebarProps {
    selectedBox: Box | null;
    updateSettings: (id: number, newSettings: Partial<BoxSettings>) => void;
    updateTitle: (id: number, newTitle: string) => void;
    updateCellTitle: (boxId: number, cellId: string, newTitle: string) => void;
    updateCellType: (boxId: number, cellId: string, newType: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedBox, updateSettings, updateTitle, updateCellTitle, updateCellType }) => {
    return (
        <div className="w-1/4 bg-gray-100 flex flex-col" style={{ height: 'calc(100vh - 40px)' }}>
            <div className="p-2 flex-1">
                <h2 className="text-lg font-bold mb-2">Elements</h2>
                <div className="flex flex-wrap">
                    {BOX_TYPES.map(({ color, type, label }) => (
                        <SidebarBox key={color} color={color} type={type} label={label} />
                    ))}
                </div>
            </div>
            <div className="flex-1 border-t border-gray-300 overflow-y-auto">
                <SettingsPanel
                    selectedBox={selectedBox}
                    updateSettings={updateSettings}
                    updateTitle={updateTitle}
                    updateCellTitle={updateCellTitle}
                    updateCellType={updateCellType}
                />
            </div>
        </div>
    );
};

interface MainAreaProps {
    boxes: Box[];
    moveBox: (id: number, pdfPageNumber: number, pdfX: number, pdfY: number) => void;
    addBox: (type: string, label: string, pdfPageNumber: number, pdfX: number, pdfY: number) => void;
    resizeBox: (id: number, width: number, height: number) => void;
    selectedBoxId: number | null;
    setSelectedBoxId: (id: number | null) => void;
    updateTitle: (id: number, newTitle: string) => void;
    updateSettings: (id: number, newSettings: Partial<BoxSettings>) => void;
    selectCell: (boxId: number, cellId: string) => void;
    updateCellTitle: (boxId: number, cellId: string, newTitle: string) => void;
    pdfFile: File | null;
    numPages: number;
    scale: number;
    onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

const MainArea: React.FC<MainAreaProps> = ({
    boxes,
    moveBox,
    addBox,
    resizeBox,
    selectedBoxId,
    setSelectedBoxId,
    updateTitle,
    updateSettings,
    selectCell,
    updateCellTitle,
    pdfFile,
    numPages,
    scale,
    onDocumentLoadSuccess,
}) => {
    const mainAreaRef = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop(() => ({
        accept: ['box', 'new-box'],
        drop: (item: any, monitor) => {
            const mainAreaRect = mainAreaRef.current?.getBoundingClientRect();
            const clientOffset = monitor.getClientOffset();

            if (!clientOffset || !mainAreaRect) {
                return;
            }

            const pdfPageElement = mainAreaRef.current?.querySelector('.react-pdf__Page') as HTMLElement;
            if (!pdfPageElement) return;

            const pdfRect = pdfPageElement.getBoundingClientRect();
            const pdfX = ((clientOffset.x - pdfRect.left) / pdfRect.width) * 100;
            const pdfY = ((clientOffset.y - pdfRect.top) / pdfRect.height) * 100;

            if ('id' in item) {
                // Moving an existing box
                moveBox(item.id, 1, pdfX, pdfY); // Assuming single page PDF for simplicity
            } else {
                // Adding a new box
                addBox(item.type, item.label, 1, pdfX, pdfY); // Assuming single page PDF for simplicity
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
                overflow: 'auto'
            }}
        >
            {pdfFile && (
                <PDFViewer
                    file={pdfFile}
                    numPages={numPages}
                    scale={scale}
                    onLoadSuccess={onDocumentLoadSuccess}
                />
            )}
            {boxes.map((box) => (
                <DraggableBox
                    key={box.id}
                    {...box}
                    label={BOX_TYPES.find(bt => bt.type === box.type)!.label}
                    moveBox={moveBox}
                    resizeBox={resizeBox}
                    isSelected={box.id === selectedBoxId}
                    onClick={setSelectedBoxId}
                    updateTitle={updateTitle}
                    updateSettings={updateSettings}
                    selectCell={selectCell}
                    updateCellTitle={updateCellTitle}
                />
            ))}
        </div>
    );
};


interface DeleteAreaProps {
    onDrop: (id: number) => void;
}

const DeleteArea: React.FC<DeleteAreaProps> = ({ onDrop }) => {

    const dropRef = useRef<HTMLDivElement>(null);


    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'box',
        drop: (item: { id: number }) => onDrop(item.id),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));


    useEffect(() => {
        drop(dropRef.current);
    }, [drop]);



    return (
        <div
            ref={dropRef}
            className="w-full h-10 bg-red-200 flex items-center justify-center text-sm"
            style={{
                backgroundColor: isOver ? 'red' : '#FFCCCB',
            }}
        >
            Drop here to delete
        </div>
    );
};

const DragAndDropApp: React.FC = () => {
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState<number>(1);

    const moveBox = useCallback((id: number, pdfPageNumber: number, pdfX: number, pdfY: number) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) =>
                box.id === id ? { ...box, pdfPageNumber, pdfX, pdfY } : box
            )
        );
    }, []);

    const addBox = useCallback((type: string, label: string, pdfPageNumber: number, pdfX: number, pdfY: number) => {
        const boxType = BOX_TYPES.find(bt => bt.type === type)!;
        const newBox: Box = {
            id: Date.now(),
            type,
            title: label,
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
            pdfPageNumber,
            pdfX,
            pdfY,
        };
        setBoxes((prevBoxes) => [...prevBoxes, newBox]);
        setSelectedBoxId(newBox.id);
    }, []);



    const resizeBox = useCallback((id: number, width: number, height: number) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) =>
                box.id === id ? { ...box, width, height } : box
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPdfFile(file);
        }
    };

    const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleSave = () => {
        const boxLocations = boxes.map(box => ({
            id: box.id,
            type: box.type,
            title: box.title,
            pdfPageNumber: box.pdfPageNumber,
            pdfX: box.pdfX,
            pdfY: box.pdfY,
            width: box.width,
            height: box.height,
        }));

        const saveData = {
            pdfName: pdfFile?.name,
            boxes: boxLocations,
        };

        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pdf_box_locations.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-screen">
                <div className="p-4 bg-gray-200">
                    <input type="file" accept=".pdf" onChange={handleFileChange} />
                    <button onClick={() => setScale(scale + 0.1)} className="ml-4">Zoom In</button>
                    <button onClick={() => setScale(Math.max(0.1, scale - 0.1))} className="ml-2">Zoom Out</button>
                    <button onClick={handleSave} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">Save Box Locations</button>
                </div>
                <DeleteArea onDrop={handleDelete} />
                <div className="flex flex-1">
                    <Sidebar
                        selectedBox={boxes.find(box => box.id === selectedBoxId) || null}
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
                        pdfFile={pdfFile}
                        numPages={numPages}
                        scale={scale}
                        onDocumentLoadSuccess={handleDocumentLoadSuccess}
                    />
                </div>
            </div>
        </DndProvider>
    );
};


export default DragAndDropApp;