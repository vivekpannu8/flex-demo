import { WjFlexGrid } from '@grapecity/wijmo.angular2.grid';
import { RowCollection } from '@grapecity/wijmo.grid';

export class TablesStateStoreService
{
    private storedTablesStates: { [tableId: string]: Array<TableState>; } = {};

    constructor() { }

    public put(tableId: string, table: WjFlexGrid): void
    {
        const tableState = this.getTableState(table);
        this.storedTablesStates[tableId] = this.storedTablesStates[tableId]
            ? [...this.storedTablesStates[tableId], tableState]
            : [tableState];
    }

    public pop(tableId: string): TableState
    {
        if (!this.storedTablesStates[tableId])
        {
            throw new Error(`Table \'${tableId}\' doesn't exist in the store`);
        }

        return this.storedTablesStates[tableId].pop();
    }

    public popAll(tableId: string): Array<TableState>
    {
        if (!this.storedTablesStates[tableId])
        {
            throw new Error(`Table \'${tableId}\' doesn't exist in the store`);
        }

        const tableStates = this.storedTablesStates[tableId];
        this.storedTablesStates[tableId] = [];
        // We have to restore each state incrementaly form the latest to the oldest because of LIFO
        return tableStates.reverse();
    }

    private getTableState(table: WjFlexGrid): TableState
    {
        const tableStateRows = this.getTableStateRows(table.rows);
        const tableState = {
            rows: tableStateRows
        } as TableState;
        return tableState;
    }

    private getTableStateRows(rows: RowCollection): Array<TableStateRow>
    {
        // Note: if you want to enhance the solution by adding another row fields please follow the next rules:
        // - If it's a value type - copy as it is
        // - If it's a reference type - create a deep copy by cloneDeep()
        const tableStateRows: Array<TableStateRow> = rows.map(row => ({
            isReadOnly: row.isReadOnly
        }));
        return tableStateRows;
    }
}

export interface TableState
{
    readonly rows: ReadonlyArray<TableStateRow>;
}

interface TableStateRow
{
    readonly isReadOnly: boolean;
}
