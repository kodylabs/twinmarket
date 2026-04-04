'use client';

import { createWorldBridgeStore } from '@worldcoin/idkit-core';
import { solidityEncode } from '@worldcoin/idkit-core/hashing';
import { useCallback, useRef, useState } from 'react';

const APP_ID = 'app_a7c3e2b6b83927251a0db5345bd7146a';
const ACTION = 'agentbook-registration';
const POLL_INTERVAL = 2000;
const TIMEOUT = 300_000;

export type BridgeStatus = 'idle' | 'connecting' | 'waiting' | 'verified' | 'error';

export interface BridgeResult {
  merkleRoot: string;
  nullifierHash: string;
  proof: string;
}

export function useAgentBookBridge() {
  const [status, setStatus] = useState<BridgeStatus>('idle');
  const [connectorURI, setConnectorURI] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const start = useCallback(async (agentAddress: string, nonce: string): Promise<BridgeResult> => {
    abortRef.current = false;
    setStatus('connecting');
    setError(null);
    setConnectorURI(null);

    const signal = solidityEncode(['address', 'uint256'], [agentAddress, BigInt(nonce)]);
    const worldID = createWorldBridgeStore();

    await worldID.getState().createClient({ app_id: APP_ID, action: ACTION, signal });

    const uri = worldID.getState().connectorURI;
    if (!uri) throw new Error('Failed to create bridge session');

    setConnectorURI(uri);
    setStatus('waiting');

    const deadline = Date.now() + TIMEOUT;

    while (!abortRef.current && Date.now() < deadline) {
      await worldID.getState().pollForUpdates();
      const { result, errorCode } = worldID.getState();

      if (errorCode) {
        setStatus('error');
        setError(errorCode);
        throw new Error(errorCode);
      }

      if (result) {
        const bridgeResult: BridgeResult = {
          merkleRoot: result.merkle_root,
          nullifierHash: result.nullifier_hash,
          proof: result.proof,
        };
        setStatus('verified');
        return bridgeResult;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }

    const msg = abortRef.current ? 'Cancelled' : 'Verification timed out';
    setStatus('error');
    setError(msg);
    throw new Error(msg);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { status, connectorURI, error, start, cancel };
}
