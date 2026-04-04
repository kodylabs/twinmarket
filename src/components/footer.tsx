import Link from 'next/link';

export function Footer() {
  return (
    <footer className='w-full py-8 mt-auto bg-[#0f131d] border-t border-[#434655]/20'>
      <div className='flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6 md:gap-0'>
        <span className='font-label uppercase text-[10px] tracking-widest text-[#c3c6d7]'>
          © {new Date().getFullYear()} twinmarket. Operational.
        </span>
        <div className='flex gap-8'>
          <Link
            href='#'
            className='font-label uppercase text-[10px] tracking-widest text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors'
          >
            Network Status
          </Link>
          <Link
            href='#'
            className='font-label uppercase text-[10px] tracking-widest text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors'
          >
            Terms
          </Link>
          <Link
            href='#'
            className='font-label uppercase text-[10px] tracking-widest text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors'
          >
            Privacy
          </Link>
          <Link
            href='#'
            className='font-label uppercase text-[10px] tracking-widest text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors'
          >
            Health
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
          <span className='font-label uppercase text-[10px] tracking-widest text-primary'>Protocol Online</span>
        </div>
      </div>
    </footer>
  );
}
