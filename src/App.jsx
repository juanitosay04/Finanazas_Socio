import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpensesTracker from './components/ExpensesTracker';
import ProjectionsCalculator from './components/ProjectionsCalculator';
import InvestmentsTracker from './components/InvestmentsTracker';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const localStorageKey = 'finances_socio_data';

  // Global State for Finances
  const [financialData, setFinancialData] = useState(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved financial data", e);
      }
    }
    return {
      incomes: [
        { id: 1, description: 'Sueldo Consultoría Partner', amount: 8800000, category: 'Sueldo', date: '2026-08-05' }
      ],
      expenses: [
        { id: 1, description: 'Hipoteca / Renta', amount: 1600000, category: 'Vivienda', date: '2026-08-01' },
        { id: 2, description: 'Mercado Carulla', amount: 480000, category: 'Alimentación', date: '2026-08-03' },
        { id: 3, description: 'Gasolina Texaco', amount: 120000, category: 'Transporte', date: '2026-08-04' },
        { id: 4, description: 'Suscripción AWS & Cloud', amount: 250000, category: 'Servicios', date: '2026-08-05' },
        { id: 5, description: 'Cena Restaurante Criterión', amount: 320000, category: 'Entretenimiento', date: '2026-08-06' },
        { id: 6, description: 'Seguro Médico Prepagada', amount: 380000, category: 'Seguros', date: '2026-08-07' },
        { id: 7, description: 'Aporte Portafolio ETFs', amount: 500000, category: 'Inversiones', date: '2026-08-07' }
      ],
      investments: [
        { id: 1, name: 'Vanguard S&P 500 ETF (VOO)', type: 'ETFs', shares: 85, averageCost: 1520000, currentPrice: 1848000 },
        { id: 2, name: 'Apple Inc. (AAPL)', type: 'Acciones', shares: 50, averageCost: 580000, currentPrice: 764000 },
        { id: 3, name: 'Bitcoin (BTC)', type: 'Criptomonedas', shares: 0.65, averageCost: 140000000, currentPrice: 256800000 },
        { id: 4, name: 'Fideicomiso Inmobiliario', type: 'Bienes Raíces', shares: 1, averageCost: 60000000, currentPrice: 75000000 }
      ],
      transactions: [
        { id: 1, description: 'Aporte Portafolio ETFs', amount: 500000, category: 'Inversiones', type: 'expense', date: '2026-08-07' },
        { id: 2, description: 'Seguro Médico Prepagada', amount: 380000, category: 'Seguros', type: 'expense', date: '2026-08-07' },
        { id: 3, description: 'Cena Restaurante Criterión', amount: 320000, category: 'Entretenimiento', type: 'expense', date: '2026-08-06' },
        { id: 4, description: 'Sueldo Consultoría Partner', amount: 8800000, category: 'Sueldo', type: 'income', date: '2026-08-05' },
        { id: 5, description: 'Gasolina Texaco', amount: 120000, category: 'Transporte', type: 'expense', date: '2026-08-04' },
        { id: 6, description: 'Mercado Carulla', amount: 480000, category: 'Alimentación', type: 'expense', date: '2026-08-03' }
      ],
      obligations: [
        { id: 1, description: 'Hipoteca / Renta', amount: 1600000, category: 'Vivienda', type: 'Crédito Hipotecario', dueDate: 'Día 05', paid: true },
        { id: 2, description: 'Seguro Médico Prepagada', amount: 380000, category: 'Seguros', type: 'Gasto Fijo', dueDate: 'Día 10', paid: true },
        { id: 3, description: 'Tarjeta Bancolombia Black', amount: 1200000, category: 'Tarjetas de Crédito', type: 'Tarjeta de Crédito', dueDate: 'Día 16', paid: false },
        { id: 4, description: 'Crédito Vehículo Occidente', amount: 950000, category: 'Créditos', type: 'Crédito Vehicular', dueDate: 'Día 20', paid: false },
        { id: 5, description: 'Servicios Públicos (Luz/Internet)', amount: 450000, category: 'Servicios', type: 'Gasto Fijo', dueDate: 'Día 25', paid: false }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(financialData));

    // Asynchronously push updates to Vercel KV database
    const saveToCloud = async () => {
      try {
        await fetch('/api/finances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(financialData)
        });
      } catch (e) {
        console.warn("Could not save to Vercel KV cloud", e);
      }
    };
    saveToCloud();
  }, [financialData]);

  useEffect(() => {
    // Fetch from Vercel KV Cloud database on mount
    const loadFromCloud = async () => {
      try {
        const res = await fetch('/api/finances');
        if (res.ok) {
          const data = await res.json();
          if (data && !data.warning && (data.incomes || data.expenses || data.investments)) {
            setFinancialData(data);
          }
        }
      } catch (e) {
        console.warn("Could not load from Vercel KV cloud", e);
      }
    };
    loadFromCloud();
  }, []);

  // Handlers for Incomes
  const handleAddIncome = (newIncome) => {
    const incomeWithId = {
      ...newIncome,
      id: Date.now()
    };
    
    const transaction = {
      id: Date.now() + 1,
      description: newIncome.description,
      amount: newIncome.amount,
      category: newIncome.category,
      type: 'income',
      date: newIncome.date
    };

    setFinancialData((prev) => {
      const updatedIncomes = [incomeWithId, ...prev.incomes];
      return {
        ...prev,
        incomes: updatedIncomes,
        transactions: [transaction, ...prev.transactions]
      };
    });
  };

  const handleDeleteIncome = (id) => {
    setFinancialData((prev) => {
      const incomeToDelete = prev.incomes.find(inc => inc.id === id);
      const filteredIncomes = prev.incomes.filter((inc) => inc.id !== id);
      
      const filteredTransactions = prev.transactions.filter(
        (t) => !(t.description === incomeToDelete?.description && t.amount === incomeToDelete?.amount)
      );

      return {
        ...prev,
        incomes: filteredIncomes,
        transactions: filteredTransactions
      };
    });
  };

  const handleDeleteTransaction = (id) => {
    setFinancialData((prev) => {
      const tx = prev.transactions.find(t => t.id === id);
      if (!tx) return prev;

      const filteredTransactions = prev.transactions.filter(t => t.id !== id);
      
      let updatedExpenses = prev.expenses;
      let updatedIncomes = prev.incomes;

      if (tx.type === 'expense') {
        updatedExpenses = prev.expenses.filter(
          exp => !(exp.description === tx.description && exp.amount === tx.amount)
        );
      } else if (tx.type === 'income') {
        updatedIncomes = prev.incomes.filter(
          inc => !(inc.description === tx.description && inc.amount === tx.amount)
        );
      }

      return {
        ...prev,
        transactions: filteredTransactions,
        expenses: updatedExpenses,
        incomes: updatedIncomes
      };
    });
  };

  // Handlers for Expenses
  const handleAddExpense = (newExpense) => {
    const expenseWithId = {
      ...newExpense,
      id: Date.now()
    };
    
    // Also create a transaction representation
    const transaction = {
      id: Date.now() + 1,
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category,
      type: 'expense',
      date: newExpense.date
    };

    setFinancialData((prev) => ({
      ...prev,
      expenses: [expenseWithId, ...prev.expenses],
      transactions: [transaction, ...prev.transactions]
    }));
  };

  const handleDeleteExpense = (id) => {
    setFinancialData((prev) => {
      const expenseToDelete = prev.expenses.find(exp => exp.id === id);
      const filteredExpenses = prev.expenses.filter((exp) => exp.id !== id);
      
      // Also filter out of transactions if found
      const filteredTransactions = prev.transactions.filter(
        (t) => !(t.description === expenseToDelete?.description && t.amount === expenseToDelete?.amount)
      );

      return {
        ...prev,
        expenses: filteredExpenses,
        transactions: filteredTransactions
      };
    });
  };

  // Handlers for Investments
  const handleAddInvestment = (newInv) => {
    const investmentWithId = {
      ...newInv,
      id: Date.now()
    };

    setFinancialData((prev) => ({
      ...prev,
      investments: [investmentWithId, ...prev.investments]
    }));
  };

  const handleDeleteInvestment = (id) => {
    setFinancialData((prev) => ({
      ...prev,
      investments: prev.investments.filter((inv) => inv.id !== id)
    }));
  };

  // Handlers for Obligations
  const handleToggleObligation = (id) => {
    setFinancialData((prev) => {
      const obligation = prev.obligations.find((ob) => ob.id === id);
      if (!obligation) return prev;

      const isMarkingPaid = !obligation.paid;
      const updatedObligations = prev.obligations.map((ob) => {
        if (ob.id === id) {
          return { ...ob, paid: isMarkingPaid };
        }
        return ob;
      });

      let updatedExpenses = [...prev.expenses];
      let updatedTransactions = [...prev.transactions];

      if (isMarkingPaid) {
        // Mark as PAID (add to expenses and transactions)
        const newExpense = {
          id: Date.now(),
          description: obligation.description,
          amount: obligation.amount,
          category: obligation.category,
          date: new Date().toISOString().split('T')[0]
        };
        const newTransaction = {
          id: Date.now() + 1,
          description: obligation.description,
          amount: obligation.amount,
          category: obligation.category,
          type: 'expense',
          date: new Date().toISOString().split('T')[0]
        };
        updatedExpenses = [newExpense, ...updatedExpenses];
        updatedTransactions = [newTransaction, ...updatedTransactions];
      } else {
        // Mark as PENDING (remove from expenses and transactions)
        updatedExpenses = updatedExpenses.filter(
          (exp) => !(exp.description === obligation.description && exp.amount === obligation.amount)
        );
        updatedTransactions = updatedTransactions.filter(
          (t) => !(t.description === obligation.description && t.amount === obligation.amount)
        );
      }

      return {
        ...prev,
        obligations: updatedObligations,
        expenses: updatedExpenses,
        transactions: updatedTransactions
      };
    });
  };

  const handleAddObligation = (newObl) => {
    setFinancialData((prev) => ({
      ...prev,
      obligations: [
        ...prev.obligations,
        {
          ...newObl,
          id: Date.now(),
          paid: false
        }
      ]
    }));
  };

  const handleDeleteObligation = (id) => {
    setFinancialData((prev) => ({
      ...prev,
      obligations: prev.obligations.filter((ob) => ob.id !== id)
    }));
  };

  // Simula la sincronización automática con API bancaria del socio
  const handleSimulateBankSync = () => {
    const mockDescriptions = [
      { desc: 'División de Dividendos AAPL', amount: 600000, category: 'Dividendos', type: 'income' },
      { desc: 'Pago Suscripción AWS', amount: 350000, category: 'Servicios', type: 'expense' },
      { desc: 'Reembolso de Gastos Partner', amount: 1600000, category: 'Reembolso', type: 'income' },
      { desc: 'Restaurante Harry Sasson', amount: 780000, category: 'Entretenimiento', type: 'expense' },
      { desc: 'Compra de Fracciones BTC', amount: 1200000, category: 'Inversiones', type: 'expense' }
    ];

    // Pick random mock transaction
    const randomIndex = Math.floor(Math.random() * mockDescriptions.length);
    const mock = mockDescriptions[randomIndex];
    const newId = Date.now();

    const newTransaction = {
      id: newId,
      description: mock.desc,
      amount: mock.amount,
      category: mock.category,
      type: mock.type,
      date: new Date().toISOString().split('T')[0]
    };

    setFinancialData((prev) => {
      const updatedTransactions = [newTransaction, ...prev.transactions];
      let updatedExpenses = prev.expenses;

      // If it is an expense, add it to expenses list too
      if (mock.type === 'expense') {
        const newExpense = {
          id: newId + 1,
          description: mock.desc,
          amount: mock.amount,
          category: mock.category,
          date: newTransaction.date
        };
        updatedExpenses = [newExpense, ...prev.expenses];
      } else if (mock.type === 'income') {
        const newIncome = {
          id: newId + 2,
          description: mock.desc,
          amount: mock.amount,
          category: mock.category,
          date: newTransaction.date
        };

        return {
          ...prev,
          incomes: [newIncome, ...prev.incomes],
          transactions: updatedTransactions
        };
      }

      return {
        ...prev,
        expenses: updatedExpenses,
        transactions: updatedTransactions
      };
    });
  };

  // Exportar toda la base de datos a JSON
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(financialData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Finanzas_Socio_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearData = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar todos los datos de demostración para iniciar en limpio con tus valores reales? Esto vaciará tus registros e inversiones actuales.")) {
      setFinancialData({
        incomes: [],
        expenses: [],
        investments: [],
        transactions: [],
        obligations: []
      });
    }
  };

  const totalIncome = (financialData.incomes || []).reduce((sum, inc) => sum + inc.amount, 0);
  const financialDataWithTotals = {
    ...financialData,
    income: totalIncome
  };

  return (
    <div className="app-container">
      {/* Aurora glow backdrops */}
      <div className="aurora-2"></div>
      
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Dashboard */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            financialData={financialDataWithTotals} 
            simulateBankSync={handleSimulateBankSync}
            exportData={handleExportData}
            onDeleteTransaction={handleDeleteTransaction}
            clearData={handleClearData}
          />
        )}
        
        {activeTab === 'expenses' && (
          <ExpensesTracker 
            expenses={financialData.expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            incomes={financialData.incomes}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
            obligations={financialData.obligations}
            onToggleObligation={handleToggleObligation}
            onAddObligation={handleAddObligation}
            onDeleteObligation={handleDeleteObligation}
          />
        )}

        {activeTab === 'projections' && (
          <ProjectionsCalculator />
        )}

        {activeTab === 'investments' && (
          <InvestmentsTracker 
            investments={financialData.investments}
            onAddInvestment={handleAddInvestment}
            onDeleteInvestment={handleDeleteInvestment}
          />
        )}
      </main>
    </div>
  );
}
