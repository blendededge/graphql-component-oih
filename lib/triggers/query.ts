/* eslint-disable @typescript-eslint/no-this-alias */
import { IncomingHeaders, Snapshot, TokenData } from '@blendededge/ferryman-extensions/lib/ferryman-types';
import { createGraphQLRequest, createQueryString } from '../graphql-requests';
import { makeRequest } from '../http';
import { Config, Message, Self } from '../types/global';
import { wrapper } from '@blendededge/ferryman-extensions';

async function processTrigger(this: Self, msg: Message, cfg: Config, snapshot: Snapshot, headers: IncomingHeaders, tokenData: TokenData): Promise<void> {
    let self = this;
    try {
        self = await wrapper(this, msg, cfg, snapshot, headers, tokenData);
        self.logger.debug('msg: ', JSON.stringify(msg));
        self.logger.debug('cfg: ', JSON.stringify(cfg));
        self.logger.debug('snapshot :', JSON.stringify(snapshot));

        const requestBody = createQueryString(self, msg, cfg);

        const { requestHeaders, requestUrl } = createGraphQLRequest(msg, cfg, self);

        const httpReboundErrorCodes = cfg?.httpReboundErrorCodes;
        const enableRebound = cfg?.enableRebound || false;
        const dontThrowErrorFlg = cfg?.dontThrowErrorFlg || false;
        const errorHandlingConfig = cfg?.errorHandling;

        await makeRequest(self, { headers: requestHeaders, url: requestUrl, body: requestBody }, httpReboundErrorCodes, enableRebound, dontThrowErrorFlg, undefined, errorHandlingConfig);
    } catch (e) {
        self.emit('error', e);
        self.logger.error(`Error while processing trigger: ${e}`);
    }
}

exports.process = processTrigger;