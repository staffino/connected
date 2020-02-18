import { IExecutor } from './executor/types';

export type SerializableValue =
  null | string | number | boolean | Date |
  { [key: string]: SerializableValue } |
  SerializableValue[];

type IncommingMessage = import('http').IncomingMessage;
type ServerResponse = import('http').ServerResponse;

export interface IHandler {
  process(
    request: IncommingMessage,
    response: ServerResponse,
    executor: IExecutor,
    ): Promise<void>;

  canHandle(request: IncommingMessage): boolean;
}

export { IExecutor };
