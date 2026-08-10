import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function InvestmentsTracker({ investments, onAddInvestment, onDeleteInvestment }) {
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState('Efectivo');
  const [amount, setAmount] = useState('');

  // Calculations
  const portfolioCurrentValue = investments.reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0);

  // Group by Asset Type for Chart
  const typeDataMap = investments.reduce((acc, inv) => {
    const value = inv.shares * inv.currentPrice;
    acc[inv.type] = (acc[inv.type] || 0) + value;
    return acc;
  }, {});

  const typeColors = {
    'Efectivo': '#e07a5f',
    'Cuentas Corporativas': '#e76f51',
    'CDT': '#f4a261',
    'Bienes Raíces': '#81b29a',
    'Inversiones': '#9d4edd',
    'Otros': '#8e7365'
  };

  const chartData = Object.keys(typeDataMap).map(type => ({
    name: type,
    value: Math.round(typeDataMap[type]),
    color: typeColors[type] || '#ffffff'
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    const parsedAmount = parseFloat(amount.toString().replace(/\./g, '')) || 0;

    // We store shares: 1, averageCost: parsedAmount, currentPrice: parsedAmount
    // to maintain full backward compatibility with the database schema
    onAddInvestment({
      name,
      type: assetType,
      shares: 1,
      averageCost: parsedAmount,
      currentPrice: parsedAmount
    });

    // Reset Form
    setName('');
    setAmount('');
  };

  return (
    <div className="tab-pane active">
      {/* Header */}
      <div className="top-header">
        <div className="header-title-area">
          <h1>Portafolio de Activos (Ahorros)</h1>
          <p>Controla tus depósitos, cuentas, efectivo y reservas corporativas. 💼📈</p>
        </div>
      </div>

      {/* Portfolio Metrics Card */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="glass-card metric-card cyan" style={{ maxWidth: '400px' }}>
          <div className="metric-header">
            <span className="metric-title">Valor Neto del Portafolio</span>
            <div className="metric-icon-wrapper">
              <TrendingUp size={20} className="text-cyan" />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(portfolioCurrentValue)}</div>
          <div className="metric-footer">
            <span>Suma de todas tus reservas corporativas y cuentas</span>
          </div>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid-cols-2">
        {/* Registry Form */}
        <div className="glass-card">
          <h2>Añadir Nuevo Activo / Ahorro</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Activo / Concepto</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ej. Cuenta de Ahorro Socio, Fondo Colectivo, CDT..." 
                required 
              />
            </div>

            <div className="form-group">
              <label>Tipo de Activo</label>
              <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                <option value="Efectivo">Efectivo / Reservas</option>
                <option value="Cuentas Corporativas">Cuentas Corporativas</option>
                <option value="CDT">CDT / Depósitos</option>
                <option value="Bienes Raíces">Bienes Raíces</option>
                <option value="Inversiones">Inversiones</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div className="form-group">
              <label>Valor / Saldo ($ COP)</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={amount} 
                onChange={(e) => handleFormatInput(e.target.value, setAmount)} 
                placeholder="Ej. 1.200.000" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus size={18} />
              <span>Registrar Activo</span>
            </button>
          </form>
        </div>

        {/* Allocation Chart Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h2>Distribución del Portafolio</h2>
          {chartData.length === 0 ? (
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Agrega activos para ver la distribución del portafolio. 📈</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
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

      {/* Portfolio Table */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h2>Portafolio de Activos</h2>
        {investments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay activos o depósitos registrados.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Activo / Concepto</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Valor Total / Saldo</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => {
                  const val = inv.shares * inv.currentPrice;

                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700 }}>{inv.name}</td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: `${typeColors[inv.type] || '#8e7365'}15`, 
                            color: typeColors[inv.type] || '#8e7365'
                          }}
                        >
                          {inv.type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(val)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.4rem', width: 'auto' }}
                          onClick={() => onDeleteInvestment(inv.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
