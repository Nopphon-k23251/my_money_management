import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

const COLORS = [
  '#6366f1',
  '#f43f5e',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
];

export const AnalyticsView: React.FC = () => {
  const { healthScore, transactions, netWorthData } = useFinance();

  const { user } = useAuth();
  const currency = user?.currency || 'THB';

  // Compute Expense Category Breakdown
  const expenseByCategory: Record<string, number> = {};
  let totalExpenses = 0;

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      totalExpenses += t.amount;
    });

  const categoryData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
    percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
  }));

  // 50/30/20 Rule Analysis
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const needsAmount = totalExpenses * 0.55; // estimated essential needs
  const wantsAmount = totalExpenses * 0.25; // estimated lifestyle wants
  const savingsAmount = Math.max(0, totalIncome - totalExpenses);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-5 sm:p-6 rounded-xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden border border-indigo-700/40">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-indigo-500/30 text-indigo-200 text-[11px] px-2.5 py-0.5 rounded-md font-semibold">
              ระบบประเมินสุขภาพทางการเงินอัจฉริยะ
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            คะแนนสุขภาพการเงินของคุณ: {healthScore.overallScore}/100
          </h2>
          <p className="text-indigo-200 text-xs mt-1.5 max-w-xl">
            เกรด <strong className="text-white font-bold">{healthScore.grade}</strong> —{' '}
            {healthScore.overallScore >= 80
              ? 'สถานะการเงินมีความมั่นคงและมีสภาพคล่องที่ดีเยี่ยม'
              : healthScore.overallScore >= 60
              ? 'สถานะการเงินอยู่ในเกณฑ์ปานกลาง ควบคุมรายจ่ายและเพิ่มเงินออมฉุกเฉิน'
              : 'ควรวางแผนปรับปรุงการออมและควบคุมภาระหนี้สินอย่างใกล้ชิด'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-md border border-white/10 shrink-0">
          <div className="w-11 h-11 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-xl">
            {healthScore.grade}
          </div>
          <div>
            <span className="text-[11px] text-indigo-200 block">Financial Grade</span>
            <div className="text-sm font-bold">
              {healthScore.overallScore >= 80 ? 'Excellent' : healthScore.overallScore >= 60 ? 'Good' : 'Needs Focus'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Diagnostic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Emergency Fund Ratio */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">เงินสำรองฉุกเฉิน</span>
              <ShieldCheck
                className={`w-4 h-4 ${
                  healthScore.emergencyFundStatus === 'excellent' || healthScore.emergencyFundStatus === 'good'
                    ? 'text-emerald-500'
                    : 'text-amber-500'
                }`}
              />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {healthScore.emergencyFundMonths}{' '}
              <span className="text-xs font-normal text-slate-400">เดือน</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            {healthScore.emergencyFundMonths >= 6 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✅ ครอบคลุม 6 เดือนขึ้นไป (ยอดเยี่ยม)</span>
            ) : healthScore.emergencyFundMonths >= 3 ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">👍 ครอบคลุม 3 เดือนขึ้นไป (ผ่านเกณฑ์)</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">⚠️ ควรสะสมให้ได้อย่างน้อย 3-6 เดือน</span>
            )}
          </div>
        </div>

        {/* Savings Rate Ratio */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">อัตราการออมสุทธิ</span>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {healthScore.savingsRatePercentage}%
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            {healthScore.savingsRatePercentage >= 20 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✅ ผ่านเกณฑ์ขั้นต่ำ 20% ของรายได้</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">💡 ควรเพิ่มเงินออมให้ถึง 20%</span>
            )}
          </div>
        </div>

        {/* Debt-to-Income */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">หนี้สินคงค้างทั้งหมด</span>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(netWorthData.totalDebts, currency)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            {netWorthData.totalDebts === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✅ ไม่มีภาระหนี้สินคงค้าง</span>
            ) : (
              <span className="text-slate-600 dark:text-slate-400">สัดส่วนหนี้ต่อรายได้: {healthScore.debtToIncomeRatio}%</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Category Breakdown & 50/30/20 Rule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Donut Chart: Expenses Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">สัดส่วนรายจ่ายตามหมวดหมู่</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              รวมค่าใช้จ่ายทั้งหมด {formatCurrency(totalExpenses, currency)}
            </p>

            {categoryData.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">ยังไม่มีรายการค่าใช้จ่าย</div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [formatCurrency(Number(val || 0), currency), '']}
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          color: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #334155',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-1.5 w-full text-xs">
                  {categoryData.slice(0, 5).map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        ></div>
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px] text-[11px]">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 50/30/20 Rule Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">การวิเคราะห์ตามกฎ 50 / 30 / 20</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              โมเดลจัดสรรเงินสากลเพื่อสร้างความมั่งคั่งระยะยาว
            </p>

            <div className="space-y-3">
              {/* Needs 50% */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">1. ค่าใช้จ่ายจำเป็น (Needs ~50%)</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(needsAmount, currency)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>

              {/* Wants 30% */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">2. ไลฟ์สไตล์ (Wants ~30%)</span>
                  <span className="text-rose-500 dark:text-rose-400">{formatCurrency(wantsAmount, currency)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>

              {/* Savings 20% */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">3. เงินออมและการลงทุน (Savings ~20%)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(savingsAmount, currency)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations list */}
          {healthScore.recommendations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">คำแนะนำเฉพาะคุณ:</span>
              {healthScore.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


