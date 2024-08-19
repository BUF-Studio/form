import PDFViewer from "./pdfViewer";

const MyPDFPage: React.FC = () => {
    const fileUrl = 'invoice_wiRqMULhXm6dOfbG84bo.pdf'; // Ensure the file is accessible

    return (
        <div>
            <h1>PDF Viewer</h1>
            <PDFViewer fileUrl={fileUrl} />
        </div>
    );
};

export default MyPDFPage;