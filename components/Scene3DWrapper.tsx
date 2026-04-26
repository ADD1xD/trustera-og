'use client';

import dynamic from 'next/dynamic';

const Trustera3DScene = dynamic(() => import('./Trustera3DScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />,
});

export default function Scene3DWrapper() {
  return <Trustera3DScene />;
}
