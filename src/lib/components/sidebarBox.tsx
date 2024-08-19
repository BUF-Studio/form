import { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

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

export default SidebarBox
