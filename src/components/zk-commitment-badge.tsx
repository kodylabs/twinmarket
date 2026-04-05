import { ExternalLink, Fingerprint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function ZkCommitmentBadge({ commitment, ensName }: { commitment: string; ensName: string }) {
  return (
    <a
      href={`https://sepolia.app.ens.domains/${ensName}?tab=records`}
      target='_blank'
      rel='noopener noreferrer'
      className='text-muted-foreground hover:text-foreground'
    >
      <Badge variant='outline' className='gap-1 text-xs'>
        <Fingerprint className='size-3' />
        ZK Committed
        <span className='font-mono text-muted-foreground'>{truncateHash(commitment)}</span>
        <ExternalLink className='size-3' />
      </Badge>
    </a>
  );
}
