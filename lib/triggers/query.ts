/* eslint-disable @typescript-eslint/no-this-alias */
import { createGraphQLRequest, createQueryString } from '../graphql-requests';
import { makeRequest } from '../http';
import { Config, GenericObject, Message, Self } from '../types/global';

async function processTrigger(this: Self, msg: Message, cfg: Config, snapshot: GenericObject): Promise<void> {
    const self = this;
    self.logger.debug('msg: ', msg);
    self.logger.debug('cfg: ', cfg);
    self.logger.debug('snapshot :', snapshot);

    const requestBody = createQueryString(self, msg, cfg.query);

    const { requestHeaders, requestUrl } = createGraphQLRequest(msg, cfg, self);

    await makeRequest(self, { headers: requestHeaders, url: requestUrl, body: requestBody });
}

exports.process = processTrigger;