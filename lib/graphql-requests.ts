import { AxiosRequestHeaders } from 'axios';
import { populateAuthHeaders } from './http';
import { getAuthFromSecretConfig } from './secret';
import { Auth, Config, Self, Headers, Message } from './types/global';
import { transform } from '@openintegrationhub/ferryman';

enum Actions {
    QUERY = 'query',
    MUTATE = 'mutate'
}

const VARIABLES = 'variables';

export const createGraphQLRequest = (msg: Message, cfg: Config, self: Self) => {
    const { action, body, headers, url } = cfg;
    const requestBody = createRequestString(action, body, msg, self, cfg);
    self.logger.info('requestBody: ', requestBody)

    const { auth } = getAuthFromSecretConfig(cfg, self);
    const bearerToken = (auth && auth.oauth2 && auth.oauth2.keys && auth.oauth2.keys.access_token ? auth.oauth2.keys.access_token : '');

    const requestHeaders = createRequestHeaders(self, bearerToken, auth, headers);
    const requestUrl = transform(msg, { customMapping: url });
    self.logger.info('url: ', requestUrl)

    return { requestBody, requestHeaders, requestUrl };
}

const createRequestString = (action: string, body: string, msg: Message, self: Self, cfg: Config) => {
    const transformedBody = transform(msg, { customMapping: body });
    self.logger.info('transformed Body: ', transformedBody);

    if (action === Actions.QUERY) {
        return JSON.stringify({ [Actions.QUERY]: transformedBody });
    } else if (action === Actions.MUTATE) {
        return JSON.stringify({
            [Actions.QUERY]: transformedBody,
            [VARIABLES]: cfg.variables
        });
    } else {
        throw new Error(`Unsupported action provided: ${action}`);
    }

}

const createRequestHeaders = (self: Self, bearerToken: string, auth?: Auth, headers?: Headers[]) => {
    let requestHeaders: Headers[] = [];
    if (auth) {
        requestHeaders = populateAuthHeaders(auth, self, bearerToken, headers);
    }

    requestHeaders.push(
        {
            key: 'content-type',
            value: 'application/json'
        }
    );
    self.logger.info('request headers: ', requestHeaders);
    return formatHeaders(requestHeaders);
}

function formatHeaders(requestHeaders: Headers[]) {
    const formattedHeaders: AxiosRequestHeaders = {};
    if (requestHeaders && requestHeaders.length) {
      requestHeaders.forEach(header => {
        if (!header.key || !header.value) {
          return;
        }
        formattedHeaders[header.key.toLowerCase()] = header.value;
      })
    }
    return formattedHeaders
}