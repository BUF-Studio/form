import { useEffect, useRef } from "react";
import { useDrop } from "react-dnd";

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

export default DeleteArea;
