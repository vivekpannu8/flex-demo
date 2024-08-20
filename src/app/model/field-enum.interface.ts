export interface IFieldEnum
{
    //Uniquely identifyable name
    name: string;

    // value of enum if selected
    value: any;

    // name used to display in the UI
    displayName: string;

    // short name used to display in the UI
    shortName: string;

    additionalInformation?: Array<any>;
}
