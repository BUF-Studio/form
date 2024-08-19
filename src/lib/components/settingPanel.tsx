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

export default SettingsPanel;