export class FlexgridTooltipHelper
{
    public static getErrorTooltipHtml(errorMessage: string): string
    {
        return '<table class="error-tooltip-inside"><tr><th class="error-header">Error:</th></tr><tr><td>'
            + errorMessage + '</td></tr></table>';
    }
}
