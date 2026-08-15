import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  ownerSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  responderSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  medicalPayload(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  commitRandomness(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  authorizeResponder(context: __compactRuntime.CircuitContext<PS>,
                     responderPk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeResponder(context: __compactRuntime.CircuitContext<PS>,
                  responderPk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  requestAccess(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  revokeRecord(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  authorizeResponder(context: __compactRuntime.CircuitContext<PS>,
                     responderPk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeResponder(context: __compactRuntime.CircuitContext<PS>,
                  responderPk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  requestAccess(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  revokeRecord(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  authorizeResponder(context: __compactRuntime.CircuitContext<PS>,
                     responderPk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeResponder(context: __compactRuntime.CircuitContext<PS>,
                  responderPk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  requestAccess(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  revokeRecord(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly owner: Uint8Array;
  readonly recordCommitment: Uint8Array;
  readonly state: number;
  readonly accessCount: bigint;
  readonly round: bigint;
  authorizedKeys: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               ownerSk_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
