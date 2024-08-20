import { Injectable } from '@angular/core';

@Injectable()
export class MethodService {
	private headers = new Headers({ 'Content-Type': 'application/json' });
	public selectedComponentId: string;
	public selectedProcCompId: string;

	constructor() {
	}

	async getComponentsAsync(methodId: any): Promise<Object> {
		try {
			for (let i = 0; i < 10000000; i++) {

			}
			if (methodId == '1' || methodId == '3' || methodId == '5') {
				return (await this.compsData);
			}
			else {
				return (await this.compsData2);
			}
		}
		catch (error) {
			throw this.handleError(error);
		}
	}

	private handleError(error: any) {
		let msg = (error.message)
			? error.message
			: error.status ? `${error.status} - ${error.statusText}` : error;

		console.error(msg);
		return msg;
	}

	compsData =
		{

			"columns": [
				{
					"index": 0,
					"className": "MethodComponent",
					"name": "Name",
					"description": null,
					"dataType": 0,
					"bindingKey": "name",
					"displayName": "Component Name",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": null,
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				},
				{
					"index": 1,
					"className": "MethodComponent",
					"name": "Type",
					"description": null,
					"dataType": 5,
					"bindingKey": "type",
					"displayName": "Component Type",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": [
						{
							"name": "None",
							"value": 0,
							"displayName": "None",
							"shortName": null,
							"additionalInformation": null
						},
						{
							"name": "Target",
							"value": 1,
							"displayName": "Target",
							"shortName": null,
							"additionalInformation": null
						},
						{
							"name": "Unknown",
							"value": 2,
							"displayName": "Unknown",
							"shortName": null,
							"additionalInformation": null
						},
						{
							"name": "Unknown",
							"value": 3,
							"displayName": "Candidate",
							"shortName": null,
							"additionalInformation": null
						},
						{
							"name": "Unknown",
							"value": 4,
							"displayName": "Timed Group",
							"shortName": null,
							"additionalInformation": null
						},
						{
							"name": "NamedGroup",
							"value": 5,
							"displayName": "Named Group",
							"shortName": null,
							"additionalInformation": null
						}
					],
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				},
				{
					"index": 2,
					"className": "MethodComponent",
					"name": "Label",
					"description": null,
					"dataType": 0,
					"bindingKey": "label",
					"displayName": "Label",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": null,
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				},
				{
					"index": 3,
					"className": "MethodComponent",
					"name": "Description",
					"description": null,
					"dataType": 0,
					"bindingKey": "description",
					"displayName": "Description",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": null,
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				},
				{
					"index": 4,
					"className": "MethodComponent",
					"name": "ExpectedRT",
					"description": null,
					"dataType": 1,
					"bindingKey": "expectedRetTime",
					"displayName": "Expected RT",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": null,
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				},
				{
					"index": 5,
					"className": "MethodComponent",
					"name": "IsInternalStandard",
					"description": null,
					"dataType": 7,
					"bindingKey": "isInternalStd",
					"displayName": "Is internal standard?",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": null,
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				},
				{
					"index": 6,
					"className": "MethodComponent",
					"name": "UseInternalStandard",
					"description": null,
					"dataType": 3,
					"bindingKey": "useInternalStd",
					"displayName": "Use internal standard",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": null,
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				},
				{
					"index": 7,
					"className": "MethodComponent",
					"name": "ExpectedWavelength",
					"description": null,
					"dataType": 1,
					"bindingKey": "expectedWavelength",
					"displayName": "Expected wavelength",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": null,
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				},
				{
					"index": 8,
					"className": "MethodComponent",
					"name": "ExpectedMass",
					"description": null,
					"dataType": 1,
					"bindingKey": "expectedMass",
					"displayName": "Expected mass",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": null,
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				},
				{
					"index": 9,
					"className": "MethodComponent",
					"name": "ChannelName",
					"description": null,
					"dataType": 0,
					"bindingKey": "channelName",
					"displayName": "Channel Name",
					"shortName": null,
					"tooltip": null,
					"minValue": null,
					"maxValue": null,
					"maxWidth": 0,
					"decimalPlaces": 0,
					"units": null,
					"enumerations": null,
					"allowScientificNotation": false,
					"allowMultiples": false,
					"allowUnrestricted": false,
					"isRequired": false,
					"stage": 0,
					"visible": true,
					"metaData": null
				}
			],
			"data": [
				{
					"id": "294e50b039e04bbd9392e5746216d844",
					"name": "comp3",
					"type": 1,
					"label": null,
					"expectedRetTime": 1,
					"expectedWavelength": null,
					"expectedMass": null,
					"isInternalStd": false,
					"useInternalStd": "",
					"description": null,
					"channelName": "",
					"error": null,
					"customFields": {}
				},
				{
					"id": "31ad30e878674473b839ed863c1f55cf",
					"name": "comp2",
					"type": 1,
					"label": "",
					"expectedRetTime": 1,
					"expectedWavelength": null,
					"expectedMass": null,
					"isInternalStd": false,
					"useInternalStd": "",
					"description": "",
					"channelName": "",
					"error": null,
					"customFields": {}
				}
			],
			"globalFields": [],
			"customFields": {}
		}

	compsData2 =
		{
			'columns': [
				{
					'id': 0,
					'bindingKey': 'name',
					'label': 'Name'
				},
				{
					'id': 1,
					'bindingKey': 'label',
					'label': 'Label'
				},
				{
					'id': 2,
					'bindingKey': 'expectedRetTime',
					'label': 'Expected RT'
				},
				{
					'id': 3,
					'bindingKey': 'expectedWavelength',
					'label': 'Expected Wavelength'
				},
				{
					'id': 4,
					'bindingKey': 'description',
					'label': 'Description'
				}
			],
			'data': [
				{
					'id': 1,
					'name': 'Comp1',
					'label': 'Label1111',
					'expectedRetTime': 1.1111,
					'expectedWavelength': 1.11111,
					'description': 'Description of Comp11111111'
				},
				{
					'id': 2,
					'name': 'Comp2',
					'label': 'Label222222',
					'expectedRetTime': 2.22222,
					'expectedWavelength': 2.2222,
					'description': 'Description of Comp22222'
				},
				{
					'id': 3,
					'name': 'Comp3',
					'label': 'Label3333',
					'expectedRetTime': 3.33333,
					'expectedWavelength': 3.3333,
					'description': 'Description of Comp3333'
				},
				{
					'id': 4,
					'name': 'Comp4',
					'label': 'Label4444',
					'expectedRetTime': 4.4444,
					'expectedWavelength': 4.44444,
					'description': 'Description of Comp4444'
				},
				{
					'id': 5,
					'name': 'Comp5',
					'label': 'Label5555',
					'expectedRetTime': 5.5555,
					'expectedWavelength': 5.55555,
					'description': 'Description of Comp5555'
				},
				{
					'id': 6,
					'name': 'Comp6',
					'label': 'Label6666',
					'expectedRetTime': 6.6666,
					'expectedWavelength': 6.6666,
					'description': 'Description of Comp6666'
				}
			]
		}

}