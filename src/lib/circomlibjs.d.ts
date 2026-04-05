declare module 'circomlibjs' {
  interface PoseidonField {
    toObject(el: unknown): bigint;
    toString(el: unknown, radix?: number): string;
  }

  interface Poseidon {
    (inputs: bigint[]): unknown;
    F: PoseidonField;
  }

  export function buildPoseidon(): Promise<Poseidon>;
}
