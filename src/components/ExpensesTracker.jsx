import React, { useState } from 'react';
import { Plus, Trash2, Receipt, DollarSign, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function ExpensesTracker({ 
  expenses, 
  onAddExpense, 
  onDeleteExpense, 
  incomes = [],
  onAddIncome,
  onDeleteIncome,
  obligations = [], 
  onToggleObligation, 
  onAddObligation, 
  onDeleteObligation,
  config
}) {
  const [formTab, setFormTab] = useState('expense'); // 'expense' or 'income'
  const [historyTab, setHistoryTab] = useState('expense'); // 'expense' or 'income'
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentación');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // States for new Monthly Obligation Form
  const [newOblDesc, setNewOblDesc] = useState('');
  const [newOblAmount, setNewOblAmount] = useState('');
  const [newOblType, setNewOblType] = useState('Gasto Fijo');
  const [newOblCat, setNewOblCat] = useState('Servicios');
  const [newOblDueDate, setNewOblDueDate] = useState('Día 15');

  // Calculations
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetLimit = config?.monthlyBudget || 8800000; // Adjusted budget limit dynamically
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
    'Vivienda': '#00f2fe',
    'Alimentación': '#05f3a2',
    'Transporte': '#9d4edd',
    'Servicios': '#ffbe0b',
    'Entretenimiento': '#ff2a85',
    'Seguros': '#8a2be2',
    'Inversiones': '#00f5a0',
    'Tarjetas de Crédito': '#c084fc',
    'Créditos': '#ff007f',
    'Otros': '#6e6a82'
  };

  const chartData = Object.keys(categoriesDataMap).map(cat => ({
    name: cat,
    value: categoriesDataMap[cat],
    color: categoriesColors[cat] || '#ffffff'
  }));

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const parsedAmount = parseFloat(amount.toString().replace(/\./g, '')) || 0;

    if (formTab === 'expense') {
      onAddExpense({
        description,
        amount: parsedAmount,
        category,
        date
      });
    } else {
      onAddIncome({
        description,
        amount: parsedAmount,
        category: category === 'Alimentación' ? 'Trabajo Extra' : category, // Safeguard fallback
        date
      });
    }

    // Reset form
    setDescription('');
    setAmount('');
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
          <p>Presupuestos mensuales por categorías y registro de consumos.</p>
        </div>
      </div>

      {/* Budget Limit Card */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Límite de Presupuesto Mensual</span>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>
              {formatCurrency(totalExpenses)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>de {formatCurrency(budgetLimit)}</span>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Porcentaje Gastado</span>
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
            <span>Alerta: Has superado el 90% de tu límite presupuestario mensual.</span>
          </div>
        )}
      </div>

      {/* Obligaciones del Mes */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Obligaciones Mensuales (Gastos Fijos y Créditos)</h2>
            <p>Monitorea y paga tus compromisos obligatorios, préstamos y tarjetas de crédito.</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Obligaciones</span>
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
                <th style={{ width: '50px', textAlign: 'center' }}>Estado</th>
                <th>Concepto / Obligación</th>
                <th>Tipo</th>
                <th>Fecha Límite</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {obligations && obligations.map((ob) => (
                <tr key={ob.id} style={{ opacity: ob.paid ? 0.65 : 1, transition: 'opacity 0.2s ease' }}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={ob.paid} 
                      onChange={() => onToggleObligation(ob.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
                    />
                  </td>
                  <td style={{ fontWeight: 700, textDecoration: ob.paid ? 'line-through' : 'none' }}>
                    {ob.description}
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      {ob.type}
                    </span>
                  </td>
                  <td style={{ color: ob.paid ? 'var(--text-muted)' : 'var(--accent-gold)', fontWeight: 600 }}>
                    {ob.dueDate}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, textDecoration: ob.paid ? 'line-through' : 'none' }}>
                    {formatCurrency(ob.amount)}
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
              {(!obligations || obligations.length === 0) && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay obligaciones recurrentes registradas. Agrega una abajo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Form to add obligation */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Agregar Obligación Mensual Recurrente</h3>
          <form onSubmit={handleAddObligationSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr)) auto', gap: '0.75rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem' }}>Concepto / Nombre</label>
              <input 
                type="text" 
                placeholder="Ej. Tarjeta VISA" 
                value={newOblDesc} 
                onChange={(e) => setNewOblDesc(e.target.value)}
                required
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem' }}>Monto ($ COP)</label>
              <input 
                type="text" 
                placeholder="Monto" 
                value={newOblAmount} 
                onChange={(e) => handleFormatInput(e.target.value, setNewOblAmount)}
                required
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem' }}>Tipo de Obligación</label>
              <select 
                value={newOblType} 
                onChange={(e) => setNewOblType(e.target.value)}
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="Gasto Fijo">Gasto Fijo</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Crédito Hipotecario">Crédito Hipotecario</option>
                <option value="Crédito Vehicular">Crédito Vehicular</option>
                <option value="Crédito Libre Inversión">Crédito Libre Inversión</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem' }}>Categoría de Gasto</label>
              <select 
                value={newOblCat} 
                onChange={(e) => setNewOblCat(e.target.value)}
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="Vivienda">Vivienda</option>
                <option value="Transporte">Transporte</option>
                <option value="Servicios">Servicios</option>
                <option value="Seguros">Seguros</option>
                <option value="Tarjetas de Crédito">Tarjetas de Crédito</option>
                <option value="Créditos">Créditos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem' }}>Vencimiento (Día)</label>
              <input 
                type="text" 
                placeholder="Ej. Día 15" 
                value={newOblDueDate} 
                onChange={(e) => setNewOblDueDate(e.target.value)}
                required
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', height: 'fit-content', width: 'auto' }}>
              <Plus size={16} />
              <span>Añadir</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid-cols-2">
        {/* Form and Categories limit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Form */}
          <div className="glass-card">
            {/* Form Tab Selector */}
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

            <h2>{formTab === 'expense' ? 'Registrar Nuevo Gasto' : 'Registrar Nuevo Ingreso'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descripción</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={formTab === 'expense' ? "Ej. Mercado Semanal, Gasolina..." : "Ej. Factura Consultoría..."} 
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

              <button type="submit" className="btn btn-primary">
                <Plus size={18} />
                <span>{formTab === 'expense' ? 'Agregar Gasto' : 'Registrar Ingreso'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Chart Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h2>Distribución de Gastos</h2>
          {chartData.length === 0 ? (
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Agrega gastos para visualizar el desglose.</p>
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
                    contentStyle={{ backgroundColor: '#120e24', borderColor: 'rgba(255,255,255,0.1)' }}
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
          <h2>{historyTab === 'expense' ? 'Detalle Histórico de Egresos' : 'Historial de Ingresos Registrados'}</h2>
          
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
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay gastos registrados en este período.</p>
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
                      <td style={{ fontWeight: 600 }}>{exp.description}</td>
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
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay ingresos registrados en este período.</p>
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
                            backgroundColor: 'rgba(5, 243, 162, 0.12)', 
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
