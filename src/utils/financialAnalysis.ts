import type { Asset, Transaction, FinancialHealthScore } from '../types/finance';


/**
 * Calculates net worth from total active assets (excluding liabilities/debts)
 */
export function calculateNetWorth(assets: Asset[]): {
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
} {
  let totalAssets = 0;
  let totalDebts = 0;

  for (const asset of assets) {
    if (asset.isExcludedFromNetWorth) continue;

    if (asset.type === 'credit') {
      if (asset.balance < 0) {
        totalDebts += Math.abs(asset.balance);
      }
    } else {
      if (asset.balance >= 0) {
        totalAssets += asset.balance;
      } else {
        totalDebts += Math.abs(asset.balance);
      }
    }
  }

  return {
    totalAssets,
    totalDebts,
    netWorth: totalAssets - totalDebts,
  };
}

/**
 * Computes monthly financial health score and personalized recommendations
 */
export function evaluateFinancialHealth(
  assets: Asset[],
  transactions: Transaction[]
): FinancialHealthScore {
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Filter transactions for current or recent period
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  transactions.forEach((tx) => {
    if (tx.date.startsWith(currentYearMonth)) {
      if (tx.type === 'income') monthlyIncome += tx.amount;
      if (tx.type === 'expense') monthlyExpense += tx.amount;
    }
  });

  // Fallback average expense if current month has low activity
  if (monthlyExpense === 0) {
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    monthlyExpense = totalExpenses > 0 ? totalExpenses / 3 : 15000;
  }

  // Calculate Liquid Cash / Emergency Funds (cash + bank savings)
  const liquidAssets = assets
    .filter((a) => a.type === 'cash' || a.type === 'bank')
    .reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);

  const emergencyFundMonths =
    monthlyExpense > 0 ? Number((liquidAssets / monthlyExpense).toFixed(1)) : 0;

  let emergencyFundStatus: 'danger' | 'warning' | 'good' | 'excellent' = 'danger';
  let emergencyScore = 0;

  if (emergencyFundMonths >= 6) {
    emergencyFundStatus = 'excellent';
    emergencyScore = 35;
  } else if (emergencyFundMonths >= 3) {
    emergencyFundStatus = 'good';
    emergencyScore = 28;
  } else if (emergencyFundMonths >= 1) {
    emergencyFundStatus = 'warning';
    emergencyScore = 15;
  } else {
    emergencyFundStatus = 'danger';
    emergencyScore = 5;
  }

  // Savings rate
  const savingsRate =
    monthlyIncome > 0 ? (monthlyIncome - monthlyExpense) / monthlyIncome : 0;
  const savingsRatePercentage = Number((savingsRate * 100).toFixed(1));

  let savingsRateStatus: 'low' | 'moderate' | 'healthy' | 'exceptional' = 'low';
  let savingsScore = 0;

  if (savingsRatePercentage >= 30) {
    savingsRateStatus = 'exceptional';
    savingsScore = 35;
  } else if (savingsRatePercentage >= 20) {
    savingsRateStatus = 'healthy';
    savingsScore = 28;
  } else if (savingsRatePercentage >= 10) {
    savingsRateStatus = 'moderate';
    savingsScore = 18;
  } else {
    savingsRateStatus = 'low';
    savingsScore = 5;
  }

  // Debt assessment
  const { totalDebts } = calculateNetWorth(assets);
  const debtToIncomeRatio =
    monthlyIncome > 0 ? Number(((totalDebts / (monthlyIncome * 12)) * 100).toFixed(1)) : 0;

  let debtStatus: 'low' | 'manageable' | 'high' | 'critical' = 'low';
  let debtScore = 30;

  if (totalDebts === 0) {
    debtStatus = 'low';
    debtScore = 30;
  } else if (debtToIncomeRatio < 30) {
    debtStatus = 'manageable';
    debtScore = 24;
  } else if (debtToIncomeRatio < 60) {
    debtStatus = 'high';
    debtScore = 12;
  } else {
    debtStatus = 'critical';
    debtScore = 2;
  }

  const overallScore = Math.min(100, Math.max(0, emergencyScore + savingsScore + debtScore));

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
  if (overallScore >= 85) grade = 'A';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 55) grade = 'C';
  else if (overallScore >= 40) grade = 'D';
  else grade = 'F';

  // Personalized financial health tips
  const recommendations: string[] = [];
  if (emergencyFundMonths < 3) {
    recommendations.push(
      '🎯 ควรสะสมเงินสำรองฉุกเฉินให้ครอบคลุมค่าใช้จ่ายอย่างน้อย 3-6 เดือน (เป้าหมาย: ' +
        (monthlyExpense * 6).toLocaleString() +
        ' บาท)'
    );
  } else {
    recommendations.push('✅ เงินสำรองฉุกเฉินอยู่ในระดับที่ปลอดภัยและมั่นคง');
  }

  if (savingsRatePercentage < 20) {
    recommendations.push('💡 พยายามเพิ่มสัดส่วนการออมหรือลงทุนให้แตะ 20% ของรายรับตามหลัก 50/30/20');
  } else {
    recommendations.push('🚀 อัตราการออมยอดเยี่ยม! สามารถเริ่มกระจายพอร์ตไปยังสินทรัพย์ที่เติบโตได้');
  }

  if (totalDebts > 0) {
    recommendations.push('⚡ วางแผนทยอยชำระหนี้สินที่มีดอกเบี้ยสูงที่สุดก่อนเพื่อลดภาระดอกเบี้ย');
  }

  return {
    overallScore,
    grade,
    emergencyFundMonths,
    emergencyFundStatus,
    savingsRatePercentage,
    savingsRateStatus,
    debtToIncomeRatio,
    debtStatus,
    recommendations,
  };
}
