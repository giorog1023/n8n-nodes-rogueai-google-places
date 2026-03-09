import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes } from 'n8n-workflow';

export class GooglePlaces implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Google Places',
		name: 'googlePlaces',
		icon: 'file:GooglePlaces.svg',
		group: ['input'],
		version: 1,
		description: 'Search places using Google Places Text Search',
		defaults: {
			name: 'Google Places',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'googlePlacesApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Search Text',
				name: 'searchText',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'physiotherapists in London',
				description: 'The text query to search for places',
			},
			{
				displayName: 'Field Mask',
				name: 'fieldMask',
				type: 'string',
				default: 'places.displayName,places.formattedAddress,places.location,places.googleMapsUri',
				required: true,
				description: 'Comma-separated response fields to return',
			},
			{
				displayName: 'Max Result Count',
				name: 'maxResultCount',
				type: 'number',
				default: 10,
				description: 'Maximum number of places to return',
			},
			{
				displayName: 'Language Code',
				name: 'languageCode',
				type: 'string',
				default: 'en',
				description: 'Language for returned results',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('googlePlacesApi');
		const apiKey = credentials.apiKey as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const searchText = this.getNodeParameter('searchText', itemIndex) as string;
				const fieldMask = this.getNodeParameter('fieldMask', itemIndex) as string;
				const maxResultCount = this.getNodeParameter('maxResultCount', itemIndex) as number;
				const languageCode = this.getNodeParameter('languageCode', itemIndex) as string;

				const options: IHttpRequestOptions = {
					method: 'POST',
					url: 'https://places.googleapis.com/v1/places:searchText',
					headers: {
						'Content-Type': 'application/json',
						'X-Goog-Api-Key': apiKey,
						'X-Goog-FieldMask': fieldMask,
					},
					body: {
						textQuery: searchText,
						maxResultCount,
						languageCode,
					},
				};

				const response = (await this.helpers.httpRequest(options)) as IDataObject;

				const places = (response.places as IDataObject[]) || [];

				for (const place of places) {
					returnData.push({
						json: place,
						pairedItem: { item: itemIndex },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				throw new NodeApiError(this.getNode(), error as JsonObject, {
					itemIndex,
				});
			}
		}

		return [returnData];
	}
}