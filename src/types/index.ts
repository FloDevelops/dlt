type ValidationEnum = {
  type: "enum";
  values: string[];
};

type ValidationRegex = {
  type: "regex";
  pattern: string;
};

type ValidationGreaterThan = {
  type: "greaterThan";
  value: number;
};

type ValidationGreaterThanOrEqual = {
  type: "greaterThanOrEqual";
  value: number;
};

type ValidationLessThan = {
  type: "lessThan";
  value: number;
};

type ValidationLessThanOrEqual = {
  type: "lessThanOrEqual";
  value: number;
};

type ValidationBetween = {
  type: "between";
  min: number;
  max: number;
};

type ParameterValidation = ValidationEnum | ValidationRegex | ValidationGreaterThan | ValidationGreaterThanOrEqual | ValidationLessThan | ValidationLessThanOrEqual | ValidationBetween;

export type Parameter = {
  name: string;
  type: string;
  description: string;
  example: string;
  validation: ParameterValidation;
};

export type Event = {
  name: string;
  description: string;
  screenshots: string[];
  parameters: string[];
};

export type File = {
  events?: Event[];
  parameters?: Parameter[];
};