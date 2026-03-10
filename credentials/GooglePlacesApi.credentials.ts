import type { ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class GooglePlacesApi implements ICredentialType {
	name = 'googlePlacesApi';

	displayName = 'Google Places API';

	documentationUrl = 'https://developers.google.com/maps/documentation/places/web-service/text-search';

	icon: Icon = {
		light: 'file:RoguePlacesV2.svg',
		dark: 'file:RoguePlacesV2.dark.svg',
	};

	test = {
		request: {
			baseURL: 'https://places.googleapis.com',
			url: '/v1/places:searchText',
			method: 'POST' as const,
			headers: {
				'X-Goog-FieldMask': 'places.displayName',
			},
			body: {
				textQuery: 'coffee',
			},
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
	];
}