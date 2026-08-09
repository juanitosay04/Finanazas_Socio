import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

export default function ProjectionsCalculator() {
  // Main Projection Inputs
  const [initialAmount, setInitialAmount] = useState(10000000);
  const [monthlyContribution, setMonthlyContribution] = useState(500000);
  const [interestRate, setInterestRate] = useState(8);
  const [years, setYears] = useState(15);

  // Target Goal Calculator Inputs
  const [targetGoal, setTargetGoal] = useState(500000000);
  const [targetYears, setTargetYears] = useState(20);
  const [targetRate, setTargetRate] = useState(9);

  // Format currency helper
  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '$ 0';
    const isNegative = val < 0;
    const absVal = Math.round(Math.abs(val));
    const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${isNegative ? '-' : ''}$ ${formatted}`;
  };

  const formatNumberInput = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumberInput = (value) => {
    const clean = value.replace(/\D/g, '');
    return parseFloat(clean) || 0;
  };

  // Compound Interest Calculation
  const projectionData = useMemo(() => {
    const data = [];
    const monthlyRate = interestRate / 100 / 12;
    let totalValue = initialAmount;
    let totalInvested = initialAmount;

    // Add year 0
    data.push({
      year: 0,
      'Total Aportado': Math.round(totalInvested),
      'Capital Final': Math.round(totalValue),
      'Interés Ganado': 0
    });

    for (let year = 1; year <= years; year++) {
      for (let month = 1; month <= 12; month++) {
        totalValue = (totalValue + monthlyContribution) * (1 + monthlyRate);
        totalInvested += monthlyContribution;
      }
      data.push({
        year: year,
        'Total Aportado': Math.round(totalInvested),
        'Capital Final': Math.round(totalValue),
        'Interés Ganado': Math.round(totalValue - totalInvested)
      });
    }
    return data;
  }, [initialAmount, monthlyContribution, interestRate, years]);

  const finalMetrics = projectionData[projectionData.length - 1];

  // Target Goal Calculation
  const requiredMonthlyContribution = useMemo(() => {
    const rate = targetRate / 100 / 12;
    const months = targetYears * 12;
    if (rate === 0) return targetGoal / months;
    
    // Formula: PMT = (FV * r) / ((1 + r)^n - 1)
    const numerator = targetGoal * rate;
    const denominator = Math.pow(1 + rate, months) - 1;
    return numerator / denominator;
  }, [targetGoal, targetYears, targetRate]);

  return (
    <div className="tab-pane active">
      <div className="top-header">
        <div className="header-title-area">
          <h1>Proyecciones y Planificación</h1>
          <p>Calcula el crecimiento a largo plazo y planifica metas financieras futuras.</p>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid-cols-3">
        {/* Inputs Form */}
        <div className="glass-card col-span-1" style={{ height: 'fit-content' }}>
          <h2>Parámetros de Simulación</h2>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Capital Inicial</label>
              <span className="text-cyan font-bold">{formatCurrency(initialAmount)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="500000000" 
              step="1000000"
              value={initialAmount} 
              onChange={(e) => setInitialAmount(parseFloat(e.target.value))}
            />
            <input 
              type="text" 
              value={formatNumberInput(initialAmount)} 
              onChange={(e) => setInitialAmount(parseNumberInput(e.target.value))}
              style={{ marginTop: '-5px' }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Aporte Mensual</label>
              <span className="text-cyan font-bold">{formatCurrency(monthlyContribution)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="20000000" 
              step="100000"
              value={monthlyContribution} 
              onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
            />
            <input 
              type="text" 
              value={formatNumberInput(monthlyContribution)} 
              onChange={(e) => setMonthlyContribution(parseNumberInput(e.target.value))}
              style={{ marginTop: '-5px' }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Rendimiento Anual Estimado (%)</label>
              <span className="text-cyan font-bold">{interestRate}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="25" 
              step="0.5"
              value={interestRate} 
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            />
            <input 
              type="number" 
              value={interestRate} 
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              style={{ marginTop: '-5px' }}
            />
          </div>

          <div className="form-group">
            <label>Plazo de la Proyección (Años)</label>
            <select value={years} onChange={(e) => setYears(parseInt(e.target.value))}>
              <option value={5}>5 Años</option>
              <option value={10}>10 Años</option>
              <option value={15}>15 Años</option>
              <option value={20}>20 Años</option>
              <option value={25}>25 Años</option>
              <option value={30}>30 Años</option>
              <option value={40}>40 Años</option>
            </select>
          </div>
        </div>

        {/* Chart Area */}
        <div className="glass-card col-span-2" style={{ gridColumn: 'span 2' }}>
          <h2>Crecimiento Patrimonial Proyectado</h2>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#6e6a82" fontSize={11} label={{ value: 'Años', position: 'insideBottom', offset: -5, fill: '#6e6a82' }} />
                <YAxis stroke="#6e6a82" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#120e24', borderColor: 'rgba(255,255,255,0.1)' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Total Aportado" stroke="#ff2a85" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Capital Final" stroke="#00f2fe" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Results metrics inside the chart card */}
          <div className="grid-cols-3" style={{ marginTop: '1.5rem', marginBottom: 0, gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ahorro Total Aportado</span>
              <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', color: 'var(--accent-rose)' }}>
                {formatCurrency(finalMetrics['Total Aportado'])}
              </h3>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Intereses Ganados</span>
              <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', color: 'var(--accent-emerald)' }}>
                {formatCurrency(finalMetrics['Interés Ganado'])}
              </h3>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Capital Final Acumulado</span>
              <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', color: 'var(--accent-cyan)' }}>
                {formatCurrency(finalMetrics['Capital Final'])}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Target Goal Calculator */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Sparkles className="text-gold" size={24} />
          <h2>Planificador de Metas (Ahorro Inteligente)</h2>
        </div>
        
        <p style={{ marginBottom: '1.5rem' }}>
          ¿Tienes una meta en mente? Calcula exactamente cuánto necesitas aportar al mes para alcanzar tu patrimonio objetivo, considerando una tasa de capitalización compuesta.
        </p>

        <div className="grid-cols-4" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Meta Financiera Objetivo</label>
            <input 
              type="text" 
              value={formatNumberInput(targetGoal)} 
              onChange={(e) => setTargetGoal(parseNumberInput(e.target.value))}
              placeholder="Ej. 1.000.000"
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatCurrency(targetGoal)}</span>
          </div>

          <div className="form-group">
            <label>Plazo para Lograrlo (Años)</label>
            <input 
              type="number" 
              value={targetYears} 
              onChange={(e) => setTargetYears(parseInt(e.target.value) || 1)}
              placeholder="Ej. 20"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Rendimiento Anual Esperado (%)</label>
            <input 
              type="number" 
              value={targetRate} 
              onChange={(e) => setTargetRate(parseFloat(e.target.value) || 0)}
              placeholder="Ej. 8"
              step="0.5"
            />
          </div>

          <div className="metric-card gold" style={{ background: 'rgba(255, 190, 11, 0.05)', border: '1px solid rgba(255, 190, 11, 0.15)', padding: '1rem', borderRadius: '12px' }}>
            <div className="metric-header" style={{ marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ color: 'var(--accent-gold)' }}>Aporte Mensual Requerido</span>
              <TrendingUp size={16} className="text-gold" />
            </div>
            <div className="metric-value text-gold" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
              {formatCurrency(requiredMonthlyContribution)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Durante {targetYears} años al {targetRate}% anual
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
