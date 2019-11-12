export type SerializableValue =
  null | string | number | boolean | Date |
  { [key: string]: SerializableValue } |
  SerializableValue[];

export type NextFunction = (error?: any) => void;

export type Request = {
  name: string;
  parameters: SerializableValue[];
  constructorParameters?: SerializableValue[];
};

export type Response = {
  result: SerializableValue;
};
