// components/shared/EventReport.jsx
import React from "react";

const EventReport = ({ event, eventTransactions, eventStats, churchName }) => {
  // Calculate additional insights
  const totalTransactions = eventTransactions.length;
  const incomeTransactions = eventTransactions.filter((t) => t.amount > 0);
  const expenseTransactions = eventTransactions.filter((t) => t.amount < 0);
  const avgIncome =
    incomeTransactions.length > 0
      ? eventStats.totalIncome / incomeTransactions.length
      : 0;
  const avgExpense =
    expenseTransactions.length > 0
      ? eventStats.totalExpenses / expenseTransactions.length
      : 0;
  const transactionRatio =
    eventStats.totalIncome > 0
      ? ((eventStats.totalExpenses / eventStats.totalIncome) * 100).toFixed(1)
      : "N/A";
  const topContributors = incomeTransactions
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5);

  const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${event.title} - Financial Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f0f4f8;
      padding: 40px 20px;
      color: #1a202c;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    /* Header */
    .header {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      padding: 40px 50px;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
      border-radius: 50%;
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      padding: 6px 16px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 16px;
    }
    .header-badge span {
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      color: #a0aec0;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .header-subtitle .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header-subtitle .meta-item .icon {
      opacity: 0.6;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
      background: ${event.status === "completed" ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)"};
      color: ${event.status === "completed" ? "#10b981" : "#3b82f6"};
      border: 1px solid ${event.status === "completed" ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.3)"};
    }
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: #e2e8f0;
    }
    .stat-card {
      background: white;
      padding: 24px 30px;
      position: relative;
      transition: all 0.2s;
    }
    .stat-card:hover {
      background: #f7fafc;
    }
    .stat-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #718096;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .stat-value.income { color: #10b981; }
    .stat-value.expense { color: #ef4444; }
    .stat-value.net-positive { color: #10b981; }
    .stat-value.net-negative { color: #ef4444; }
    .stat-value.default { color: #1a202c; }
    .stat-trend {
      font-size: 12px;
      color: #718096;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .stat-trend .trend-up { color: #10b981; }
    .stat-trend .trend-down { color: #ef4444; }
    /* Body */
    .body {
      padding: 40px 50px;
    }
    /* Insights Section */
    .insights-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 40px;
    }
    .insight-card {
      background: #f7fafc;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #e2e8f0;
    }
    .insight-card h3 {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #718096;
      margin-bottom: 16px;
    }
    .insight-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #edf2f7;
      font-size: 14px;
    }
    .insight-item:last-child {
      border-bottom: none;
    }
    .insight-item .label {
      color: #4a5568;
    }
    .insight-item .value {
      font-weight: 600;
    }
    .insight-item .value.positive { color: #10b981; }
    .insight-item .value.negative { color: #ef4444; }
    /* Chart Section */
    .chart-section {
      background: #f7fafc;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      margin-bottom: 40px;
    }
    .chart-section h3 {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #718096;
      margin-bottom: 16px;
    }
    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      height: 120px;
      padding: 0 4px;
    }
    .chart-bar-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      height: 100%;
      justify-content: flex-end;
    }
    .chart-bar {
      width: 100%;
      max-width: 60px;
      min-height: 4px;
      border-radius: 4px 4px 0 0;
      transition: height 0.5s ease;
      position: relative;
    }
    .chart-bar.income {
      background: linear-gradient(180deg, #10b981, #34d399);
    }
    .chart-bar.expense {
      background: linear-gradient(180deg, #ef4444, #f87171);
    }
    .chart-bar-label {
      font-size: 10px;
      color: #718096;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 80px;
    }
    .chart-bar-value {
      font-size: 10px;
      font-weight: 600;
      color: #2d3748;
    }
    /* Transactions Table */
    .transactions-section h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .transactions-section h3 .count {
      font-size: 12px;
      font-weight: 400;
      color: #718096;
    }
    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    thead {
      background: #f7fafc;
    }
    th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #718096;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #edf2f7;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover {
      background: #f7fafc;
    }
    .transaction-type {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
    }
    .transaction-type.offering {
      background: #d1fae5;
      color: #065f46;
    }
    .transaction-type.donation {
      background: #dbeafe;
      color: #1e40af;
    }
    .transaction-type.expense {
      background: #fecaca;
      color: #991b1b;
    }
    .amount-positive {
      color: #10b981;
      font-weight: 600;
    }
    .amount-negative {
      color: #ef4444;
      font-weight: 600;
    }
    /* Footer */
    .footer {
      padding: 30px 50px;
      border-top: 1px solid #e2e8f0;
      background: #fafbfc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 12px;
      color: #718096;
    }
    .footer .org-name {
      font-weight: 600;
      color: #2d3748;
    }
    /* Print Styles */
    @media print {
      body { 
        background: white; 
        padding: 0;
      }
      .container { 
        border-radius: 0; 
        box-shadow: none;
      }
      .stat-card:hover { background: white; }
      tr:hover { background: transparent; }
      .no-print { display: none; }
    }
    /* Responsive */
    @media (max-width: 768px) {
      .header { padding: 30px 20px; }
      .header h1 { font-size: 24px; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .stat-card { padding: 16px 20px; }
      .stat-value { font-size: 22px; }
      .body { padding: 20px; }
      .insights-grid { grid-template-columns: 1fr; }
      .footer { flex-direction: column; text-align: center; padding: 20px; }
    }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="header-badge">
          <span></span>
          Financial Event Report
        </div>
        <h1>${event.title}</h1>
        <div class="header-subtitle">
          <span class="meta-item">
            <span class="icon">📅</span>
            ${new Date(event.event_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            ${event.event_time ? `at ${event.event_time}` : ""}
          </span>
          <span class="meta-item">
            <span class="icon">🏷️</span>
            Status: 
            <span class="status-badge">
              ${event.status === "completed" ? "✅ Completed" : "🔄 Active"}
            </span>
          </span>
          <span class="meta-item">
            <span class="icon">📊</span>
            ${totalTransactions} Transaction${totalTransactions !== 1 ? "s" : ""}
          </span>
        </div>
        ${event.description ? `<p style="color: #a0aec0; font-size: 14px; margin-top: 12px;">${event.description}</p>` : ""}
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Income</div>
        <div class="stat-value income">₱${eventStats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="stat-trend">
          <span class="trend-up">↑</span>
          ${incomeTransactions.length} contributions
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value expense">₱${eventStats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="stat-trend">
          <span class="trend-down">↓</span>
          ${expenseTransactions.length} expenditures
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Net Balance</div>
        <div class="stat-value ${eventStats.netBalance >= 0 ? "net-positive" : "net-negative"}">
          ${eventStats.netBalance >= 0 ? "+" : ""}₱${eventStats.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div class="stat-trend">
          ${eventStats.netBalance >= 0 ? "✅ Surplus" : "⚠️ Deficit"}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Transaction Ratio</div>
        <div class="stat-value default">${transactionRatio}%</div>
        <div class="stat-trend">
          ${parseFloat(transactionRatio) < 50 ? "💰 Healthy ratio" : "📊 Monitor spending"}
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <!-- Insights Grid -->
      <div class="insights-grid">
        <div class="insight-card">
          <h3>🏆 Top Contributors</h3>
          ${
            topContributors.length > 0
              ? topContributors
                  .map(
                    (t, i) => `
            <div class="insight-item">
              <span class="label">${i + 1}. ${t.contributorName || "Anonymous"}</span>
              <span class="value positive">+₱${Math.abs(t.amount).toLocaleString()}</span>
            </div>
          `,
                  )
                  .join("")
              : '<div style="color: #718096; font-size: 14px;">No contributions recorded</div>'
          }
        </div>
        <div class="insight-card">
          <h3>📊 Key Insights</h3>
          <div class="insight-item">
            <span class="label">Average Income</span>
            <span class="value positive">₱${avgIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="insight-item">
            <span class="label">Average Expense</span>
            <span class="value negative">₱${avgExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="insight-item">
            <span class="label">Income/Expense Ratio</span>
            <span class="value">${eventStats.totalExpenses > 0 ? (eventStats.totalIncome / eventStats.totalExpenses).toFixed(2) : "N/A"}</span>
          </div>
          <div class="insight-item">
            <span class="label">Total Transactions</span>
            <span class="value">${totalTransactions}</span>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="chart-section">
        <h3>📈 Transaction Distribution</h3>
        <div class="chart-bars">
          ${incomeTransactions.slice(0, 6).map((t) => {
            const maxAmount = Math.max(
              ...incomeTransactions.map((t) => Math.abs(t.amount)),
              1,
            );
            const height = (Math.abs(t.amount) / maxAmount) * 100;
            return `
              <div class="chart-bar-wrapper">
                <div class="chart-bar-value">₱${Math.abs(t.amount).toLocaleString()}</div>
                <div class="chart-bar income" style="height: ${Math.max(height, 10)}%;"></div>
                <div class="chart-bar-label">${t.contributorName?.split(" ")[0] || "Donor"}</div>
              </div>
            `;
          })}
          ${incomeTransactions.length === 0 ? '<div style="color: #718096; padding: 20px; text-align: center; width: 100%;">No income data available</div>' : ""}
        </div>
        <div style="margin-top: 12px; display: flex; gap: 20px; justify-content: center; font-size: 12px; color: #718096;">
          <span>🟢 Income Contributions</span>
          <span>🔴 Expense Items</span>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="transactions-section">
        <h3>
          📋 Transaction Log
          <span class="count">(${totalTransactions} entries)</span>
        </h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Contributor</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${
                eventTransactions.length > 0
                  ? eventTransactions
                      .map(
                        (t) => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>
                    <span class="transaction-type ${t.transType.toLowerCase()}">
                      ${t.transType === "Offering" ? "🙏" : t.transType === "Donation" ? "🎁" : "📋"} ${t.transType}
                    </span>
                  </td>
                  <td>${t.description || "—"}</td>
                  <td>${t.contributorName || "—"}</td>
                  <td style="text-align: right;">
                    <span class="${t.amount >= 0 ? "amount-positive" : "amount-negative"}">
                      ${t.amount >= 0 ? "+" : "-"}₱${Math.abs(t.amount).toLocaleString()}
                    </span>
                  </td>
                </tr>
              `,
                      )
                      .join("")
                  : `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 30px; color: #718096;">
                    No transactions recorded for this event
                  </td>
                </tr>
              `
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>
        <span class="org-name">${churchName || "KJV BCCMI"}</span>
        <span style="margin: 0 8px;">•</span>
        <span>Event Financial Report</span>
      </div>
      <div>
        Generated: ${new Date().toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div class="no-print">
        <button onclick="window.print()" style="
          background: #1a202c;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        ">
          🖨️ Print Report
        </button>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return reportHTML;
};

export default EventReport;
