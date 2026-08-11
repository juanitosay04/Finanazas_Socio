import React, { useState } from 'react';
import { Plus, Trash2, Calendar, DollarSign, AlertCircle, CreditCard } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function ExpensesTracker({ 
  expenses, 
  allExpenses = [],
  onAddExpense, 
  onDeleteExpense, 
  incomes = [],
  onAddIncome,
  onDeleteIncome,
  obligations = [], 
  onToggleObligation, 
  onAddObligation, 
  onDeleteObligation,
  config,
  creditCards = [],
  onAddCreditCard,
  onDeleteCreditCard
}) {
  const [formTab, setFormTab] = useState('expense'); // 'expense' or 'income'
  const [historyTab, setHistoryTab] = useState('expense'); // 'expense' or 'income'
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentación');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Credit Card transaction fields
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [installments, setInstallments] = useState('1');

  // Credit Card Form States
  const [cardNameInput, setCardNameInput] = useState('');
  const [cardLimitInput, setCardLimitInput] = useState('');
  const [cardCorteInput, setCardCorteInput] = useState('15');
  const [cardPagoInput, setCardPagoInput] = useState('5');

  // States for new Monthly Obligation Form
  const [newOblDesc, setNewOblDesc] = useState('');
  const [newOblAmount, setNewOblAmount] = useState('');
  const [newOblType, setNewOblType] = useState('Gasto Fijo');
  const [newOblCat, setNewOblCat] = useState('Servicios');
  const [newOblDueDate, setNewOblDueDate] = useState('Día 10');

  // Calculations
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetLimit = config?.monthlyBudget || 8800000;
  const budgetPercentage = Math.min((totalExpenses / budgetLimit) * 100, 100);

  // Obligations Calculations
  const totalObligations = obligations.reduce((sum, ob) => sum + ob.amount, 0);
  const totalPaidObligations = obligations.filter(ob => ob.paid).reduce((sum, ob) => sum + ob.amount, 0);
  const totalPendingObligations = totalObligations - totalPaidObligations;

  // Group by category for chart
  const categoriesDataMap = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const categoriesColors = {
    'Vivienda': '#e07a5f',
    'Alimentación': '#f4a261',
    'Transporte': '#9d4edd',
    'Servicios': '#81b29a',
    'Entretenimiento': '#e76f51',
    'Seguros': '#8a2be2',
    'Inversiones': '#00f5a0',
    'Tarjetas de Crédito': '#c084fc',
    'Créditos': '#ff007f',
    'Otros': '#8e7365'
  };

  const chartData = Object.keys(categoriesDataMap).map(cat => ({
    name: cat,
    value: categoriesDataMap[cat],
    color: categoriesColors[cat] || '#ffffff'
  }));

  // Force dots formatting helper
  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '$ 0';
    const isNegative = val < 0;
    const absVal = Math.round(Math.abs(val));
    const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${isNegative ? '-' : ''}$ ${formatted}`;
  };

  const handleFormatInput = (val, setter) => {
    const clean = val.replace(/\D/g, '');
    const formatted = clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setter(formatted);
  };

  const getCardDatesAndAlerts = (corteDay, pagoDay) => {
    const today = new Date();
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const year = todayLocal.getFullYear();
    const month = todayLocal.getMonth();
    
    let corteDate = new Date(year, month, corteDay);
    if (todayLocal > corteDate) {
      corteDate = new Date(year, month + 1, corteDay);
    }
    
    const corteMonth = corteDate.getMonth();
    const corteYear = corteDate.getFullYear();
    let pagoDate = new Date(corteYear, corteMonth, pagoDay);
    if (pagoDay <= corteDay) {
      pagoDate = new Date(corteYear, corteMonth + 1, pagoDay);
    }
    
    const diffCorte = Math.ceil((corteDate.getTime() - todayLocal.getTime()) / (1000 * 60 * 60 * 24));
    const diffPago = Math.ceil((pagoDate.getTime() - todayLocal.getTime()) / (1000 * 60 * 60 * 24));
    
    let daysToCorte = `Faltan ${diffCorte} ${diffCorte === 1 ? 'día' : 'días'}`;
    if (diffCorte === 0) daysToCorte = 'Hoy corta';
    
    let daysToPago = `Faltan ${diffPago} ${diffPago === 1 ? 'día' : 'días'}`;
    if (diffPago === 0) daysToPago = 'Hoy vence pago';
    
    const showCorteAlert = diffCorte >= 0 && diffCorte <= 3;
    const showPagoAlert = diffPago >= 0 && diffPago <= 7;
    
    return {
      corteDate,
      pagoDate,
      daysToCorte,
      daysToPago,
      showCorteAlert,
      showPagoAlert
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const parsedAmount = parseFloat(amount.toString().replace(/\./g, '')) || 0;

    if (formTab === 'expense') {
      const selectedCard = creditCards.find(c => c.id === parseFloat(selectedCardId));
      onAddExpense({
        description,
        amount: parsedAmount,
        category,
        date,
        isCreditCard: isCreditCard && creditCards.length > 0,
        cardId: isCreditCard && creditCards.length > 0 ? selectedCard?.id : null,
        cardName: isCreditCard && creditCards.length > 0 ? selectedCard?.name : null,
        installments: isCreditCard && creditCards.length > 0 ? parseInt(installments) : null
      });
    } else {
      onAddIncome({
        description,
        amount: parsedAmount,
        category: category === 'Alimentación' ? 'Trabajo Extra' : category,
        date
      });
    }

    // Reset form
    setDescription('');
    setAmount('');
    setIsCreditCard(false);
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!cardNameInput || !cardLimitInput) return;
    
    onAddCreditCard({
      name: cardNameInput,
      limit: parseFloat(cardLimitInput.toString().replace(/\./g, '')) || 0,
      corteDay: parseInt(cardCorteInput),
      pagoDay: parseInt(cardPagoInput)
    });

    setCardNameInput('');
    setCardLimitInput('');
  };

  const handleAddObligationSubmit = (e) => {
    e.preventDefault();
    if (!newOblDesc || !newOblAmount) return;

    onAddObligation({
      description: newOblDesc,
      amount: parseFloat(newOblAmount.toString().replace(/\./g, '')) || 0,
      type: newOblType,
      category: newOblCat,
      dueDate: newOblDueDate
    });

    // Reset Form
    setNewOblDesc('');
    setNewOblAmount('');
  };

  // Get color class for progress bar
  const getProgressColorClass = () => {
    if (budgetPercentage >= 90) return 'danger';
    if (budgetPercentage >= 70) return 'warning';
    return '';
  };

  return (
    <div className="tab-pane active">
      {/* Header */}
      <div className="top-header">
        <div className="header-title-area">
          <h1>Control de Gastos</h1>
          <p>Lleva las cuentas claras del mes. ¡Optimiza tus salidas financieras! 💼📊</p>
        </div>
      </div>

      {/* Budget Limit Card */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Presupuesto del Ciclo</span>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>
              {formatCurrency(totalExpenses)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>de {formatCurrency(budgetLimit)}</span>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Capacidad Consumida</span>
            <h3 style={{ margin: 0, color: budgetPercentage > 90 ? 'var(--accent-rose)' : budgetPercentage > 70 ? 'var(--accent-gold)' : 'var(--accent-emerald)' }}>
              {budgetPercentage.toFixed(1)}%
            </h3>
          </div>
        </div>

        <div className="budget-progress-bar">
          <div 
            className={`budget-progress-fill ${getProgressColorClass()}`}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>

        {budgetPercentage >= 90 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>Alerta Presupuestaria: Hemos consumido casi el 100% de la capacidad de gastos de este mes. 🛑</span>
          </div>
        )}
      </div>

      {/* Credit Cards Section */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={20} className="text-purple" />
          Control de Tarjetas de Crédito
        </h2>
        <p>Anota tu fecha de corte y pago, y mira instantáneamente el cupo y las fechas límite. ¡Todo calculado al instante! 💳✨</p>

        {creditCards.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', marginTop: '1rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No tienes tarjetas de crédito configuradas. Agrégalas abajo.</p>
          </div>
        ) : (
          <div className="grid-cols-2" style={{ gap: '1rem', marginTop: '1rem' }}>
            {creditCards.map(card => {
              const cardExpenses = allExpenses.filter(exp => exp.cardId === card.id || exp.cardName === card.name);
              const cardSpent = cardExpenses.reduce((sum, exp) => sum + exp.amount, 0);
              const availableLimit = Math.max(0, card.limit - cardSpent);
              const { corteDate, pagoDate, daysToCorte, daysToPago, showCorteAlert, showPagoAlert } = getCardDatesAndAlerts(card.corteDay, card.pagoDay);

              return (
                <div key={card.id} className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', position: 'relative', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={18} className="text-purple" />
                        {card.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Cupo Límite: {formatCurrency(card.limit)}
                      </span>
                    </div>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.7rem', borderRadius: '6px' }}
                      onClick={() => onDeleteCreditCard(card.id)}
                    >
                      Eliminar
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Saldo Gastado</span>
                      <div style={{ fontWeight: 800, color: 'var(--accent-rose)', fontSize: '1.1rem' }}>{formatCurrency(cardSpent)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Cupo Disponible</span>
                      <div style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontSize: '1.1rem' }}>{formatCurrency(availableLimit)}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.75rem', paddingTop: '0.75rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Corte: <strong>Día {card.corteDay}</strong> ({corteDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' })})</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 600, marginTop: '0.15rem' }}>{daysToCorte}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pago: <strong>Día {card.pagoDay}</strong> ({pagoDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' })})</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '0.15rem' }}>{daysToPago}</div>
                    </div>
                  </div>

                  {showCorteAlert && cardSpent > 0 && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(244, 162, 97, 0.1)', color: 'var(--accent-gold)', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(244, 162, 97, 0.15)' }}>
                      <AlertCircle size={14} />
                      <span>¡Corte de tarjeta en camino!</span>
                    </div>
                  )}

                  {showPagoAlert && cardSpent > 0 && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(230, 57, 70, 0.1)', color: 'var(--accent-rose)', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(230, 57, 70, 0.15)' }}>
                      <AlertCircle size={14} />
                      <span>Pendiente pago de {formatCurrency(cardSpent)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Card Form inline */}
        <details style={{ marginTop: '1.25rem' }}>
          <summary style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
            + Configurar Nueva Tarjeta de Crédito
          </summary>
          <form onSubmit={handleAddCardSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Nombre Tarjeta</label>
              <input 
                type="text" 
                value={cardNameInput} 
                onChange={(e) => setCardNameInput(e.target.value)} 
                placeholder="Ej. Visa Bancolombia" 
                required 
                style={{ height: '36px', fontSize: '0.85rem' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Cupo de Tarjeta</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={cardLimitInput} 
                onChange={(e) => handleFormatInput(e.target.value, setCardLimitInput)} 
                placeholder="Cupo total" 
                required 
                style={{ height: '36px', fontSize: '0.85rem' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Día de Corte</label>
              <select value={cardCorteInput} onChange={(e) => setCardCorteInput(e.target.value)} style={{ height: '36px', fontSize: '0.85rem' }}>
                {[...Array(31)].map((_, i) => (
                  <option key={i+1} value={i+1}>Día {i+1}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Día de Pago</label>
              <select value={cardPagoInput} onChange={(e) => setCardPagoInput(e.target.value)} style={{ height: '36px', fontSize: '0.85rem' }}>
                {[...Array(31)].map((_, i) => (
                  <option key={i+1} value={i+1}>Día {i+1}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ height: '36px', padding: '0 1rem', width: '100%', fontSize: '0.85rem' }}>
                Añadir Tarjeta
              </button>
            </div>
          </form>
        </details>
      </div>

      {/* Obligaciones del Mes */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Planificador Semanal (Obligaciones Fijas)</h2>
            <p>Monitorea y cumple tus compromisos fijos del mes para que todo rinda a la perfección.</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Cuotas</span>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(totalObligations)}</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Pagado</span>
              <div style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>{formatCurrency(totalPaidObligations)}</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}>Pendiente</span>
              <div style={{ fontWeight: 800, color: 'var(--accent-rose)' }}>{formatCurrency(totalPendingObligations)}</div>
            </div>
          </div>
        </div>

        {/* Obligations list */}
        <div className="table-container" style={{ marginBottom: '1.5rem' }}>
          <table>
            <thead>
              <tr>
                <th>Obligación</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Vencimiento</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Estado</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {obligations.map((ob) => (
                <tr key={ob.id}>
                  <td style={{ fontWeight: 600, opacity: ob.paid ? 0.6 : 1 }}>{ob.description}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'rgba(244,162,97,0.1)', color: 'var(--accent-gold)' }}>
                      {ob.type}
                    </span>
                  </td>
                  <td>{ob.category}</td>
                  <td>{ob.dueDate}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, opacity: ob.paid ? 0.6 : 1 }}>
                    {formatCurrency(ob.amount)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn" 
                      onClick={() => onToggleObligation(ob.id)}
                      style={{ 
                        padding: '0.25rem 0.75rem', 
                        fontSize: '0.75rem', 
                        borderRadius: '20px', 
                        width: 'auto',
                        background: ob.paid ? 'rgba(129, 178, 154, 0.15)' : 'rgba(230, 57, 70, 0.12)',
                        color: ob.paid ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                        border: ob.paid ? '1px solid rgba(129, 178, 154, 0.25)' : '1px solid rgba(230, 57, 70, 0.2)'
                      }}
                    >
                      {ob.paid ? '✓ Pagado' : 'Pendiente'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.4rem', width: 'auto' }}
                      onClick={() => onDeleteObligation(ob.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Obligation Form inline */}
        <details>
          <summary style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
            + Registrar Nueva Obligación Mensual Fija
          </summary>
          <form onSubmit={handleAddObligationSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Descripción</label>
              <input 
                type="text" 
                value={newOblDesc} 
                onChange={(e) => setNewOblDesc(e.target.value)} 
                placeholder="Ej. Pago Plan de Celular..." 
                required 
                style={{ height: '36px', fontSize: '0.85rem' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Monto Fijo</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={newOblAmount} 
                onChange={(e) => handleFormatInput(e.target.value, setNewOblAmount)} 
                placeholder="Monto" 
                required 
                style={{ height: '36px', fontSize: '0.85rem' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Tipo Obligación</label>
              <select value={newOblType} onChange={(e) => setNewOblType(e.target.value)} style={{ height: '36px', fontSize: '0.85rem' }}>
                <option value="Gasto Fijo">Gasto Fijo</option>
                <option value="Servicios Fijos">Servicios Fijos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Categoría</label>
              <select value={newOblCat} onChange={(e) => setNewOblCat(e.target.value)} style={{ height: '36px', fontSize: '0.85rem' }}>
                <option value="Vivienda">Vivienda</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Transporte">Transporte</option>
                <option value="Servicios">Servicios</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Seguros">Seguros</option>
                <option value="Créditos">Créditos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Vencimiento (Mensual)</label>
              <select value={newOblDueDate} onChange={(e) => setNewOblDueDate(e.target.value)} style={{ height: '36px', fontSize: '0.85rem' }}>
                {[...Array(28)].map((_, i) => (
                  <option key={i+1} value={`Día ${i+1 < 10 ? '0' + (i+1) : i+1}`}>Día {i+1 < 10 ? '0' + (i+1) : i+1}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ height: '36px', padding: '0 1rem', width: '100%', fontSize: '0.85rem' }}>
                Crear Obligación
              </button>
            </div>
          </form>
        </details>
      </div>

      {/* Grid: Forms and Distribution Charts */}
      <div className="grid-cols-2">
        {/* Registry Form */}
        <div className="glass-card">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: '8px' }}>
            <button 
              type="button"
              className="btn" 
              onClick={() => { setFormTab('expense'); setCategory('Alimentación'); }} 
              style={{ 
                flex: 1, 
                padding: '0.4rem', 
                fontSize: '0.85rem', 
                borderRadius: '6px', 
                width: 'auto',
                background: formTab === 'expense' ? 'var(--accent-purple)' : 'transparent', 
                color: formTab === 'expense' ? '#120904' : 'var(--text-secondary)'
              }}
            >
              Gasto
            </button>
            <button 
              type="button"
              className="btn" 
              onClick={() => { setFormTab('income'); setCategory('Trabajo Extra'); }} 
              style={{ 
                flex: 1, 
                padding: '0.4rem', 
                fontSize: '0.85rem', 
                borderRadius: '6px', 
                width: 'auto',
                background: formTab === 'income' ? 'var(--accent-emerald)' : 'transparent', 
                color: formTab === 'income' ? '#120904' : 'var(--text-secondary)'
              }}
            >
              Ingreso
            </button>
          </div>

          <h2>{formTab === 'expense' ? 'Registrar Gasto' : 'Registrar Nuevo Ingreso'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Descripción</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={formTab === 'expense' ? "Ej. Compras supermercado..." : "Ej. Facturación Consultoría..."} 
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Monto ($ COP)</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => handleFormatInput(e.target.value, setAmount)}
                  placeholder="Monto" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {formTab === 'expense' ? (
                    <>
                      <option value="Vivienda">Vivienda</option>
                      <option value="Alimentación">Alimentación</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Entretenimiento">Entretenimiento</option>
                      <option value="Seguros">Seguros</option>
                      <option value="Inversiones">Inversiones</option>
                      <option value="Tarjetas de Crédito">Tarjetas de Crédito</option>
                      <option value="Créditos">Créditos</option>
                      <option value="Otros">Otros</option>
                    </>
                  ) : (
                    <>
                      <option value="Sueldo">Sueldo</option>
                      <option value="Trabajo Extra">Trabajo Extra</option>
                      <option value="Honorarios">Honorarios</option>
                      <option value="Otros">Otros</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Fecha</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Credit Card options if checked */}
            {formTab === 'expense' && creditCards.length > 0 && (
              <>
                <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={isCreditCard} 
                      onChange={(e) => {
                        setIsCreditCard(e.target.checked);
                        if (e.target.checked && !selectedCardId) {
                          setSelectedCardId(creditCards[0].id.toString());
                        }
                      }}
                    />
                    <span>¿Pago con Tarjeta de Crédito? 💳</span>
                  </label>
                </div>

                {isCreditCard && (
                  <div className="form-row" style={{ marginTop: '0.5rem', marginBottom: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.75rem' }}>Seleccionar Tarjeta</label>
                      <select value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)}>
                        {creditCards.map(card => (
                          <option key={card.id} value={card.id}>{card.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.75rem' }}>Número de Cuotas</label>
                      <select value={installments} onChange={(e) => setInstallments(e.target.value)}>
                        {[...Array(36)].map((_, i) => (
                          <option key={i+1} value={i+1}>{i+1} {i+1 === 1 ? 'cuota' : 'cuotas'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Plus size={18} />
              <span>{formTab === 'expense' ? 'Agregar Gasto' : 'Registrar Ingreso'}</span>
            </button>
          </form>
        </div>

        {/* Chart Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h2>Distribución Táctica de Gastos</h2>
          {chartData.length === 0 ? (
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Registra gastos para ver tu distribución gráfica. 📊</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#07050d', borderColor: 'rgba(255,255,255,0.08)' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend verticalAlign="bottom" height={45} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* History table */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2>{historyTab === 'expense' ? 'Historial de Gastos Registrados' : 'Historial de Ingresos Registrados'}</h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              type="button"
              className="btn" 
              onClick={() => setHistoryTab('expense')}
              style={{ 
                padding: '0.35rem 0.85rem', 
                fontSize: '0.8rem', 
                borderRadius: '6px', 
                width: 'auto',
                background: historyTab === 'expense' ? 'var(--accent-purple)' : 'transparent', 
                color: historyTab === 'expense' ? '#120904' : 'var(--text-secondary)'
              }}
            >
              Gastos
            </button>
            <button 
              type="button"
              className="btn" 
              onClick={() => setHistoryTab('income')}
              style={{ 
                padding: '0.35rem 0.85rem', 
                fontSize: '0.8rem', 
                borderRadius: '6px', 
                width: 'auto',
                background: historyTab === 'income' ? 'var(--accent-emerald)' : 'transparent', 
                color: historyTab === 'income' ? '#120904' : 'var(--text-secondary)'
              }}
            >
              Ingresos
            </button>
          </div>
        </div>

        {historyTab === 'expense' ? (
          expenses.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay gastos registrados en el historial de este mes.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.date}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{exp.description}</div>
                        {exp.cardName && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', fontWeight: 700, marginTop: '0.15rem' }}>
                            💳 {exp.cardName} ({exp.installments} {exp.installments === 1 ? 'cuota' : 'cuotas'})
                          </div>
                        )}
                      </td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: `${categoriesColors[exp.category]}15`, 
                            color: categoriesColors[exp.category] 
                          }}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {formatCurrency(exp.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.4rem', width: 'auto' }}
                          onClick={() => onDeleteExpense(exp.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          (!incomes || incomes.length === 0) ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay ingresos registrados en el historial de este mes.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((inc) => (
                    <tr key={inc.id}>
                      <td>{inc.date}</td>
                      <td style={{ fontWeight: 600 }}>{inc.description}</td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: 'rgba(129, 178, 154, 0.12)', 
                            color: 'var(--accent-emerald)' 
                          }}
                        >
                          {inc.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {formatCurrency(inc.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.4rem', width: 'auto' }}
                          onClick={() => onDeleteIncome(inc.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
