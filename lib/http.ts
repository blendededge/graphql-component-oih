import { Auth, Self, AuthTypes, Headers } from './types/global';

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
