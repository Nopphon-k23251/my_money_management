import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ShieldCheck, Lightbulb, AlertTriangle, ArrowRight } from 'lucide-react';

export const FinancialScoreWidget: React.FC = () => {
  const { healthScore, setActiveTab, transactions } = useFinance();

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-500 text-white';
      case 'B':
        return 'bg-indigo-500 text-white';
      case 'C':
        return 'bg-amber-500 text-white';
      case 'D':
      case 'F':
      default:
        return 'bg-rose-500 text-white';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">สุขภาพทางการเงิน</h3>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            50/30/20 Rule
          </span>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-4 my-3">
          <div className="relative flex items-center justify-center">
            <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {healthScore.overallScore}
            </div>
            <span className="text-xs text-slate-400 ml-1">/100</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getGradeBadge(
                  healthScore.grade
                )}`}
              >
                เกรด {healthScore.grade}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {healthScore.overallScore >= 80 ? 'สุขภาพการเงินยอดเยี่ยม' : healthScore.overallScore >= 60 ? 'สุขภาพการเงินดี' : 'ควรปรับปรุง'}
              </span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${healthScore.overallScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Primary Advice */}
        {transactions.length === 0 ? (
          <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300">
            💡 เริ่มบันทึกรายรับ-รายจ่าย เพื่อให้ระบบคำนวณคะแนนสุขภาพการเงินและให้คำแนะนำแบบเฉพาะบุคคล
          </div>
        ) : (
          <div className="space-y-1.5 mt-3">
            {healthScore.recommendations.slice(0, 2).map((s, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300"
              >
                {idx === 0 ? (
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                )}
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setActiveTab('analytics')}
        className="w-full mt-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/50 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
      >
        <span>ดูผลวิเคราะห์เจาะลึก</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

