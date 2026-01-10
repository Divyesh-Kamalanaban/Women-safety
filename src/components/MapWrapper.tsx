'use client';

import dynamic from 'next/dynamic';

const SafetyMap = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Safety Map...</div>
});

export default SafetyMap;
