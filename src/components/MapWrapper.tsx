'use client';

import dynamic from 'next/dynamic';

const SafetyMap = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Safety Map...</div>
});

export default SafetyMap;
