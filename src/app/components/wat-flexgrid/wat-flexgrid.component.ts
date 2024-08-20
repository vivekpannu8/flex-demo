import { Component, EventEmitter, forwardRef, HostBinding, Input, OnDestroy, Output } from '@angular/core';

import { Clipboard, EventArgs, Tooltip } from '@grapecity/wijmo';
import { WjFlexGrid, wjFlexGridMeta } from '@grapecity/wijmo.angular2.grid';
import
    {
        AllowSorting,
        CellEditEndingEventArgs,
        CellRange,
        CellRangeEventArgs,
        SelectionMode
    } from '@grapecity/wijmo.grid';
import { v4 as uuidv4 } from 'uuid';


import { IField } from 'app/model/field.interface';
import { TableFieldDataType } from 'app/model/types/table-field-data-type.enum';
import { TableHelperFunctions, TableHelperService } from './table-helper.service';
import { IErrorInfo } from 'app/model/error-info.interface';
import { ValidationRules } from 'app/model/types/validation-rules.type';

export interface IDisableTableCellDict
{
    [name: string]: (grid: WatFlexGridComponent, row: number, col: number) => boolean;
}

@Component({
    selector: 'wat-flexgrid',
    template: '',
    providers: [
        { provide: 'WjComponent', useExisting: forwardRef(() => WatFlexGridComponent) },
        ...wjFlexGridMeta.providers
    ]
})
export class WatFlexGridComponent extends WjFlexGrid implements OnDestroy
{
    colToSelect = 0;
    rowToSelect = 0;
    fromOnGridInit = false;
    restoreSelectionMode = null;
    observer: MutationObserver;
    tableId: string;
    fields: IField[];
    disableDefaultSelect = false;

    public pastingInProgress = false;

    @Input() disableTableCellDict: IDisableTableCellDict;
    @Input() enableCopyDown: boolean = false;
    @Input() copyDownColumns: string[];
    @Input() enableCopyRight: boolean = false;
    @Output() copyDownEnded: EventEmitter<CellRangeEventArgs> = new EventEmitter<CellRangeEventArgs>();
    @Output() copyRightEnded: EventEmitter<CellRangeEventArgs> = new EventEmitter<CellRangeEventArgs>();

    @HostBinding('class.row-selected') get rowSelected(): boolean
    {
        if (this.selectionMode === SelectionMode.Row)
        {
            return true;
        }

        if (this.selectionMode === SelectionMode.Cell || this.containsFocus() || this.selectedRanges.length !== 1)
        {
            return false;
        }

        const range = this.selectedRanges[0];
        return range.row === range.row2 && range.col === 0 && range.col2 === this.columns.length - 1;
    }

    private errorTooltip: Tooltip;
    private columnHeaderTooltip: Tooltip;
    private tableHelperFunctions: TableHelperFunctions;

    // errorData used for tracking errors on editable table rows
    errorData: // dictionary
        {
            [id: string]: // key
            {
                valid: boolean;
                error: IErrorInfo;
            };
        } = {};

    public get hasErrors(): boolean
    {
        const errorsExist = Object.values(this.errorData).some(record => record.error);
        return errorsExist;
    }

    created(): void
    {
        this.fields = null;
        this.showMarquee = true; // for placing a border around groups of selected cells
        this.anchorCursor = true;
        this.tableId = uuidv4();
        this.tableHelperFunctions = new TableHelperService().for(this.tableId, this);

        // error tooltip
        this.errorTooltip = new Tooltip();
        this.errorTooltip.isContentHtml = true;
        this.errorTooltip.cssClass = "wj-error-tip";

        // column header tooltip
        this.columnHeaderTooltip = new Tooltip();
        this.columnHeaderTooltip.isContentHtml = true;
        this.columnHeaderTooltip.cssClass = "wj-header-tip top";

        this.loadedRows.addHandler(this.loadedRowsHandler);
        this.selectionChanged.addHandler(this.selectionChangedHandler);
        //override to pasting behavior
        this.pasted.addHandler(this.afterPasteHandler);
        this.pasting.addHandler(this.beforePasteHandler);
        this.copying.addHandler(this.beforeCopyHandler);

        // base class handler name needs to be unique - assures this handler and other
        // cellEditEnded handlers in components that use this component also get called
        this.beginningEdit.addHandler(this.onBeginEditBase.bind(this));
        this.cellEditEnded.addHandler(this.onCellEditEndedBase.bind(this));
        this.allowSorting = AllowSorting.None;

        // Set the minimum size of the row headers to 60px so that users can't
        // resize the column to smaller than 60px.
        this.rowHeaders.columns.minSize = 60;
        // Prevent the row headers from being resized and causing other columns to be hidden
        this.rowHeaders.columns[0].allowResizing = false;
        this.errorTip.isContentHtml = true;
        this.refreshOnEdit = true;

        this.hostElement.addEventListener('keydown', (e) =>
        {
            if ((e.code === "KeyD" || e.code === "KeyR") && e.ctrlKey)
            {
                e.preventDefault();
                if (this.selection)
                {
                    let row = this.selection.topRow, col = this.selection.leftCol;
                    if (this.copyDownColumns == null || this.copyDownColumns.includes(this.columns[col].binding))
                    {
                        this.doCopyDownOrRight(row, col, e.code);
                    }
                }
            }
        });
    }

    ngOnDestroy(): void
    {
        if (this.errorTooltip != null)
        {
            this.errorTooltip.dispose();
        }

        if (this.columnHeaderTooltip != null)
        {
            this.columnHeaderTooltip.dispose();
        }
    }

    selectionChangedHandler(self, e: CellRangeEventArgs): void
    {
        if (e.range.isSingleCell && e.panel.grid._activeCell) // check that one single cell is actually selected
        {
            if (e.panel.grid._activeCell.classList.contains("wj-state-invalid"))
            {
                self.showMarquee = false; // don't show selection marquee, let error border take priority
            }
            else
            {
                self.showMarquee = true; // cell is valid, show marquee
            }
        }
        else
        {
            self.showMarquee = true; // multiple cells selected, show marquee around all
        }
    }

    loadedRowsHandler(self, eventArgs?: EventArgs): void
    {
        let updatedLayoutHandler = function (s, e?: EventArgs)
        {
            // Remove the handler as we do not need it anymore
            s.updatedLayout.removeHandler(updatedLayoutHandler);
            // Auto size the row headers based on the number of rows
            s.autoSizeColumn(0, true);
        };
        // Add an updated layout handler so we can autosize the row headers
        // based on the number of rows
        self.updatedLayout.addHandler(updatedLayoutHandler);

        //If we don't have any rows, get out
        if (self.rows == null || self.rows.length === 0)
        {
            return;
        }

        if (self.disableDefaultSelect)
        {
            self.select(-1, -1);
        }
        else
        {
            //If the specified row to select doesn't exist, select the last row
            //because it probably means we just deleted the (previous) last row
            if (self.rows[self.rowToSelect] == null)
            {
                self.rowToSelect = self.rows.length - 1;
            }

            //The main reason to have onLoadedRows is to select a specified row
            self.selectRow();
        }
        //Some components use the fromOnGridInit flag and it needs to be reset
        self.fromOnGridInit = false;

        //Some components turn off selection mode, and it needs to be restored
        if (self.restoreSelectionMode != null)
        {
            self.selectionMode = self.restoreSelectionMode;
            self.restoreSelectionMode = null;
        }
    }

    selectRow(): void
    {
        this.scrollIntoView(this.rowToSelect, this.colToSelect);
        this.select(this.rowToSelect, this.colToSelect);
    }

    //override default copy action
    beforeCopyHandler(flex: WatFlexGridComponent, e: CellRangeEventArgs): void
    {
        //support for single cell copying
        if (flex.selection.isSingleCell)
        {
            let clip = flex.getCellData(e.row, e.col, true);
            Clipboard.copy(clip);
            e.cancel = true;
        }
    }

    //override default paste action
    beforePasteHandler(flex: WatFlexGridComponent, e: CellRangeEventArgs): void
    {
        //enabling allows rolling additions from paste
        flex.allowAddNew = true;
        flex.pastingInProgress = true;
        //support for single cell pasting
        if (e.range.isSingleCell && e.data)
        {
            e.cancel = false;
            flex.setCellData(flex.selection.row, flex.selection.col, e.data);
            flex.allowAddNew = false;
        }
    }

    afterPasteHandler(flex: WatFlexGridComponent, e: CellRangeEventArgs): void
    {
        //disable after we are done pasting
        flex.allowAddNew = false;
        flex.pastingInProgress = false;
        //perform range based rowEditEnd
        flex.onRowEditEnded(e);
    }

    onBeginEditBase(flex: WatFlexGridComponent, e: CellRangeEventArgs): void
    {
        if (this.disableTableCellDict != null && this.cells === e.panel)
        {
            let func = this.disableTableCellDict[this.columns[e.col].binding];
            if (func != null)
            {
                e.cancel = func(this, e.row, e.col);
            }
        }
    }
    onCellEditEndedBase(flex: WatFlexGridComponent, args: CellEditEndingEventArgs): boolean
    {
        const { row, col } = args;
        if (this.fields != null && this.fields[col].dataType === TableFieldDataType.INTEGER)
        {
            let value = flex.getCellData(row, col, false);
            if (value != null)
            {
                flex.setCellData(row, col, Math.round(value));
            }
        }
        return true;
    }

    public onRowEditStartedWrapper(e: CellRangeEventArgs, runCallback: () => void = null): void
    {
        this.tableHelperFunctions.disableRows({ ignoredIndexes: [e.row] });
        if (runCallback)
        {
            runCallback();
        }
    }

    public async onRowEditStartedWrapperAsync(e: CellRangeEventArgs, runCallbackAsync: () => Promise<void> = null): Promise<void>
    {
        this.tableHelperFunctions.disableRows({ ignoredIndexes: [e.row] });
        if (runCallbackAsync)
        {
            await runCallbackAsync();
        }
    }

    public onRowEditEndedWrapper(e: CellRangeEventArgs, runCallback: () => void = null): void
    {
        this.tableHelperFunctions.disableRow(e.row);
        try
        {
            if (runCallback)
            {
                runCallback();
            }
        }
        finally
        {
            this.tableHelperFunctions.restoreStates();
        }
    }

    public async onRowEditEndedWrapperAsync(e: CellRangeEventArgs, runCallbackAsync: () => Promise<void> = null): Promise<void>
    {
        this.tableHelperFunctions.disableRow(e.row);
        try
        {
            if (runCallbackAsync)
            {
                await runCallbackAsync();
            }
        }
        finally
        {
            this.tableHelperFunctions.restoreStates();
        }
    }

    async updateErrorData(rowErrorData: IErrorInfo, rowId: string): Promise<void>
    {
        let previouslyRelatedRows: string[] = [];
        if (rowErrorData == null)
        {
            let errorData = this.errorData[rowId];
            if (errorData != null)
            {
                // Only need to reset if there was an error
                errorData.valid = true;
                errorData.error = null;
            }
        }
        else
        {
            let previousRowErrorData = this.errorData[rowId] && this.errorData[rowId].error;
            if (previousRowErrorData != null && previousRowErrorData.relatedId !== rowErrorData.relatedId)
            {
                previouslyRelatedRows = Object.keys(this.errorData)
                    .filter(key => this.errorData[key].error != null)
                    .filter(key => this.errorData[key].error.relatedId === rowId);
            }
            this.errorData[rowId] =
            {
                valid: false,
                error: rowErrorData,
            };
        }
    }

    public async validateFields(rowIndex: number, validationRules: ValidationRules): Promise<void>
    {
        const dataItem = this.rows[rowIndex].dataItem;
        const errorInfo = this.tableHelperFunctions.validateRow(rowIndex, validationRules);
        await this.updateErrorData(
            errorInfo.errorFields.length > 0 ? errorInfo : null,
            dataItem.id
        );
        this.invalidate();
    }

    public doCopyDownOrRight(row: number, col: number, keyCode: any): void
    {
        let value = this.getCellData(row, col, false);
        if (this.enableCopyDown && keyCode === "KeyD")
        {
            for (let r = row + 1; r < this.rows.length; ++r)
            {
                this.setCellData(r, col, value);
            }

            if (row + 1 < this.rows.length)
            {
                this.copyDownEnded.emit(new CellRangeEventArgs(this.cells, new CellRange(row + 1, col, this.rows.length - 1, col)));
            }
        }
        else if (this.enableCopyRight && keyCode === "KeyR")
        {
            for (let c = col + 1; c < this.columns.length; ++c)
            {
                if (this.isColumnCompatible(col, c))
                {
                    this.setCellData(row, c, value);
                }
            }

            if (col + 1 < this.columns.length)
            {
                this.copyRightEnded.emit(new CellRangeEventArgs(this.cells, new CellRange(row, col + 1, row, this.columns.length - 1)));
            }
        }

    }

    private isColumnCompatible(startCol: number, col: number): boolean
    {
        if (this.fields != null)
        {
            return (this.fields[startCol].dataType === this.fields[col].dataType);
        }

        // using wijmo datatypes is a bit risky as an enum column is treated as a string datatype
        // it is possible an enum column will be changed if source string matches an enum string
        // use fields to be safe!!!
        return (this.columns[startCol].dataType === this.columns[col].dataType);
    }

}
