import { Signal } from '@lit-labs/preact-signals';
import { createContext } from '@lit/context';
import { VariableDeclaration } from '../internal/variables';

export type ItemContext = ReadonlyArray<VariableDeclaration<string | string[]>>;

export const itemContextVariables = [
  {
    identifier: 'completionStatus',
    cardinality: 'single',
    baseType: 'string',
    value: 'unknown',
    type: 'outcome'
  },
  {
    identifier: 'numAttempts',
    cardinality: 'single',
    baseType: 'integer',
    value: '0',
    type: 'outcome'
  }
] as VariableDeclaration<string | string[]>[];

export const itemContext = createContext<Signal<ItemContext>>(Symbol('itemContext'));
