'use client';

// idkit-core v2.1.0 (from @worldcoin/agentkit-cli) — types may conflict with v4 from @worldcoin/idkit
import { createWorldBridgeStore } from '@worldcoin/idkit-core';
import { solidityEncode } from '@worldcoin/idkit-core/hashing';
import { useCallback, useRef, useState } from 'react';

const APP_ID = 'app_a7c3e2b6b83927251a0db5345bd7146a';
const ACTION = 'agentbook-registration';

export type BridgeStatus = 'idle' | 'connecting' | 'waiting' | 'verified' | 'error';

export interface BridgeResult {
  merkleRoot: string;
  nullifierHash: string;
  proof: string;
}

export function useAgentBookBridge() {
  const [status, setStatus] = useState<BridgeStatus>('idle');
  const [connectorURI, setConnectorURI] = useState<string | null>(null);
  const [result, setResult] = useState<BridgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef(false);

  const start = useCallback(async (agentAddress: string, nonce: string) => {
    try {
      setStatus('connecting');
      setError(null);

      const signal = solidityEncode(['address', 'uint256'], [agentAddress, BigInt(nonce)]);

      const worldID = createWorldBridgeStore();
      await worldID.getState().createClient({
        app_id: APP_ID,
        action: ACTION,
        signal,
      });

      const uri = worldID.getState().connectorURI;
      if (!uri) {
        throw new Error('Failed to create bridge session');
      }

      setConnectorURI(uri);
      setStatus('waiting');

      // Start polling
      pollingRef.current = true;
      const deadline = Date.now() + 300_000; // 5 min timeout

      while (pollingRef.current && Date.now() < deadline) {
        await worldID.getState().pollForUpdates();
        const { result: proofResult, errorCode } = worldID.getState();

        if (errorCode) {
          setError(errorCode);
          setStatus('error');
          return;
        }

        if (proofResult) {
          setResult({
            merkleRoot: proofResult.merkle_root,
            nullifierHash: proofResult.nullifier_hash,
            proof: proofResult.proof,
          });
          setStatus('verified');
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (pollingRef.current) {
        setError('Verification timed out');
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bridge session failed');
      setStatus('error');
    }
  }, []);

  const stop = useCallback(() => {
    pollingRef.current = false;
  }, []);

  const reset = useCallback(() => {
    pollingRef.current = false;
    setStatus('idle');
    setConnectorURI(null);
    setResult(null);
    setError(null);
  }, []);

  return { status, connectorURI, result, error, start, stop, reset };
}
