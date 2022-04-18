import axios from 'axios';
import { createGraphQLRequest } from './graphql-requests';
import { newMessage } from './messages';
import { Config, GenericObject, Message, Self } from './types/global';

export async function processMethod(self: Self, msg: Message, cfg: Config, snapshot?: GenericObject) {
    const { requestBody, requestHeaders, requestUrl } = createGraphQLRequest(msg, cfg, self);

    try {
        const { data } = await axios.post(requestUrl, requestBody, {
            headers: requestHeaders
        });

        const msg = newMessage(data);
        await self.emit('data', msg);
        await self.emit('end');
    } catch (e) {
        self.logger.info('Error while making request to GraphQL API: ', (e as Error).message);
        await self.emit('error', e);
        await self.emit('end');
    }
}