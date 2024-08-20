import { IFieldEnum } from "./field-enum.interface";

export interface IField
{
    // The internal name. Matches the name of the form input (case-insensitive).
    name: string;

    // Indicates the data's type for formatting.
    dataType: number;

    // Unique key for tabular binding
    bindingKey: string;

    // The name as displayed on the screen
    displayName: string;

    // The minimum allowed value. Used for validation.
    minValue: any;

    // The maximum allowed value. Used for validation.
    maxValue: any;

    // The number of decimal places for number formatting.
    decimalPlaces: number;

    // Indicates a required field.
    isRequired: boolean;

    metaData?: string;

    /// Enumeration types for fixed range values
    enumerations: Array<IFieldEnum>;

    // Indicates units
    units: string;
}
