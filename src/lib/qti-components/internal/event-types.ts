import type { ResponseInteraction } from './expression-result';

export interface OutcomeChangedDetails {
  outcomeIdentifier: string;
  value: string | string[];
}
export type InteractionChangedDetails = ResponseInteraction & { item: string };

export interface ResponseChangedDetails {
  responseIdentifier: string;
  value: string | string[];
}
