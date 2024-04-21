export interface IInteraction {
  disabled: boolean;
  readonly: boolean;
  response: string | string[] | undefined;
  reset();
  validate(): boolean;
}
