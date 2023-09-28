/* eslint-disable @typescript-eslint/no-this-alias */
import { createGraphQLRequest, createMutateString } from '../graphql-requests';
import { makeRequest } from '../http';
import { wrapper } from '@blendededge/ferryman-extensions';
import { Config, GenericObject, Message, Self } from '../types/global';

async function processAction(this: Self, msg: Message, cfg: Config, snapshot: GenericObject): Promise<void> {
    const self = wrapper(this, msg, cfg, snapshot);
    self.logger.debug('msg: ', JSON.stringify(msg));
    self.logger.debug('cfg: ', JSON.stringify(cfg));
    self.logger.debug('snapshot :', JSON.stringify(snapshot));
1
    const requestBody = createMutateString(self, msg, cfg);

    const { requestHeaders, requestUrl } = createGraphQLRequest(msg, cfg, self);

    await makeRequest(self, { headers: requestHeaders, url: requestUrl, body: requestBody });
}

exports.process = processAction;