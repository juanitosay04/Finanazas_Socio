import React, { useState } from 'react';
import { Plus, Trash2, PiggyBank, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SavingsGoals({ savingsGoals, onAddSavingsGoal, onDeleteSavingsGoal, onDepositToSavingsGoal, onWithdrawFromSavingsGoal }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Transaction state per goal ID for quick deposits/withdrawals
  const [actionAmounts, setActionAmounts] = useState({});

  // Helper to format currency
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

  const handleActionAmountChange = (goalId, value) => {
    const clean = value.replace(/\D/g, '');
    const formatted = clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setActionAmounts(prev => ({
      ...prev,
      [goalId]: formatted
    }));
  };

  const getMonthsRemaining = (targetDateStr) => {
    if (!targetDateStr) return 1;
    const today = new Date();
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    if (diffTime <= 0) return 1;
    
    const months = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    return months <= 0 ? 1 : months;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetDate) return;

    const parsedTarget = parseFloat(targetAmount.toString().replace(/\./g, '')) || 0;
    const parsedInitial = parseFloat(initialAmount.toString().replace(/\./g, '')) || 0;

    onAddSavingsGoal({
      name,
      targetAmount: parsedTarget,
      currentAmount: parsedInitial,
      targetDate
    });

    // Reset Form
    setName('');
    setTargetAmount('');
    setInitialAmount('');
    setTargetDate('');
  };

  const handleAction = (goalId, type) => {
    const rawVal = actionAmounts[goalId] || '';
    const parsedVal = parseFloat(rawVal.replace(/\./g, '')) || 0;
    if (parsedVal <= 0) return;

    if (type === 'deposit') {
      onDepositToSavingsGoal(goalId, parsedVal);
    } else {
      onWithdrawFromSavingsGoal(goalId, parsedVal);
    }

    // Reset action amount for this goal
    setActionAmounts(prev => ({
      ...prev,
      [goalId]: ''
    }));
  };

  return (
    <div className="tab-pane active">
      {/* Header */}
      <div className="top-header">
        <div className="header-title-area">
          <h1>Bolsillos de Fondos Tácticos (Metas)</h1>
          <p>Asegura la liquidez para adquisiciones futuras, proyectos de expansión y reservas estratégicas. 💼📈</p>
        </div>
      </div>

      {/* Grid: Forms and Goals list */}
      <div className="grid-cols-3">
        {/* Create Pocket Form */}
        <div className="glass-card col-span-1" style={{ height: 'fit-content' }}>
          <h2>Crear Nuevo Bolsillo</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Nombre del Bolsillo / Concepto</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ej. Adquisición Inmueble, Próxima Inversión..." 
                required 
              />
            </div>

            <div className="form-group">
              <label>Monto Objetivo ($ COP)</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={targetAmount} 
                onChange={(e) => handleFormatInput(e.target.value, setTargetAmount)} 
                placeholder="Ej. 10.000.000" 
                required 
              />
            </div>

            <div className="form-group">
              <label>Capital Inicial Aportado (Opcional)</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={initialAmount} 
                onChange={(e) => handleFormatInput(e.target.value, setInitialAmount)} 
                placeholder="Ej. 1.000.000" 
              />
            </div>

            <div className="form-group">
              <label>Fecha Objetivo de Liquidación</label>
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus size={18} />
              <span>Crear Bolsillo</span>
            </button>
          </form>
        </div>

        {/* Goals List (Spans 2 columns) */}
        <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {savingsGoals.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <PiggyBank size={48} className="text-cyan" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
              <h3>No hay bolsillos de fondos tácticos activos</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Crea tu primer bolsillo a la izquierda para empezar a acumular reservas para tus proyectos y compras corporativas. 📈✨</p>
            </div>
          ) : (
            savingsGoals.map((goal) => {
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const progressPct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              const monthsRemaining = getMonthsRemaining(goal.targetDate);
              const monthlyRecommended = monthsRemaining > 0 ? Math.round(remaining / monthsRemaining) : remaining;

              const actionVal = actionAmounts[goal.id] || '';

              return (
                <div key={goal.id} className="glass-card" style={{ borderLeft: `5px solid ${progressPct === 100 ? 'var(--accent-emerald)' : 'var(--accent-cyan)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={20} className="text-cyan" />
                        {goal.name}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Fecha objetivo: {new Date(goal.targetDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                      </p>
                    </div>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.4rem', width: 'auto', borderRadius: '8px' }}
                      onClick={() => onDeleteSavingsGoal(goal.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div style={{ margin: '1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Progreso de Ahorro</span>
                      <span style={{ color: progressPct === 100 ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}>{progressPct}%</span>
                    </div>
                    <div className="budget-progress-bar" style={{ height: '10px' }}>
                      <div 
                        className={`budget-progress-fill ${progressPct === 100 ? 'success' : progressPct > 70 ? 'warning' : ''}`}
                        style={{ 
                          width: `${progressPct}%`,
                          background: progressPct === 100 ? 'linear-gradient(90deg, var(--accent-emerald) 0%, #a8dadc 100%)' : 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)' 
                        }}
                      />
                    </div>
                  </div>

                  {/* Info Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ahorrado</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', marginTop: '0.15rem' }}>{formatCurrency(goal.currentAmount)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Meta Objetivo</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', marginTop: '0.15rem' }}>{formatCurrency(goal.targetAmount)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Falta Ahorrar</div>
                      <div style={{ fontWeight: 700, color: remaining === 0 ? 'var(--accent-emerald)' : 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.15rem' }}>{formatCurrency(remaining)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Recomendado Mensual</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '1.05rem', marginTop: '0.15rem' }}>
                        {remaining === 0 ? '$ 0' : `${formatCurrency(monthlyRecommended)} / mes`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>({monthsRemaining} {monthsRemaining === 1 ? 'mes' : 'meses'} restan)</div>
                    </div>
                  </div>

                  {/* Actions inline */}
                  {remaining > 0 && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flexGrow: 1, minWidth: '150px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>$</span>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          value={actionVal} 
                          onChange={(e) => handleActionAmountChange(goal.id, e.target.value)} 
                          placeholder="Monto a mover..." 
                          style={{ paddingLeft: '1.75rem', height: '38px', borderRadius: '10px' }}
                        />
                      </div>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0 1rem', height: '38px', borderRadius: '10px', fontSize: '0.85rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', flexGrow: 0 }}
                        onClick={() => handleAction(goal.id, 'withdraw')}
                        disabled={goal.currentAmount <= 0}
                      >
                        <ArrowDownRight size={16} className="text-rose" />
                        <span>Retirar</span>
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0 1.25rem', height: '38px', borderRadius: '10px', fontSize: '0.85rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', flexGrow: 0 }}
                        onClick={() => handleAction(goal.id, 'deposit')}
                      >
                        <ArrowUpRight size={16} />
                        <span>Abonar</span>
                      </button>
                    </div>
                  )}

                  {remaining === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.95rem', backgroundColor: 'rgba(129, 178, 154, 0.08)', padding: '0.6rem 1rem', borderRadius: '8px', width: 'fit-content' }}>
                      ✨ ¡Fondo táctico consolidado! Meta cumplida.
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.2rem 0.6rem', height: '28px', fontSize: '0.75rem', width: 'auto', marginLeft: '1rem', border: '1px solid rgba(129, 178, 154, 0.2)' }}
                        onClick={() => onWithdrawFromSavingsGoal(goal.id, goal.currentAmount)}
                      >
                        Retirar todo el fondo
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
