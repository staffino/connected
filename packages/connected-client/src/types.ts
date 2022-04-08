export type SerializableValue =
  | null
  | string
  | number
  | boolean
  | Date
  | { [key: string]: SerializableValue }
  | SerializableValue[];

export type NextFunction = (error?: unknown) => void;

export type Request = {
  name: string;
  group?: string;
  parameters: SerializableValue[];
  constructorParameters?: SerializableValue[];
};

export type Response = {
  result: SerializableValue;
};
