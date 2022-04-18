/* eslint-disable @typescript-eslint/no-this-alias */
import { processMethod } from '../process';
import { Config, GenericObject, Message, Self } from '../types/global';

async function processTrigger(this: Self, msg: Message, cfg: Config, snapshot: GenericObject): Promise<void> {
    const self = this;
    self.logger.debug('msg: ', msg);
    self.logger.debug('cfg: ', cfg);
    self.logger.debug('snapshot :', snapshot);

    return await processMethod(self, msg, cfg, snapshot);
}

exports.process = processTrigger;