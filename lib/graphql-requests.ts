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
    const { headers, url } = cfg;

    const { auth } = getAuthFromSecretConfig(cfg, self);
    const bearerToken = (auth && auth.oauth2 && auth.oauth2.keys && auth.oauth2.keys.access_token ? auth.oauth2.keys.access_token : '');

    const requestHeaders = createRequestHeaders(self, bearerToken, auth, headers);
    const requestUrl = transform(msg, { customMapping: url });
    self.logger.info('url: ', requestUrl)

    return { requestHeaders, requestUrl };
}

export const createQueryString = (self: Self, msg: Message, query: string): string => {
    const transformedQuery = transform(msg, { customMapping: query });
    self.logger.info('transformed Query string: ', transformedQuery);
    return JSON.stringify({ [Actions.QUERY]: transformedQuery });
}

export const createMutateString = (self: Self, msg: Message, cfg: Config): string => {
    const { query, variables } = cfg;
    const transformedMutate = transform(msg, { customMapping: query });

    self.logger.info('transformed Mutate string: ', transformedMutate);
    if (!variables) {
        return JSON.stringify({ [Actions.QUERY]: transformedMutate });
    }
    const transformedVariables = transform(msg, { customMapping: variables });
    self.logger.info('transformed Variables ', transformedVariables);
    return JSON.stringify({ [Actions.QUERY]: transformedMutate, [VARIABLES]: transformedVariables });
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