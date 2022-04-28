import axios from 'axios';
import { Auth, Self, AuthTypes, Headers, Request } from './types/global';

export function populateAuthHeaders(auth: Auth, self: Self, bearerToken: string, headers?: Array<Headers>,): Array<Headers> {
    const newHeaders = [];
    if (headers) {
      newHeaders.push(...headers)
    }

    switch (auth.type) {
      case AuthTypes.BASIC:
          newHeaders.push({
          key: 'Authorization',
          value: `"Basic ${Buffer.from(
            `${auth.basic?.username}:${auth.basic?.password}`,
            'utf8',
          ).toString('base64')}"`,
        });
        break;

      case AuthTypes.API_KEY:
          newHeaders.push({
          key: auth.apiKey?.headerName,
          value: auth.apiKey?.headerValue,
        });
        break;

      case AuthTypes.OAUTH2:
        self.logger.trace('auth = %j', auth);
        newHeaders.push({
          key: 'Authorization',
          value: `"Bearer ${bearerToken}"`,
        });
        break;

      default:
    }

    return newHeaders
}

export const makeRequest = async (self: Self, request: Request) => {
  const { body, headers, url } = request;
  self.logger.debug(`body before request: ${body}`);
  self.logger.debug(`headers before request: ${headers}`);
  try {
    const { data } = await axios.post(url, body, {
        headers: headers
    });

    await self.emit('data', { data });
    await self.emit('end');
} catch (e) {
    self.logger.info('Error while making request to GraphQL API: ', (e as Error).message);
    await self.emit('error', e);
    await self.emit('end');
} }