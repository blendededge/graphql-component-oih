import * as uuid from 'uuid';
import { GenericObject, Message } from './types/global';

export function newMessage(data: GenericObject, attachments?: GenericObject): Message {
  const msg: Message = {
    id: uuid.v4(),
    attachments: attachments || {},
    headers: {},
    metadata: {},
    data
  };

  return msg;
}

module.exports = {
  newMessage,
};
