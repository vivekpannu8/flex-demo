import { WjFlexGrid } from '@grapecity/wijmo.angular2.grid';

import { TableValidationHelperService } from './table-validation-helper.service';
import { TablesStateStoreService } from 'app/services/tables-state-store.service';
import { IErrorInfo } from 'app/model/error-info.interface';
import { ValidationRules } from 'app/model/types/validation-rules.type';


export class TableHelperService implements TableHelperFunctions {
    private tablesStateStoreService: TablesStateStoreService;
    private tableId: string;
    private table: WjFlexGrid;

    constructor() {
        this.tablesStateStoreService = new TablesStateStoreService();
    }

    public for(tableId: string, table: WjFlexGrid): TableHelperFunctions {
        this.tableId = tableId;
        this.table = table;
        return this;
    }

    public disableRows({ ignoredIndexes = [] }: { ignoredIndexes?: Array<number>; } = {}): TableHelperFunctions {
        this.tablesStateStoreService.put(this.tableId, this.table);
        const rowsToDisable = this.table.rows.filter((_, index) => !ignoredIndexes.includes(index));
        rowsToDisable.forEach(row => {
            row.isReadOnly = true;
        });
        return this;
    }

    public disableRow(index: number): TableHelperFunctions {
        this.tablesStateStoreService.put(this.tableId, this.table);
        const row = this.table.rows[index];
        row.isReadOnly = true;
        return this;
    }

    public restoreStates(): TableHelperFunctions {
        const tableStates = this.tablesStateStoreService.popAll(this.tableId);
        tableStates.forEach(tableState => {
            this.table.rows.forEach((row, index) => Object.assign(row, tableState.rows[index]));
        });
        return this;
    }

    public restoreLastState(): TableHelperFunctions {
        const tableState = this.tablesStateStoreService.pop(this.tableId);
        this.table.rows.forEach((row, index) => Object.assign(row, tableState?.rows[index]));
        return this;
    }

    public validateRow(rowIndex: number, validationRules: ValidationRules): IErrorInfo {
        const tableValidationHelperService = new TableValidationHelperService(validationRules);
        const fields = this.table.columns.map(column => column.name);
        const dataItem = this.table.rows[rowIndex].dataItem;
        const errorInfo = tableValidationHelperService.validate(dataItem, fields);
        return errorInfo;
    }
}

export interface TableHelperFunctions {
    disableRows({ ignoredIndexes }?: { ignoredIndexes?: Array<number>; }): TableHelperFunctions;
    disableRow(index: number): TableHelperFunctions;
    restoreStates(): TableHelperFunctions;
    restoreLastState(): TableHelperFunctions;
    validateRow(rowIndex: number, validationRules: ValidationRules): any;
}
