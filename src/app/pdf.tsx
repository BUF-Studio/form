'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface DraggableItemProps {
  id: string;
  text: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, text }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ITEM',
    item: { id, text },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        padding: '8px',
        margin: '4px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    >
      {text}
    </div>
  );
};

interface DroppedItem {
  id: string;
  text: string;
  x: number;
  y: number;
  pageIndex: number;
}

interface PDFViewerProps {
  fileUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);

  const handleDrop = useCallback(
    (item: { id: string; text: string }, monitor: any, pageIndex: number) => {
      const dropResult = monitor.getSourceClientOffset();
      const viewerElement = document.querySelector('.rpv-core__viewer') as HTMLElement;
      const viewerRect = viewerElement.getBoundingClientRect();

      const x = dropResult.x - viewerRect.left;
      const y = dropResult.y - viewerRect.top;

      setDroppedItems((prevItems) => [
        ...prevItems,
        { ...item, x, y, pageIndex },
      ]);
    },
    []
  );

  const renderPage = useCallback(
    (props: any) => {
      const { pageIndex } = props;

      const PageContent = () => {
        const [, drop] = useDrop(() => ({
          accept: 'ITEM',
          drop: (item: { id: string; text: string }, monitor) => handleDrop(item, monitor, pageIndex),
        }));

        return (
          <div ref={drop} style={{ position: 'relative', height: '100%', width: '100%' }}>
            {props.canvasLayer.children}
            {props.annotationLayer.children}
            {props.textLayer.children}
            {droppedItems
              .filter((item) => item.pageIndex === pageIndex)
              .map((item) => (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    padding: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                  }}
                >
                  {item.text}
                </div>
              ))}
          </div>
        );
      };

      return <PageContent />;
    },
    [droppedItems, handleDrop]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', height: '750px', width: '100%' }}>
        <div style={{ width: '200px', padding: '16px', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
          <h3>Draggable Items</h3>
          <DraggableItem id="1" text="Text Box" />
          <DraggableItem id="2" text="Signature" />
          <DraggableItem id="3" text="Date Field" />
        </div>
        <div style={{ flex: 1 }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={fileUrl}
              plugins={[defaultLayoutPluginInstance]}
              defaultScale={SpecialZoomLevel.PageFit}
              renderPage={renderPage}
            />
          </Worker>
        </div>
      </div>
    </DndProvider>
  );
};

export default PDFViewer;