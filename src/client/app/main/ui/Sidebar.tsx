'use client';
import { useEffect, useState, useRef } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar({ open }: { open: boolean }) {
  const [openCalibration, setOpenCalibration] = useState(false);

  const [showChlorineModal, setShowChlorineModal] = useState(false);
  const [showPhosphateModal, setShowPhosphateModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const tokenString = localStorage.getItem('PoolWatchtoken');
    if (tokenString == null) {
      redirect('/');
    }
  }, []);

  useEffect(() => {
    if ((showChlorineModal || showPhosphateModal) && typeof window !== 'undefined') {
      setModalPos({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
  }, [showChlorineModal, showPhosphateModal]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isDragging) return;
      setModalPos({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      });
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      <aside
        aria-label="Sidebar"className={`fixed top-0 left-0 z-40 h-screen w-64 transform bg-gray-800 text-white transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-gray-700 px-4">
          <img src="/Logo.png"alt="Group 4 Logo"className="h-7 w-7 rounded-lg object-cover bg-white"/>
          <span className="text-xl font-bold">Group 4</span>
        </div>
        <nav className="mt-6 px-2">
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                onClick={() => setOpenCalibration((prev) => !prev)}
                aria-expanded={openCalibration}
                aria-controls="section-calibration"className="flex w-full items-center justify-between rounded px-3 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800">
                <span>Calibration Curves</span>
                <svg className={`h-4 w-4 transition-transform ${openCalibration ? 'rotate-180' : ''}`}viewBox="0 0 24 24"fill="none"stroke="currentColor"aria-hidden="true">
                  <path d="M6 9l6 6 6-6"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
                </svg>
              </button>
              {openCalibration && (
                <ul id="section-calibration" className="mt-1 space-y-1 pl-4">
                  <li className="rounded-lg">
                    <button type="button"onClick={() => setShowChlorineModal(true)}className="flex w-full items-center justify-between rounded px-3 py-2 text-sm hover:bg-gray-700">
                      <span className="truncate">Chlorine</span>
                    </button>
                  </li>
                  <li className="rounded-lg">
                    <button type="button"onClick={() => setShowPhosphateModal(true)}className="flex w-full items-center justify-between rounded px-3 py-2 text-sm hover:bg-gray-700">
                      <span className="truncate">Phosphate</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
            <li><Link href="/main/AboutUs"className="block rounded px-3 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800">Contact</Link></li>
          </ul>
        </nav>
      </aside>
      {showChlorineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40"onClick={() => setShowChlorineModal(false)}/>
          <div className="absolute w-[500px] rounded-lg bg-white shadow-lg"style={{top: modalPos.y,left: modalPos.x,transform: 'translate(-50%, -50%)',}}>
            <div className="flex cursor-move items-center justify-between border-b bg-gray-100 px-4 py-2"
              onMouseDown={(e) => {setIsDragging(true);dragOffsetRef.current = {x: e.clientX - modalPos.x,y: e.clientY - modalPos.y,};}}>
              <span className="font-semibold text-gray-800">Chlorine Calibration</span>
              <button type="button"className="text-gray-500 hover:text-gray-700"onClick={() => setShowChlorineModal(false)}>✕</button>
            </div>
            <div className="p-4"><img src="/LineGraph.png"alt="Chlorine Calibration Curve"className="h-auto w-full"/>
            </div>
          </div>
        </div>
      )}
      {showPhosphateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40"onClick={() => setShowPhosphateModal(false)}/>
          <div className="absolute w-[500px] rounded-lg bg-white shadow-lg"style={{top: modalPos.y,left: modalPos.x,transform: 'translate(-50%, -50%)',}}>
            <div className="flex cursor-move items-center justify-between border-b bg-gray-100 px-4 py-2"
              onMouseDown={(e) => {setIsDragging(true);dragOffsetRef.current = {x: e.clientX - modalPos.x,y: e.clientY - modalPos.y,};}}>
              <span className="font-semibold text-gray-800">Phosphate Calibration</span>
              <button type="button"className="text-gray-500 hover:text-gray-700"onClick={() => setShowPhosphateModal(false)}>✕</button>
            </div>
            <div className="p-4"><img src="/LineGraph.png"alt="Phosphate Calibration Curve"className="h-auto w-full"/></div>
          </div>
        </div>
      )}
    </>
  );
}
