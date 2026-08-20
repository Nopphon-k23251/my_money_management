import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const CashFlowChart: React.FC = () => {
  const { transactions } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'THB';

  // Group transactions by month (last 6 months)
  const now = new Date();
  const monthsData: { month: string; income: number; expense: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('th-TH', { month: 'short' });

    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      if (tx.date.startsWith(monthKey)) {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expense += tx.amount;
      }
    });

    monthsData.push({
      month: monthLabel,
      income,
      expense,
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">กระแสเงินสด 6 เดือนย้อนหลัง</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">เปรียบเทียบรายรับและรายจ่ายในแต่ละเดือน</p>
        </div>
      </div>


      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value || 0), currency), '']}
              contentStyle={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #334155',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              formatter={(value) => (value === 'income' ? 'รายรับ (Income)' : 'รายจ่าย (Expense)')}
            />
            <Bar dataKey="income" name="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

