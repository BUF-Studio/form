import MyPDFPage from "@/lib/service/pdfPage";
import PDFViewer from "./dnd";
import DragAndDropApp from "@/lib/components/dragDrop";
// import DragAndDropApp from "./dnd";

export default function Home() {
  return (
    <main>
      <DragAndDropApp />
      {/* <MyPDFPage /> */}
      {/* <PDFViewer fileUrl="invoice_wiRqMULhXm6dOfbG84bo.pdf"/> */}
    </main>
  );
}