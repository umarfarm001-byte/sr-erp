const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', 'utf-8');

const targetStr =                   {(!op.photos || parseJSON(op.photos)?.length === 0) && isAssigned && (
                    <div className="mt-3">
                        <label className={\inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 cursor-pointer font-bold bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded border border-slate-200 transition-colors \\}>
                          {loadingStep === op.id ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Camera size={16} />} 
                          {loadingStep === op.id ? 'Uploading...' : 'Add Photos'}
                          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleDirectPhotoUpload(op.id, e.target.files)} disabled={loadingStep === op.id} />
                        </label>
                    </div>
                  )};

const newProgressUI = 
                  {(!op.photos || parseJSON(op.photos)?.length === 0) && isAssigned && (
                    <div className="mt-3">
                        <label className={\inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 cursor-pointer font-bold bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded border border-slate-200 transition-colors \\}>
                          {loadingStep === op.id ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Camera size={16} />} 
                          {loadingStep === op.id ? 'Uploading...' : 'Add Photos'}
                          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleDirectPhotoUpload(op.id, e.target.files)} disabled={loadingStep === op.id} />
                        </label>
                    </div>
                  )}

                  {isManufacturing && op.dailyProgresses && op.dailyProgresses.length > 0 && (
                    <div className="mt-4 bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between">
                        <span>Daily Progress Log</span>
                        {(() => {
                           const totalSubmitted = op.dailyProgresses.reduce((sum: number, p: any) => sum + p.pairs, 0);
                           const sizePairs = article.sizePairs ? parseJSON(article.sizePairs) : [];
                           const totalRequired = sizePairs.reduce((sum: number, sp: any) => sum + (parseInt(sp.pairs) || 0), 0);
                           const percent = totalRequired > 0 ? Math.min(100, Math.round((totalSubmitted / totalRequired) * 100)) : 0;
                           return (
                             <span className={totalSubmitted >= totalRequired ? 'text-emerald-600' : 'text-blue-600'}>
                               {totalSubmitted} / {totalRequired} Pairs ({percent}%)
                             </span>
                           );
                        })()}
                      </div>
                      {(() => {
                         const totalSubmitted = op.dailyProgresses.reduce((sum: number, p: any) => sum + p.pairs, 0);
                         const sizePairs = article.sizePairs ? parseJSON(article.sizePairs) : [];
                         const totalRequired = sizePairs.reduce((sum: number, sp: any) => sum + (parseInt(sp.pairs) || 0), 0);
                         const percent = totalRequired > 0 ? Math.min(100, Math.round((totalSubmitted / totalRequired) * 100)) : 0;
                         return (
                           <div className="h-1.5 w-full bg-slate-100">
                             <div className={\h-full \\} style={{ width: \\%\ }}></div>
                           </div>
                         );
                      })()}
                      <div className="p-3">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-100">
                              <th className="pb-2 font-semibold">Date</th>
                              <th className="pb-2 font-semibold">Size</th>
                              <th className="pb-2 font-semibold text-right">Pairs</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {op.dailyProgresses.map((dp: any) => (
                              <tr key={dp.id} className="text-slate-600">
                                <td className="py-1.5">{new Date(dp.date).toLocaleDateString('en-GB')}</td>
                                <td className="py-1.5 font-bold">{dp.size}</td>
                                <td className="py-1.5 text-right font-mono">{dp.pairs}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
;

c = c.replace(targetStr, newProgressUI);
fs.writeFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', c);
