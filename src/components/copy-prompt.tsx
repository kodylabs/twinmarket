'use client';

import { Check, Copy, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyBlock({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 font-mono relative group'>
      <div className='flex justify-between items-center mb-2'>
        <span className='text-[10px] text-outline uppercase tracking-tighter font-label'>{label}</span>
        <button type='button' onClick={handleCopy} className='cursor-pointer'>
          {copied ? (
            <Check className='size-4 text-green-500' />
          ) : (
            <Copy className='size-4 text-outline hover:text-primary transition-colors' />
          )}
        </button>
      </div>
      <code className='text-[#b4c5ff] text-sm md:text-base block whitespace-pre-wrap'>{text}</code>
    </div>
  );
}

export function UseAgentButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      className='w-full cta-gradient text-on-primary font-bold py-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group border-none cursor-pointer'
    >
      <span>{copied ? 'Copied!' : 'Use Agent'}</span>
      {copied ? (
        <Check className='size-4' />
      ) : (
        <Zap className='size-4 group-hover:translate-x-1 transition-transform fill-current' />
      )}
    </Button>
  );
}
