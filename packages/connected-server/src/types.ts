export type SerializableValue =
  null | string | number | boolean | Date |
  { [key: string]: SerializableValue } |
  SerializableValue[];

export type ServerOptions = {
  dir?: string;
  root?: string;
  pattern?: string;
  ignore?: string;
  handlers?: IHandler[];
};

type IncommingMessage = import('http').IncomingMessage;
type ServerResponse = import('http').ServerResponse;

export interface IHandler {
  process(
    request: IncommingMessage,
    response: ServerResponse,
    invoke: (
      name: string,
      parameters: SerializableValue[],
      constructorParameters?: SerializableValue[]) => Promise<SerializableValue>,
    ): Promise<void>;

  canHandle(request: IncommingMessage): boolean;
}

export interface IServer {
  process(request: Request, response: Response): Promise<void>;
  build(): Promise<void>;
}

export type Callable = {
  fn: Function;
  name: string;
  property?: string;
  file?: string;
};

// export type NextFunction = (error?: any) => void;
//
// export type Request = {
//   name: string;
//   parameters: SerializableValue[];
//   constructorParameters?: SerializableValue[];
// };
//
// export type Response = {
//   result: SerializableValue;
// };
