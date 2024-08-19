import { BOX_TYPES } from "../model/boxType";
import SettingsPanel from "./settingPanel";
import SidebarBox from "./sidebarBox";

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


export default Sidebar
