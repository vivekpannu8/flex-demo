import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';

import { WjGridModule } from '@grapecity/wijmo.angular2.grid';
import { CellRange, CellRangeEventArgs, Column, DataMap, DataMapEditor, Row, SelectionMode } from '@grapecity/wijmo.grid';

import { EditSampleData } from 'testing/data/editsample-data';
import { WatFlexGridData } from 'testing/data/wat-flexgrid-data';

import { WatFlexGridComponent } from './wat-flexgrid.component';

import { ComponentHelpers } from 'app/components/comp-helpers';
import { IEditSampleTable } from 'app/interfaces/edit-sample-table.interface';
import { IEditSample } from 'app/interfaces/edit-sample.interface';
import { IErrorInfo } from 'app/interfaces/error-info.interface';
import { IField } from 'app/interfaces/field.interface';

describe('WatFlexGridComponent', () =>
{
    let component: WatFlexGridComponent;
    let fixture: ComponentFixture<WatFlexGridComponent>;
    let watFlexGridData: WatFlexGridData;

    beforeEach(waitForAsync(async () =>
    {
        await TestBed.configureTestingModule({
            declarations: [WatFlexGridComponent],
            imports: [WjGridModule]
        })
            .compileComponents();
    }));

    beforeEach(() =>
    {
        fixture = TestBed.createComponent(WatFlexGridComponent);
        component = fixture.componentInstance;
        watFlexGridData = new WatFlexGridData();
        fixture.detectChanges();
    });

    it('should create', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should toggle allow add new when pasting', fakeAsync(() =>
    {
        flush();
        expect(component.allowAddNew).toEqual(false);
        component.onPasting(new CellRangeEventArgs(null, new CellRange(0, 0, 0, 0)));
        expect(component.allowAddNew).toEqual(true);
        component.onPasted(new CellRangeEventArgs(null, new CellRange(0, 0, 0, 0)));
        expect(component.allowAddNew).toEqual(false);
    })
    );

    it('should set error data to valid for a data item if the item has no error', fakeAsync(async () =>
    {
        setupErrorData();
        setupRowData();

        await component.updateErrorData(null, '1');

        flush();
        fixture.detectChanges();

        const errorData = component.errorData['1'];
        expect(errorData).toBeDefined();
        expect(errorData.valid).toBeTruthy();
        expect(errorData.error).toBeNull();
    }));

    it('should set error data to invalid for a data item if the item has an error', fakeAsync(async () =>
    {
        setupErrorData();
        setupRowData();

        await component.updateErrorData(watFlexGridData.normalError, '2');

        flush();
        fixture.detectChanges();

        const errorData = component.errorData['2'];
        expect(errorData).toBeDefined();
        expect(errorData.valid).toBeFalsy();
        expect(errorData.error).toBeDefined();
        expect(errorData.error.relatedId).toBeNull();
        expect(errorData.error.errorMessage).toEqual('bad data');
    }));

    it('should set error data for a related row if item is invalid with a related id', fakeAsync(async () =>
    {
        setupErrorData(true);
        setupRowData();

        await component.updateErrorData(watFlexGridData.relatedError2, '3');

        flush();
        fixture.detectChanges();

        let errorData = component.errorData['3'];
        expect(errorData).toBeDefined();
        expect(errorData.valid).toBeFalsy();
        expect(errorData.error).toBeDefined();
        expect(errorData.error.relatedId).toEqual('2');
        expect(errorData.error.errorMessage).toEqual('overlap 2');

        errorData = component.errorData['2'];
        expect(errorData).toBeDefined();
        expect(errorData.valid).toBeFalsy();
        expect(errorData.error).toBeDefined();
        expect(errorData.error.relatedId).toEqual('3');
        expect(errorData.error.errorMessage).toEqual('overlap 3');
    }));

    it('should add loaded rows handler', fakeAsync(() =>
    {
        spyOn(component.loadedRows, 'addHandler');

        component.created();
        flush();

        expect(component.loadedRows.addHandler).toHaveBeenCalledWith(component.loadedRowsHandler);
    }));

    it('should select a row after the rows have been loaded', fakeAsync(() =>
    {
        spyOn(component, 'selectRow');
        setupRowData();
        fixture.detectChanges();
        flush();

        component.loadedRowsHandler(component);

        expect(component.selectRow).toHaveBeenCalled();
    }));

    it('should select a correct cell range', fakeAsync(() =>
    {
        spyOn(component, 'scrollIntoView');
        spyOn(component, 'select');
        component.rowToSelect = 0;
        component.colToSelect = 1;
        fixture.detectChanges();
        flush();

        component.selectRow();

        expect(component.scrollIntoView).toHaveBeenCalledWith(component.rowToSelect, component.colToSelect);
        expect(component.select).toHaveBeenCalledWith(component.rowToSelect, component.colToSelect);
    }));

    [
        {
            expectedResult: true,
            errorData: {
                '61002d8ce9bf510001c64e3b':
                {
                    valid: false,
                    error: { errorMessage: 'error' } as IErrorInfo
                }
            }
        },
        {
            expectedResult: false,
            errorData: {}
        }
    ].forEach(testCase =>
    {
        const { expectedResult, errorData } = testCase;
        it(`should return "${expectedResult}" if grid has errors`, () =>
        {
            component.errorData = errorData;
            expect(component.hasErrors).toBe(expectedResult);
        });
    });

    it('should copy a cell value to the right only if the data type of the destination cell matches the source cell', fakeAsync(async () =>
    {
        spyOn(component.copyRightEnded, 'emit');
        let editSampleData: IEditSampleTable = new EditSampleData().editSampleData;
        component.enableCopyRight = true;
        component.fields = editSampleData.editSample.fields;
        setColumnData(component.fields);
        setRowData(editSampleData.editSample.items);
        flush();
        fixture.detectChanges();

        let value = component.getCellData(0, 0, false);
        component.doCopyDownOrRight(0, 0, "KeyR");
        flush();
        fixture.detectChanges();

        // the copy right copies the sample name to the right
        // it should only copy that string to the injection tag which is also a string and the last column
        // the other columns are numeric or enums so they should not get the value
        for (let col = 1; col < component.columns.length; col++)
        {
            let cellValue = component.getCellData(0, col, false);
            col === 6 ? expect(cellValue).toEqual(value) : expect(cellValue).not.toEqual(value);
        }

        expect(component.copyRightEnded.emit).toHaveBeenCalled();
    }));

    it('should copy a cell value down to any cells below it ', fakeAsync(async () =>
    {
        spyOn(component.copyDownEnded, 'emit');
        let editSampleData: IEditSampleTable = new EditSampleData().editSampleData;
        component.enableCopyDown = true;
        component.fields = editSampleData.editSample.fields;
        editSampleData.editSample.items.push({
            id: '3',
            name: 'Sample3',
            type: 0,
            level: '',
            sampleWeight: 20.0,
            injectionVolume: 40.0,
            dilution: 2.0,
            injectionTag: 'C',
            sampleId: '1',
            customFields: null
        });
        setColumnData(component.fields);
        setRowData(editSampleData.editSample.items);
        flush();
        fixture.detectChanges();

        let value = component.getCellData(0, 0, false);
        component.doCopyDownOrRight(0, 0, "KeyD");
        flush();
        fixture.detectChanges();

        for (let row = 1; row < component.rows.length; row++)
        {
            let cellValue = component.getCellData(row, 0, false);
            expect(cellValue).toEqual(value);
        }

        expect(component.copyDownEnded.emit).toHaveBeenCalled();
    }));

    it('should set the rowSelected correctly based on the selection', fakeAsync(async () =>
    {
        component.columns.push(new Column({ name: 'id', binding: 'id' }));
        component.columns.push(new Column({ name: 'param1', binding: 'param1' }));
        component.columns.push(new Column({ name: 'param2', binding: 'param2' }));
        component.columns.push(new Column({ name: 'param3', binding: 'param3' }));
        component.columns.push(new Column({ name: 'param4', binding: 'param4' }));

        component.rows.push(new Row({ id: '1', param1: 'a', param2: 'f', param3: 'k', param4: 'p' }));
        component.rows.push(new Row({ id: '2', param1: 'b', param2: 'g', param3: 'l', param4: 'q' }));
        component.rows.push(new Row({ id: '3', param1: 'c', param2: 'h', param3: 'm', param4: 'r' }));
        component.rows.push(new Row({ id: '4', param1: 'd', param2: 'i', param3: 'n', param4: 's' }));
        component.rows.push(new Row({ id: '5', param1: 'e', param2: 'j', param3: 'o', param4: 't' }));

        component.selectionMode = SelectionMode.Row;
        fixture.detectChanges();
        flush();
        checkRanges(true, true, true, true, true, true);

        component.selectionMode = SelectionMode.Cell;
        fixture.detectChanges();
        flush();
        checkRanges(false, false, false, false, false, false);

        component.selectionMode = SelectionMode.CellRange;
        fixture.detectChanges();
        flush();
        checkRanges(false, true, false, true, false, false);

        function checkRanges(result1, result2, result3, result4, result5, result6: boolean)
        {
            component.select(new CellRange(1, 1, 1, 1));
            expect(component.rowSelected).toBe(result1);
            component.select(new CellRange(0, 0, 0, 4));
            expect(component.rowSelected).toBe(result2);
            component.select(new CellRange(0, 0, 4, 0));
            expect(component.rowSelected).toBe(result3);
            component.select(new CellRange(1, 0, 1, 4));
            expect(component.rowSelected).toBe(result4);
            component.select(new CellRange(1, 0, 2, 4));
            expect(component.rowSelected).toBe(result5);
            component.select(new CellRange(2, 2, 4, 4));
            expect(component.rowSelected).toBe(result6);
        }
    }));

    function setupErrorData(withRelatedErrors = false): void
    {
        component.errorData['1'] =
        {
            valid: false,
            error: watFlexGridData.normalError
        };
        component.errorData['2'] = withRelatedErrors ? { valid: false, error: watFlexGridData.relatedError3 } : watFlexGridData.validValue;
        component.errorData['3'] = withRelatedErrors ? { valid: false, error: watFlexGridData.relatedError2 } : watFlexGridData.validValue;
    }

    function setupRowData()
    {
        component.rows.push(new Row({ id: '1', name: 'ken' }));
        component.rows.push(new Row({ id: '2', name: 'ken' }));
        component.rows.push(new Row({ id: '3', name: 'ken' }));
    }

    function setColumnData(fields: IField[]): void
    {
        let componentHelpers = new ComponentHelpers();
        for (let i = 0; i < fields.length; i++)
        {
            let isEnumField = fields[i].hasOwnProperty("enumerations") &&
                fields[i].enumerations !== null && fields[i].enumerations.length > 0;

            component.columns.push(new Column(
                {
                    name: fields[i].bindingKey,
                    binding: fields[i].bindingKey,
                    header: fields[i].displayName,
                    width: '*',
                    minWidth: i === 0 ? 200 : 100,
                    isReadOnly: fields[i].bindingKey.toLowerCase() === 'injectionvolume' ? true : false,
                    dataMap: isEnumField ? new DataMap(fields[i].enumerations, 'value', 'displayName') : null,
                    dataType: componentHelpers.convertFieldDataTypeToTableDataType(fields[i].dataType),
                    isRequired: false,
                    dataMapEditor: isEnumField ? DataMapEditor.DropDownList : null
                }));
        }
    }

    function setRowData(items: IEditSample[]): void
    {
        for (let i = 0; i < items.length; i++)
        {
            component.rows.push(new Row(items[i]));
        }
    }
});
