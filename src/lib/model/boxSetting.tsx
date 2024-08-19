
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
