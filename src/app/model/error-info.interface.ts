export interface IErrorInfo
{
    relatedId: string;
    errorMessage: string;
    errorFields: Array<string>;
    fieldMessages:
    {
        [id: string]: string;
    };
}
