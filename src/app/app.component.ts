import { Component, OnInit, ViewChild } from '@angular/core';
import { IDisableTableCellDict, WatFlexGridComponent } from './components/wat-flexgrid/wat-flexgrid.component';

import { CollectionView } from '@grapecity/wijmo';
import { CellRangeEventArgs, Column, DataMap, DataMapEditor } from '@grapecity/wijmo.grid';
import { MethodService } from './services/method.service';
import { ComponentType } from './model/method-component-type.enum';
import { IField } from './model/field.interface';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

    title = 'FlexGrid Demo Application';
    selectedRow: string = '1';
    componentId: string = 'Comp1';
    offsetHeight: number;
    splitterMoveCount: number = 0;
    info: any;
    data: CollectionView;
    @ViewChild('compsflex', { static: true }) flex: WatFlexGridComponent;
    @ViewChild('globalFields', { static: false }) globalFieldsTable: WatFlexGridComponent;
    disableTableCellDict: IDisableTableCellDict =
        {
            "expectedRetTime": () => { return true; },
            "isInternalStd": (flex, row) => this.canNotBeUsedAsInternalStd(flex, row),
            "useInternalStd": (flex, row) => this.isNamedGroup(flex, row),
            "expectedWavelength": (flex, row) => this.isNamedGroup(flex, row),
            "expectedMass": (flex, row) => this.isNamedGroup(flex, row),
            "channelName": (flex, row) => this.isNamedGroup(flex, row),
        };
    isReadOnly: any;
    errorMessage: string;


    /**
     *
     */
    constructor(private methodService: MethodService) {
    }

    selecteRowChanged(row: string) {
        this.selectedRow = row;
    }



    async ngOnInit(): Promise<void> {

        this.isReadOnly = false;
        this.flex.isReadOnly = this.isReadOnly;
        await this.onGridInit();
    }

    async onGridInit(): Promise<void> {

        try {
            this.info = await this.methodService.getComponentsAsync(1);
            console.log(this.info);
            
            if (this.info == null) {
                this.errorMessage = "Problem retrieving components of the method";
            }
            else {
                this.data = new CollectionView(this.info.data);
                this.data.trackChanges = true;
                this.createColumns(this.info);
            }
        }
        catch (error) {
            this.errorMessage = error;
        }

        // Use onRowEditStarted to reset editing properties
        this.flex.onRowEditStarted = (e): void => {
            //Skip saving if pasting
            if (this.flex.pastingInProgress) {
                e.cancel = true;
                return;
            }
            this.flex.onRowEditStartedWrapper(e, () => this.onRowEditStarted(e));
        };

        // Use onRowEditEnded to perform row validation
        this.flex.onRowEditEnded = async (e): Promise<void> => {
            //Skip saving if pasting
            if (this.flex.pastingInProgress) {
                e.cancel = true;
                return;
            }
            await this.flex.onRowEditEndedWrapperAsync(e, async () => await this.onRowEditEnded(e));
        };
        this.flex.validateEdits = false; //don't force user to stay in error cell

        await this.initGlobalFieldsTable();
    }

    async initGlobalFieldsTable(): Promise<void> {
        if (this.info?.globalFields?.length > 0) {

            let dataArray = new Array();
            dataArray[0] = this.info.customFields;
            // this.globalData = new CollectionView(dataArray);
            this.globalFieldsTable.autoGenerateColumns = false;
            this.globalFieldsTable.columns.clear();
            this.globalFieldsTable.fields = this.info.globalFields;

            for (let i = 0; i < this.info.globalFields.length; i++) {
                let bindingKey = this.info.globalFields[i].bindingKey;
                bindingKey = bindingKey.substring(bindingKey.indexOf(".") + 1);
                this.globalFieldsTable.columns.push(new Column(
                    {
                        name: bindingKey,
                        binding: bindingKey,
                        header: this.info.globalFields[i].displayName,
                        width: 200,
                        minWidth: 100,
                        isRequired: false,
                        dataType: this.info.globalFields[i].dataType,

                    }));
            }

            this.globalFieldsTable.onRowEditEnded = async (e): Promise<void> => {
                await this.globalFieldsTable.onRowEditEndedWrapperAsync(e, async () => await this.onGlobalTableRowEditEnded(e));
            };
        }

    }

    async onGridBeginningEdit(flex: WatFlexGridComponent, args: CellRangeEventArgs): Promise<void> {
        let col = flex.columns[args.col];
        let row = flex.rows[args.row];
        let compNames = [];

        if (col.binding === 'useInternalStd') {
            // If this component is already selected as an internal standard, it can't also use an internal standard.
            // So only collect a list of possible names if the component is not marked as an internal standard.
            if (row.dataItem.isInternalStd === false) {
                for (let i = 0; i < flex.rows.length; i++) {
                    if (flex.rows[i].dataItem.name &&
                        flex.rows[i].dataItem.isInternalStd === true &&
                        flex.rows[i] !== row) {
                        compNames.push(flex.rows[i].dataItem.name);
                    }
                }
            }

            col.dataMap = new DataMap(compNames);
        }
    }

    isPageValid(): boolean {
        let methodValid = true;

        // Find the first occurence of an error in the table,
        // if index === -1 the table is valid
        let index = this.flex.rows.findIndex(e => e.dataItem.error != null);
        if (index !== -1) {
            methodValid = false;
        }

        // Set method validity
        //  this.methodValidService.setIsPageSettingsValid(methodValid);

        return methodValid;
    }

    private onRowEditStarted(e: CellRangeEventArgs): void
    {
        this.flex.rows[e.row].dataItem.error = null;
    }

    public async onCopyDownEnded(_e: CellRangeEventArgs): Promise<void> {
        await this.validateComponents();
    }

    async validateComponents(): Promise<void> {
        // let customFields = this.globalData != null ? this.globalData.items[0] : null;
        // let comps = await this.methodService.validateComponentsAsync({
        //     "data": this.data.items, "columns": null,
        //     "globalFields": null, "customFields": customFields
        // });

        // // Copy contents of data into existing CollectionView
        // for (let index = 0; index < this.data.items.length; index++) {
        //     Object.assign(this.data.items[index], comps.data[index]);
        // }

        // await this.updateErrorData(comps);
    }

    async updateErrorData(comps: any): Promise<void> {
        for (let comp of comps.data) {
            await this.flex.updateErrorData(comp.error, comp.id);
        }

        this.flex.invalidate();
    }
   
    async onGlobalTableRowEditEnded(e: CellRangeEventArgs): Promise<void>
    {
    }

    refreshTables() {
        // the idea here is to only refresh the top table if the splitter is moved dowm or
        // the bottom table if ths splitter is moved up. The table itself handles refreshing 
        // properly if the table height is getting smaller
        // if (this.meCompsTableComponent !== null)
        // {        
        //     let currentOffsetHeight = this.meCompsTableComponent.flex.hostElement.offsetHeight;        
        //     if (currentOffsetHeight > this.offsetHeight)
        //     {
        //         this.meCompsTableComponent.onResize();                   
        //     }
        //     else if (currentOffsetHeight < this.offsetHeight && this.meCompsCVTableComponent !== null)
        //     {
        //         this.meCompsCVTableComponent.onResize();                    
        //     }
        // }          
    }

    canNotBeUsedAsInternalStd(flex: WatFlexGridComponent, rowNumber: number): boolean {
        let row = flex.rows[rowNumber];
        return row.dataItem !== null && row.dataItem.type !== ComponentType.Target;
    }

    isNamedGroup(flex: WatFlexGridComponent, rowNumber: number): boolean {
        let row = flex.rows[rowNumber];
        return row.dataItem != null && row.dataItem.type === ComponentType.NamedGroup;
    }

    async onCellEditEnded(e: CellRangeEventArgs): Promise<void> {
        let col = this.flex.columns[e.col];
        let row = this.flex.rows[e.row];
        if (row?.dataItem !== null && col?.binding === 'type') {
            // validate immediately
            await this.validateComponents();

            // raise error for identification
            // if (this.compIdentSettings == null) {
            //     const compsIdent = await this.methodService.getCompsIdentSettingsAsync(this.methodId);
            //     this.compIdentSettings = compsIdent.compIdentTable.items;
            // }

            // var identSetting = this.compIdentSettings.find(s => s.id === row.dataItem.id);
            // if (identSetting?.type !== row.dataItem.type) {
            //     this.changedComponentType = true;
            //     this.updateIdentificationSettingsErrors();
            // }
        }
    }

    createColumns(info): void {
        this.flex.autoGenerateColumns = false;
        this.flex.columns.clear();
        this.flex.fields = info.columns;

        for (let i = 0; i < info.columns.length; i++) {
            const bindingKey = info.columns[i].bindingKey;
            this.flex.columns.push(new Column(
                {
                    name: bindingKey,
                    binding: bindingKey,
                    header: info.columns[i].displayName,
                    width: '*',
                    minWidth: 100,
                    isRequired: this.isColumnRequired(bindingKey),
                    dataType: info.columns[i].dataType,
                    dataMap: this.setDataMap(info.columns[i]),
                    dataMapEditor: bindingKey === 'useInternalStd' ? DataMapEditor.DropDownList : null
                }));
        }
    }

    async onRowEditEnded(e: CellRangeEventArgs): Promise<void> {
        if (this.flex.allowAddNew) {
            return;
        }

        //Mark grid as readonly while validate is happening, so that the user
        //can't start editing another row while the data is potentially being replaced.
        this.flex.isReadOnly = true;
        try {
            await this.validateComponents();

            this.flex.rowToSelect = e.row;
            this.flex.isReadOnly = false;
        }
        catch (error) {
            this.errorMessage = "Problem saving component to method.";
            this.flex.isReadOnly = false;
        }
  
    }

    private isColumnRequired(bindingKey: keyof any): boolean {
        return bindingKey === 'isInternalStd';
    }
    private setDataMap(field: IField): any {
        if (field.bindingKey === 'useInternalStd') {
            return new DataMap(new Array());
        }
        if (field.bindingKey === 'type') {
            // allow only the types that are available now
            return new DataMap(field.enumerations.filter(e =>
                e.value === ComponentType.Target ||
                e.value === ComponentType.TimedGroup ||
                e.value === ComponentType.Candidate ||
                e.value === ComponentType.NamedGroup),
                'value', 'displayName');
        }
        return null;
    }
}
