'use client';


import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Ensure PDF.js worker is set up
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | string | null;
  scale: number;
  onLoadSuccess: (numPages: number) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, scale, onLoadSuccess }) => {
  const [numPages, setNumPages] = useState<number>(0);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onLoadSuccess(numPages);
  };

  return (
    <div className="pdf-viewer">
      <Document
        file={file}
        onLoadSuccess={handleLoadSuccess}
        options={{
          cMapUrl: 'cmaps/',
          cMapPacked: true,
        }}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;