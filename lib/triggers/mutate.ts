/* eslint-disable @typescript-eslint/no-this-alias */
import { createGraphQLRequest, createMutateString } from '../graphql-requests';
import { makeRequest } from '../http';
import { Config, GenericObject, Message, Self } from '../types/global';
import { wrapper } from '@blendededge/ferryman-extensions';

async function processTrigger(this: Self, msg: Message, cfg: Config, snapshot: GenericObject): Promise<void> {
    const self = wrapper(this, msg, cfg, snapshot);
    self.logger.debug('msg: ', msg);
    self.logger.debug('cfg: ', cfg);
    self.logger.debug('snapshot :', snapshot);
1
    const requestBody = createMutateString(self, msg, cfg);

    const { requestHeaders, requestUrl } = createGraphQLRequest(msg, cfg, self);

    await makeRequest(self, { headers: requestHeaders, url: requestUrl, body: requestBody });
}

exports.process = processTrigger;