export default function HomePage() {
  return (
    <div className='flex min-h-[calc(100vh-3.5rem)] items-center justify-center'>
      <div className='max-w-md space-y-6 text-center'>
        <h1 className='text-4xl font-bold tracking-tight'>twinmarket</h1>
        <p className='text-lg text-muted-foreground'>Monetize your expertise through your AI digital twin.</p>

        <div className='space-y-3 rounded-lg border bg-card p-6 text-left text-sm'>
          <p className='text-muted-foreground'>Connect your wallet to create your twin and start earning.</p>
          <p className='text-muted-foreground'>One human, one twin &mdash; verified with World ID.</p>
        </div>
      </div>
    </div>
  );
}
