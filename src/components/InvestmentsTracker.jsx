import React, { useState } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function InvestmentsTracker({ investments, onAddInvestment, onDeleteInvestment }) {
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState('Acciones');
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  // Calculations
  const portfolioTotalCost = investments.reduce((sum, inv) => sum + (inv.shares * inv.averageCost), 0);
  const portfolioCurrentValue = investments.reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0);
  const totalReturn = portfolioCurrentValue - portfolioTotalCost;
  const returnPercentage = portfolioTotalCost > 0 ? ((totalReturn / portfolioTotalCost) * 100).toFixed(2) : 0;

  // Group by Asset Type for Chart
  const typeDataMap = investments.reduce((acc, inv) => {
    const value = inv.shares * inv.currentPrice;
    acc[inv.type] = (acc[inv.type] || 0) + value;
    return acc;
  }, {});

  const typeColors = {
    'Acciones': '#00f2fe',
    'Criptomonedas': '#ff2a85',
    'Renta Fija': '#ffbe0b',
    'Bienes Raíces': '#05f3a2',
    'ETFs': '#9d4edd',
    'Otros': '#6e6a82'
  };

  const chartData = Object.keys(typeDataMap).map(type => ({
    name: type,
    value: Math.round(typeDataMap[type]),
    color: typeColors[type] || '#ffffff'
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
    if (!name || !shares || !avgCost || !currentPrice) return;

    onAddInvestment({
      name,
      type: assetType,
      shares: parseFloat(shares),
      averageCost: parseFloat(avgCost.toString().replace(/\./g, '')) || 0,
      currentPrice: parseFloat(currentPrice.toString().replace(/\./g, '')) || 0
    });

    // Reset Form
    setName('');
    setShares('');
    setAvgCost('');
    setCurrentPrice('');
  };

  return (
    <div className="tab-pane active">
      {/* Header */}
      <div className="top-header">
        <div className="header-title-area">
          <h1>Seguimiento de Inversiones</h1>
          <p>Portafolio detallado de activos, rendimiento en tiempo real y ROI patrimonial.</p>
        </div>
      </div>

      {/* Portfolio Metrics Card */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-card metric-card cyan">
          <div className="metric-header">
            <span className="metric-title">Valor del Portafolio</span>
            <div className="metric-icon-wrapper">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(portfolioCurrentValue)}</div>
          <div className="metric-footer">
            <span>Costo total invertido: </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(portfolioTotalCost)}</span>
          </div>
        </div>

        <div className="glass-card metric-card emerald">
          <div className="metric-header">
            <span className="metric-title">Retorno Absoluto ($)</span>
            <div className="metric-icon-wrapper">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: totalReturn >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}
          </div>
          <div className="metric-footer">
            <span>Diferencia acumulada neta</span>
          </div>
        </div>

        <div className="glass-card metric-card gold">
          <div className="metric-header">
            <span className="metric-title">Retorno Total (%)</span>
            <div className="metric-icon-wrapper">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: totalReturn >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {totalReturn >= 0 ? '+' : ''}{returnPercentage}%
          </div>
          <div className="metric-footer">
            <span>ROI promedio ponderado</span>
          </div>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid-cols-2">
        {/* Registry Form */}
        <div className="glass-card">
          <h2>Registrar / Modificar Activo</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre del Activo / Símbolo</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ej. AAPL, BTC, S&P 500, Apt. Duplex..." 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Activo</label>
                <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                  <option value="Acciones">Acciones</option>
                  <option value="Criptomonedas">Criptomonedas</option>
                  <option value="Renta Fija">Renta Fija</option>
                  <option value="Bienes Raíces">Bienes Raíces</option>
                  <option value="ETFs">ETFs</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cantidad de Unidades (Shares)</label>
                <input 
                  type="number" 
                  value={shares} 
                  onChange={(e) => setShares(e.target.value)} 
                  placeholder="Ej. 10.5" 
                  min="0"
                  step="any"
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Costo de Compra Promedio ($ COP)</label>
                <input 
                  type="text" 
                  value={avgCost} 
                  onChange={(e) => handleFormatInput(e.target.value, setAvgCost)} 
                  placeholder="Costo Unitario" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Precio Actual de Mercado ($ COP)</label>
                <input 
                  type="text" 
                  value={currentPrice} 
                  onChange={(e) => handleFormatInput(e.target.value, setCurrentPrice)} 
                  placeholder="Precio Actual" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              <Plus size={18} />
              <span>Registrar Activo</span>
            </button>
          </form>
        </div>

        {/* Allocation Chart Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h2>Distribución de Inversiones</h2>
          {chartData.length === 0 ? (
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Agrega activos para ver la distribución de tu portafolio.</p>
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

      {/* Portfolio Table */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h2>Composición del Portafolio</h2>
        {investments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay activos en el portafolio actualmente.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Cantidades</th>
                  <th style={{ textAlign: 'right' }}>Costo Prom.</th>
                  <th style={{ textAlign: 'right' }}>Precio Act.</th>
                  <th style={{ textAlign: 'right' }}>Valor Total</th>
                  <th style={{ textAlign: 'right' }}>Rendimiento ($)</th>
                  <th style={{ textAlign: 'right' }}>Rendimiento (%)</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => {
                  const cost = inv.shares * inv.averageCost;
                  const val = inv.shares * inv.currentPrice;
                  const ret = val - cost;
                  const retPct = cost > 0 ? ((ret / cost) * 100).toFixed(2) : 0;
                  const isPositive = ret >= 0;

                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700 }}>{inv.name}</td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: `${typeColors[inv.type]}15`, 
                            color: typeColors[inv.type] 
                          }}
                        >
                          {inv.type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{inv.shares}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(inv.averageCost)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(inv.currentPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(val)}</td>
                      <td 
                        style={{ 
                          textAlign: 'right', 
                          fontWeight: 600,
                          color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)' 
                        }}
                      >
                        {isPositive ? '+' : ''}{formatCurrency(ret)}
                      </td>
                      <td 
                        style={{ 
                          textAlign: 'right', 
                          fontWeight: 700,
                          color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)' 
                        }}
                      >
                        {isPositive ? '+' : ''}{retPct}%
                      </td>
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
