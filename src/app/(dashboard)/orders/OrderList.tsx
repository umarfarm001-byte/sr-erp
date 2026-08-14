"use client";

import { useState, useEffect } from 'react';
import OrderActions from './OrderActions';
import ZoomableImage from '@/components/ui/ZoomableImage';

export default function OrderList({ initialArticles }: { initialArticles: any[] }) {
  const [role, setRole] = useState('admin');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setRole(localStorage.getItem('erp_role') || 'admin');
  }, []);

  if (!isClient) return <div className="text-center p-8 text-slate-500">Loading...</div>;

  const articles = (role === 'admin' || role === 'director') 
    ? initialArticles 
    : initialArticles.filter(article => {
        const ops = article.operations || [];
        return ops.some((op: any) => op.assignedUserId === role);
      });

  return (
    <div className="space-y-4">
      {articles.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
          No assigned orders found.
        </div>
      ) : (
        articles.map((article: any) => {
          let photoUrl = null;
          if (article.photos) {
            try {
              const photosArray = JSON.parse(article.photos);
              if (photosArray.length > 0) {
                photoUrl = photosArray[0];
              }
            } catch (e) {
              // ignore
            }
          }

          const ops = article.operations || [];
          const totalOps = ops.length;
          const completedOps = ops.filter((o: any) => o.status === 'done').length;
          const progress = totalOps > 0 ? Math.round((completedOps / totalOps) * 100) : 0;
          const currentStep = ops.find((o: any) => o.status !== 'done')?.name || 'All Steps Completed';

          return (
            <div key={article.id} className="group flex flex-col md:flex-row items-center p-4 bg-white hover:bg-blue-50/30 border border-slate-200 hover:border-blue-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              
              {/* Image */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
                {photoUrl ? (
                  <ZoomableImage src={photoUrl} alt="Article" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase">No Photo</span>
                )}
              </div>
              
              {/* Article Info */}
              <div className="mt-4 md:mt-0 md:ml-6 flex-1 flex flex-col justify-center text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                  <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider bg-blue-100/50 px-2 py-0.5 rounded">{article.serial}</span>
                  {article.deliveryDate && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">Due: {article.deliveryDate}</span>}
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{article.articleName}</div>
                <div className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{article.party} &bull; {article.sampleType || 'Complete Shoe'}</div>
              </div>

              {/* Progress Bar */}
              <div className="w-full md:w-1/3 mt-4 md:mt-0 md:px-8">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Progress</div>
                  <div className="text-sm font-black text-slate-700">{progress}%</div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000" style={{width: `${progress}%`}}></div>
                </div>
                <div className="mt-2 text-sm font-bold text-slate-800 truncate flex items-center gap-2">
                  {progress === 100 ? <span className="w-2 h-2 rounded-full bg-emerald-500"></span> : <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                  {currentStep}
                </div>
              </div>

              {/* Action Button */}
              <OrderActions articleId={article.id} />

            </div>
          );
        })
      )}
    </div>
  );
}
