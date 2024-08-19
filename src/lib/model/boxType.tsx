interface BoxType {
    color: string;
    type: string;
    label: string;
    defaultWidth: number;
    defaultHeight: number;
    minWidth: number;
    minHeight: number;
}

export const BOX_TYPES: BoxType[] = [
    { color: 'red', type: 'text', label: 'Text', defaultWidth: 150, defaultHeight: 30, minWidth: 100, minHeight: 30 },
    { color: 'blue', type: 'number', label: 'Number', defaultWidth: 150, defaultHeight: 30, minWidth: 100, minHeight: 30 },
    { color: 'green', type: 'date', label: 'Date', defaultWidth: 150, defaultHeight: 30, minWidth: 100, minHeight: 30 },
    { color: 'yellow', type: 'table', label: 'Table', defaultWidth: 300, defaultHeight: 150, minWidth: 200, minHeight: 100 },
    { color: 'purple', type: 'multiline', label: 'Multiline', defaultWidth: 300, defaultHeight: 150, minWidth: 150, minHeight: 100 },
    { color: 'cyan', type: 'signature', label: 'Signature', defaultWidth: 150, defaultHeight: 150, minWidth: 60, minHeight: 60 },
];
