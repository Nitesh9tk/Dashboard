'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelper, UserSession } from '@/lib/auth';
import { dataService } from '@/lib/data-service';
import {
  MockClient, MockProject, MockMeeting, MockInvoice,
  MockEmployee, MockTask, MockExpense,
} from '@/lib/mock-data';
import {
  TrendingUp, TrendingDown, Users, Briefcase, Calendar,
  Activity, Plus, Wallet, Clock, CheckSquare, ChevronRight,
  AlertCircle, IndianRupee, Search, Bell, Moon, Sun,
  Download, CreditCard, User, ChevronDown, MoreHorizontal,
  Zap, Target, ArrowUpRight, ArrowDownRight, Eye,
  FileText, UserPlus, Receipt, CalendarPlus, BarChart3,
  AlertTriangle, Sparkles, ArrowRight, Video,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Revenue Chart — Interactive with Liquid Glass Tooltip
// ═══════════════════════════════════════════════════════════════
const CHART_POINTS = [
  { x: 15,  y: 130, date: '1 Jun',  value: 22000  },
  { x: 110, y: 100, date: '6 Jun',  value: 38000  },
  { x: 205, y: 115, date: '11 Jun', value: 31000  },
  { x: 300, y: 50,  date: '16 Jun', value: 65400  },
  { x: 395, y: 80,  date: '21 Jun', value: 48000  },
  { x: 485, y: 70,  date: '23 Jun', value: 52000  },
];

function RevenueChart({ totalRevenue: _totalRevenue }: { totalRevenue: number }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 500;

    // Find nearest point based purely on X coordinate for horizontal snapping
    let nearest = -1;
    let minDist = Infinity;
    CHART_POINTS.forEach((pt, i) => {
      const dist = Math.abs(pt.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });

    if (minDist < 60) {
      setHovered(nearest);
    } else {
      setHovered(null);
    }
  }, []);

  const activePoint = hovered !== null && hovered >= 0 ? CHART_POINTS[hovered] : null;
  const leftPercent = activePoint ? (activePoint.x / 500) * 100 : 0;
  const topPercent = activePoint ? (activePoint.y / 160) * 100 : 0;

  return (
    <div style={{ height: 200, position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 500 160"
        style={{ width: '100%', height: '100%', cursor: 'crosshair', overflow: 'visible' }}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
          </linearGradient>
          <linearGradient id="verticalGlowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[40, 80, 120].map(y => (
          <line key={y} x1="0" y1={y} x2="500" y2={y}
            stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="4,6" />
        ))}

        {/* Area fill */}
        <path
          d="M 15 130 C 60 120, 80 95, 110 100 C 140 105, 170 125, 205 115 C 240 105, 270 50, 300 50 C 330 50, 360 85, 395 80 C 430 75, 460 70, 485 70 L 485 160 L 15 160 Z"
          fill="url(#revenueGrad)"
        />

        {/* Ambient neon tube glow line */}
        <path
          d="M 15 130 C 60 120, 80 95, 110 100 C 140 105, 170 125, 205 115 C 240 105, 270 50, 300 50 C 330 50, 360 85, 395 80 C 430 75, 460 70, 485 70"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.3"
          filter="url(#glowFilter)"
        />

        {/* Main line */}
        <path
          d="M 15 130 C 60 120, 80 95, 110 100 C 140 105, 170 125, 205 115 C 240 105, 270 50, 300 50 C 330 50, 360 85, 395 80 C 430 75, 460 70, 485 70"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glowFilter)"
        />

        {/* Vertical guideline on hover */}
        {activePoint && (
          <line
            x1={activePoint.x} y1="0"
            x2={activePoint.x} y2="160"
            stroke="url(#verticalGlowGrad)"
            strokeWidth="1.5"
          />
        )}

        {/* Data points */}
        {CHART_POINTS.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x} cy={pt.y} r="20"
              fill="transparent"
              style={{ cursor: 'pointer' }}
            />
            <circle
              cx={pt.x} cy={pt.y}
              r={hovered === i ? 6.5 : 4}
              fill={hovered === i ? '#3b82f6' : 'var(--bg-card)'}
              stroke="#3b82f6"
              strokeWidth="2.5"
              style={{ transition: 'r 150ms ease, fill 150ms ease' }}
            />
            {hovered === i && (
              <g>
                <circle cx={pt.x} cy={pt.y} r="10"
                  fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.6"
                />
                <circle cx={pt.x} cy={pt.y} r="14"
                  fill="#3b82f6" fillOpacity="0.15"
                />
              </g>
            )}
          </g>
        ))}
      </svg>

      {/* X-axis labels */}
      <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
        {CHART_POINTS.map(pt => (
          <span key={pt.date} style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>{pt.date}</span>
        ))}
      </div>

      {/* Floating HTML Liquid Glass Tooltip */}
      {activePoint && (
        <div
          style={{
            position: 'absolute',
            left: `${leftPercent}%`,
            top: `${topPercent - 8}%`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 50,
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-primary)',
            borderRadius: 12,
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(67, 97, 238, 0.25), 0 0 0 1px rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 125,
            animation: 'scaleIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            transition: 'left 150ms ease, top 150ms ease',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {activePoint.date}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            ₹{activePoint.value.toLocaleString('en-IN')}
          </span>
          <div style={{
            fontSize: 9,
            fontWeight: 600,
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 2
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
            Verified Revenue
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KPI Card — Clean, support highlight and dot grids
// ═══════════════════════════════════════════════════════════════
function KpiCard({ label, value, sub, icon: Icon, iconBg, trend, trendUp, highlighted = false }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; iconBg: string;
  trend?: string; trendUp?: boolean;
  highlighted?: boolean;
}) {
  const cardBg = highlighted
    ? 'linear-gradient(135deg, #4361ee 0%, #7b2fff 100%)'
    : 'var(--bg-card)';
  
  const textColor = highlighted ? '#ffffff' : 'var(--text-primary)';
  const labelColor = highlighted ? '#e0e7ff' : 'var(--text-muted)';
  const subColor = highlighted ? '#c4d0ff' : 'var(--text-muted)';
  
  return (
    <div className={`card card-interactive ${!highlighted ? 'kpi-card-dotted' : ''}`} style={{
      padding: 22,
      background: cardBg,
      minHeight: 136,
      position: 'relative',
      overflow: 'hidden',
      border: highlighted ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--border-primary)',
      boxShadow: highlighted ? '0 10px 30px rgba(67, 97, 238, 0.3)' : 'var(--card-shadow)',
    }}>
      {highlighted && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)', pointerEvents: 'none' }} />
      )}
      {!highlighted && (
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', pointerEvents: 'none' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, zIndex: 1 }}>
          <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: labelColor, marginBottom: 10 }}>{label}</p>
          <h3 style={{ fontSize: 26, fontWeight: 700, color: textColor, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</h3>
          {sub && <p style={{ fontSize: 11, color: subColor, marginTop: 7, fontWeight: 500 }}>{sub}</p>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, zIndex: 1 }}>
          {trend && (
            <span className={highlighted ? 'badge-blue' : (trendUp ? 'badge-success' : 'badge-danger')} style={{
              fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3,
              ...(highlighted ? { background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' } : {})
            }}>
              {trendUp ? <ArrowUpRight style={{ width: 11, height: 11 }} /> : <ArrowDownRight style={{ width: 11, height: 11 }} />}
              {trend}
            </span>
          )}
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: highlighted ? 'rgba(255, 255, 255, 0.2)' : iconBg,
            border: highlighted ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
            boxShadow: highlighted ? 'none' : '0 4px 18px rgba(0,0,0,0.25)',
          }}>
            <Icon style={{ width: 20, height: 20, color: '#ffffff' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Customer Habits — Rounded Column bar chart
// ═══════════════════════════════════════════════════════════════
function CustomerHabitsChart() {
  const data = [
    { month: 'Jan', value: 65, amount: '₹4.2L' },
    { month: 'Feb', value: 45, amount: '₹2.9L' },
    { month: 'Mar', value: 85, amount: '₹5.5L' },
    { month: 'Apr', value: 55, amount: '₹3.6L' },
    { month: 'May', value: 75, amount: '₹4.8L' },
    { month: 'Jun', value: 95, amount: '₹6.1L' },
  ];
  
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, paddingBottom: 10, position: 'relative' }}>
        {data.map((item, idx) => (
          <div
            key={item.month}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', position: 'relative' }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* The vertical bar track */}
            <div style={{
              width: 14,
              height: 100,
              background: 'var(--bg-tertiary)',
              borderRadius: 20,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Value fill */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${item.value}%`,
                background: 'linear-gradient(to top, #4361ee, #7b2fff)',
                borderRadius: 20,
                transition: 'height 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 0 10px rgba(67, 97, 238, 0.4)',
              }} />
            </div>
            
            {/* Label */}
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{item.month}</span>
            
            {/* Tooltip */}
            {hoveredIdx === idx && (
              <div style={{
                position: 'absolute',
                bottom: 125,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--border-primary)',
                borderRadius: 10,
                padding: '6px 10px',
                boxShadow: '0 8px 24px rgba(67, 97, 238, 0.25)',
                zIndex: 100,
                whiteSpace: 'nowrap',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: 'scaleIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.month} Revenue</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.amount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Product Statistics — Donut Chart
// ═══════════════════════════════════════════════════════════════
function ProductStatisticsChart() {
  const products = [
    { label: 'SaaS Platform', value: 45, color: '#4361ee', amount: '₹1.8L' },
    { label: 'Enterprise', value: 25, color: '#7b2fff', amount: '₹1.0L' },
    { label: 'Consulting', value: 20, color: '#4cc9f0', amount: '₹80K' },
    { label: 'Support Services', value: 10, color: '#f72585', amount: '₹40K' },
  ];
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {/* SaaS */}
          <circle cx="18" cy="18" r="14" fill="none" stroke="#4361ee" strokeWidth="4.5" strokeDasharray="39.6 88" strokeDashoffset="0" />
          {/* Enterprise */}
          <circle cx="18" cy="18" r="14" fill="none" stroke="#7b2fff" strokeWidth="4.5" strokeDasharray="22 88" strokeDashoffset="-39.6" />
          {/* Consulting */}
          <circle cx="18" cy="18" r="14" fill="none" stroke="#4cc9f0" strokeWidth="4.5" strokeDasharray="17.6 88" strokeDashoffset="-61.6" />
          {/* Support */}
          <circle cx="18" cy="18" r="14" fill="none" stroke="#f72585" strokeWidth="4.5" strokeDasharray="8.8 88" strokeDashoffset="-79.2" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>₹4.0L</span>
          <span style={{ fontSize: 7.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 120 }}>
        {products.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--text-secondary)' }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Customer Growth — Overlapping Bubble Chart
// ═══════════════════════════════════════════════════════════════
function CustomerGrowthChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const bubbles = [
    { country: 'USA', flag: '🇺🇸', pct: '48%', size: 70, x: 10, y: 15, grad: 'linear-gradient(135deg, #4361ee, #7b2fff)', glow: 'rgba(67, 97, 238, 0.4)' },
    { country: 'India', flag: '🇮🇳', pct: '32%', size: 60, x: 70, y: 50, grad: 'linear-gradient(135deg, #7b2fff, #f72585)', glow: 'rgba(123, 47, 255, 0.4)' },
    { country: 'UK', flag: '🇬🇧', pct: '12%', size: 50, x: 125, y: 10, grad: 'linear-gradient(135deg, #4cc9f0, #4361ee)', glow: 'rgba(76, 201, 240, 0.4)' },
    { country: 'Germany', flag: '🇩🇪', pct: '8%', size: 44, x: 170, y: 60, grad: 'linear-gradient(135deg, #f72585, #ffd166)', glow: 'rgba(247, 37, 133, 0.4)' },
  ];
  
  return (
    <div style={{ position: 'relative', height: 120, width: '100%', overflow: 'hidden' }}>
      {bubbles.map((b, idx) => {
        const isHovered = hoveredIdx === idx;
        return (
          <div
            key={b.country}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: b.size,
              height: b.size,
              borderRadius: '50%',
              background: b.grad,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: isHovered ? `0 10px 24px ${b.glow}` : `0 4px 12px rgba(0,0,0,0.15)`,
              transform: isHovered ? 'scale(1.15) translateZ(0)' : 'scale(1) translateZ(0)',
              zIndex: isHovered ? 10 : idx,
              cursor: 'pointer',
              transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span style={{ fontSize: b.size > 55 ? 16 : 12, lineHeight: 1 }}>{b.flag}</span>
            <span style={{ fontSize: b.size > 55 ? 9 : 8, fontWeight: 600, opacity: 0.9, marginTop: 1 }}>{b.country}</span>
            <span style={{ fontSize: b.size > 55 ? 12 : 10, fontWeight: 700, marginTop: 1 }}>{b.pct}</span>
          </div>
        );
      })}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// Section Card Wrapper
// ═══════════════════════════════════════════════════════════════
function SectionCard({ title, subtitle, children, action, actionLabel, actionHref, headerRight }: {
  title: string; subtitle?: string; children: React.ReactNode;
  action?: () => void; actionLabel?: string; actionHref?: string;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ background: 'var(--bg-card)', overflow: 'hidden' }}>
      <div style={{
        padding: '16px 22px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
      }}>
        <div>
          <h2 style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{subtitle}</p>}
        </div>
        {headerRight || (
          actionHref ? (
            <Link href={actionHref} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', opacity: 0.9 }}>
              {actionLabel || 'View All'} <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          ) : action ? (
            <button onClick={action} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {actionLabel} <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          ) : null
        )}
      </div>
      <div style={{ padding: 22 }}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Quick Action Button — Glassmorphism
// ═══════════════════════════════════════════════════════════════
function QuickAction({ icon: Icon, label, href, color }: {
  icon: React.ElementType; label: string; href: string; color: string;
}) {
  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
      padding: '18px 10px', borderRadius: 16, textDecoration: 'none',
      border: '1px solid var(--border-primary)',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = color + '70';
      el.style.transform = 'translateY(-4px) scale(1.02)';
      el.style.boxShadow = `0 8px 28px ${color}30`;
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = 'var(--border-primary)';
      el.style.transform = 'translateY(0) scale(1)';
      el.style.boxShadow = 'none';
    }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `linear-gradient(135deg, ${color}22, ${color}38)`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon style={{ width: 19, height: 19, color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>{label}</span>
    </Link>
  );
}


// ═══════════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════════
export default function CEODashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [clients, setClients] = useState<MockClient[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [meetings, setMeetings] = useState<MockMeeting[]>([]);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [expenses, setExpenses] = useState<MockExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const handleToggleTaskStatus = async (task: MockTask) => {
    const nextStatus = task.status === 'done' ? 'in_progress' as const : 'done' as const;
    const updatedTask = { ...task, status: nextStatus };
    
    // Update local state
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    
    // Save to dataService
    await dataService.saveTask(updatedTask);
  };

  useEffect(() => {
    const active = authHelper.getCurrentSession();
    if (!active) { router.push('/login'); return; }
    setSession(active);

    const fetchData = async () => {
      try {
        const [c, p, m, inv, e, t, exp] = await Promise.all([
          dataService.getClients(), dataService.getProjects(), dataService.getMeetings(),
          dataService.getInvoices(), dataService.getEmployees(), dataService.getTasks(),
          dataService.getExpenses(),
        ]);
        setClients(c); setProjects(p); setMeetings(m); setInvoices(inv);
        setEmployees(e); setTasks(t); setExpenses(exp);
      } catch (err) { console.error('Failed to load dashboard data', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  if (loading || !session) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid var(--border-primary)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Loading workspace...</span>
        </div>
      </div>
    );
  }

  // ─── Computed Metrics ──────────────────────────────────────────
  const activeClients = clients.filter(c => c.status === 'active');
  const totalRevenue = activeClients.reduce((s, c) => s + c.monthlyFee, 0);
  const totalReceived = clients.reduce((s, c) => s + c.received, 0);
  const totalExpenseAmt = expenses.reduce((s, e) => s + e.amount, 0) + employees.reduce((s, e) => s + e.salary, 0);
  const netProfit = totalRevenue - totalExpenseAmt;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled').slice(0, 3);
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const taskCompletion = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Recent activity mock
  const recentActivity = [
    { id: '1', text: 'New client GS Ayurveda added to CRM', time: '2 hours ago', icon: UserPlus, color: '#10b981' },
    { id: '2', text: 'Invoice #INV-004 marked as paid — ₹28,000', time: '4 hours ago', icon: CheckSquare, color: '#3b82f6' },
    { id: '3', text: 'Meeting with Ashvastra Creation completed', time: '6 hours ago', icon: Video, color: '#8b5cf6' },
    { id: '4', text: 'Lead from LinkedIn: TechPulse Inc added', time: '8 hours ago', icon: Zap, color: '#f59e0b' },
    { id: '5', text: 'Expense logged: Office rent ₹35,000', time: 'Yesterday', icon: Receipt, color: '#ef4444' },
  ];

  // ═══════════════════════════════════════════════════════════════
  // FOUNDER DASHBOARD — Command Center
  // ═══════════════════════════════════════════════════════════════
  const renderFounderDashboard = () => {
    return (
      <div className="ios-transition" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Welcome Banner ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Good morning, {session.firstName}! 👋
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
              Here&apos;s your business at a glance. {overdueInvoices.length > 0 && (
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                  {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} need attention.
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Calendar style={{ width: 14, height: 14 }} />
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* ── Overdue Alert Banner ── */}
        {overdueInvoices.length > 0 && (
          <div className="animate-fade-up" style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'var(--danger-light)', border: '1px solid var(--danger-border)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <AlertTriangle style={{ width: 18, height: 18, color: 'var(--danger)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>
                {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} totaling ₹{overdueInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <Link href="/dashboard/finance" style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Review <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KpiCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="Monthly recurring" icon={IndianRupee} iconBg="linear-gradient(135deg, #4361ee, #7b2fff)" trend="+24%" trendUp highlighted />
          <KpiCard label="Cash Received" value={`₹${totalReceived.toLocaleString('en-IN')}`} sub="Collections this month" icon={Download} iconBg="linear-gradient(135deg, #06d6a0, #059669)" trend="+18%" trendUp />
          <KpiCard label="Net Profit" value={`₹${netProfit.toLocaleString('en-IN')}`} sub="After all expenses" icon={TrendingUp} iconBg="linear-gradient(135deg, #7b2fff, #f72585)" trend={netProfit > 0 ? '+32%' : '-5%'} trendUp={netProfit > 0} />
          <KpiCard label="Active Clients" value={`${activeClients.length}`} sub={`${clients.length} total clients`} icon={Users} iconBg="linear-gradient(135deg, #ffd166, #f59e0b)" />
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <p className="section-title" style={{ marginBottom: 12 }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
            <QuickAction icon={UserPlus}    label="Add Client"     href="/dashboard/clients"  color="#4361ee" />
            <QuickAction icon={Receipt}     label="New Invoice"    href="/dashboard/finance"  color="#06d6a0" />
            <QuickAction icon={CalendarPlus}label="Schedule Meet"  href="/dashboard/meetings" color="#7b2fff" />
            <QuickAction icon={Zap}         label="Add Lead"       href="/dashboard/leads"    color="#ffd166" />
            <QuickAction icon={FileText}    label="View Reports"   href="/dashboard/reports"  color="#4cc9f0" />
            <QuickAction icon={Sparkles}    label="Ask AI"         href="/dashboard/ai"       color="#f72585" />
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Customer Habits (Bar Chart) */}
          <SectionCard title="Customer Habits" subtitle="Jan-Jun revenue metrics">
            <CustomerHabitsChart />
          </SectionCard>

          {/* Product Statistics (Donut Chart) */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.08) 0%, rgba(123, 47, 255, 0.05) 100%)',
            border: '1px solid var(--border-primary)',
            borderRadius: 20,
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}>
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h2 style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Product Statistics</h2>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>Traffic & sales share</p>
              </div>
            </div>
            <div style={{ padding: 22 }}>
              <ProductStatisticsChart />
            </div>
          </div>

          {/* Customer Growth (Bubble Map) */}
          <SectionCard title="Customer Growth" subtitle="Global share by country">
            <CustomerGrowthChart />
          </SectionCard>

        </div>

        {/* ── Goals + Activity + Meetings Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

          {/* Goal Progress */}
          <SectionCard title="Goal Progress" subtitle="Monthly targets">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24 }}>
              {[
                { label: 'Revenue', value: 78, target: '₹4L', color: 'var(--chart-1)' },
                { label: 'Clients', value: Math.min(Math.round((activeClients.length / 30) * 100), 100), target: '30', color: 'var(--chart-2)' },
                { label: 'Tasks', value: taskCompletion, target: `${tasks.length}`, color: 'var(--chart-5)' },
              ].map(goal => (
                <div key={goal.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative', width: 72, height: 72 }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-primary)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke={goal.color} strokeWidth="3"
                        strokeDasharray={`${goal.value * 0.942} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{goal.value}%</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{goal.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Target: {goal.target}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Recent Activity */}
          <SectionCard title="Recent Activity" subtitle="Latest updates" actionHref="/dashboard/reports" actionLabel="View All">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentActivity.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0',
                    borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: item.color + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 14, height: 14, color: item.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.text}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Upcoming Meetings */}
          <SectionCard title="Upcoming Meetings" subtitle={`${upcomingMeetings.length} scheduled`} actionHref="/dashboard/meetings" actionLabel="Calendar">
            {upcomingMeetings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingMeetings.map(m => (
                  <div key={m.id} style={{
                    padding: '12px 14px', borderRadius: 10,
                    border: '1px solid var(--border-primary)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 150ms ease', cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(m.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {m.duration} min
                      </p>
                    </div>
                    {m.link && (
                      <a href={m.link} target="_blank" rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: 10, padding: '4px 12px' }}
                        onClick={e => e.stopPropagation()}
                      >Join</a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No upcoming meetings</p>
            )}
          </SectionCard>
        </div>

        {/* ── Team Workload + Cash Flow Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>

          {/* Team Workload */}
          <SectionCard title="Team Workload" subtitle="Task distribution" actionHref="/dashboard/team" actionLabel="Manage Team">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {employees.slice(0, 5).map(emp => {
                const empTasks = tasks.filter(t => t.assignedTo.toLowerCase().includes(emp.name.split(' ')[0].toLowerCase()));
                const completedEmp = empTasks.filter(t => t.status === 'done').length;
                const totalEmp = empTasks.length || 1;
                const pct = Math.round((completedEmp / totalEmp) * 100);
                return (
                  <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: `linear-gradient(135deg, hsl(${emp.name.charCodeAt(0) * 7 % 360}, 60%, 55%), hsl(${emp.name.charCodeAt(0) * 7 % 360 + 30}, 60%, 45%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{empTasks.length} tasks</span>
                      </div>
                      <div style={{ width: '100%', height: 5, borderRadius: 4, background: 'var(--bg-tertiary)' }}>
                        <div style={{ height: '100%', borderRadius: 4, background: pct > 70 ? 'var(--success)' : pct > 40 ? 'var(--warning)' : 'var(--danger)', width: `${pct}%`, transition: 'width 500ms ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Cash Flow Bar Chart */}
          <SectionCard title="Cash Flow" subtitle="Weekly inflow vs outflow"
            headerRight={<span className="badge-blue" style={{ fontSize: 10 }}>This Month</span>}
          >
            <div style={{ height: 180, position: 'relative' }}>
              <svg viewBox="0 0 320 180" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="flow-green" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="flow-red" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="320" y2="20" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" y1="55" x2="320" y2="55" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" y1="90" x2="320" y2="90" stroke="var(--border-hover)" strokeWidth="1.2" />
                <line x1="0" y1="125" x2="320" y2="125" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" y1="160" x2="320" y2="160" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                <text x="5" y="24" fill="var(--text-muted)" fontSize="8.5" fontWeight="bold">₹100K</text>
                <text x="5" y="59" fill="var(--text-muted)" fontSize="8.5" fontWeight="bold">₹50K</text>
                <text x="5" y="94" fill="var(--text-muted)" fontSize="8.5" fontWeight="bold">₹0</text>
                <text x="5" y="129" fill="var(--text-muted)" fontSize="8.5" fontWeight="bold">-₹50K</text>
                <rect x="80" y="65" width="18" height="25" rx="4" fill="url(#flow-green)" />
                <rect x="140" y="45" width="18" height="45" rx="4" fill="url(#flow-green)" />
                <rect x="200" y="90" width="18" height="55" rx="4" fill="url(#flow-red)" />
                <rect x="260" y="40" width="18" height="50" rx="4" fill="url(#flow-green)" />
              </svg>
              <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingLeft: 50 }}>
                {['1-7 Jun','8-14 Jun','15-21 Jun','22+ Jun'].map(d => (
                  <span key={d} style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>{d}</span>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Bottom Row: Financial Trends + Top Expenses ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

          {/* Financial Trends */}
          <SectionCard title="Financial Trends" subtitle="Revenue vs expenses over time"
            headerRight={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--chart-1)' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>Revenue</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--chart-4)' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>Expenses</span>
                </div>
              </div>
            }
          >
            <div style={{ height: 180, position: 'relative' }}>
              <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="area-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="area-pink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-4)" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="var(--chart-4)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {[30,65,100,135].map(y => (
                  <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                ))}
                <path d="M 60 120 C 120 125, 170 100, 220 110 C 270 95, 340 60, 400 35 C 430 35, 460 25, 480 20 L 480 160 L 60 160 Z" fill="url(#area-blue)" />
                <path d="M 60 135 C 120 130, 170 128, 220 125 C 270 118, 340 90, 400 55 C 430 65, 460 55, 480 50 L 480 160 L 60 160 Z" fill="url(#area-pink)" opacity="0.8" />
                <path d="M 60 120 C 120 125, 170 100, 220 110 C 270 95, 340 60, 400 35 C 430 35, 460 25, 480 20" fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 60 135 C 120 130, 170 128, 220 125 C 270 118, 340 90, 400 55 C 430 65, 460 55, 480 50" fill="none" stroke="var(--chart-4)" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', paddingLeft: 50, paddingRight: 10 }}>
                {['Jan','Feb','Mar','Apr','May','Jun'].map(d => (
                  <span key={d} style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>{d}</span>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Top Expense Categories */}
          <SectionCard title="Top Expenses" subtitle="Category breakdown">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'Salaries', amount: 120000, pct: 50, icon: Users, color: 'var(--chart-1)' },
                { name: 'Marketing', amount: 54000, pct: 23, icon: TrendingUp, color: 'var(--chart-2)' },
                { name: 'Operations', amount: 42500, pct: 18, icon: Briefcase, color: 'var(--chart-3)' },
                { name: 'Others', amount: 24000, pct: 9, icon: MoreHorizontal, color: 'var(--chart-5)' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: item.color + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 14, height: 14, color: item.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>₹{item.amount.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>{item.pct}%</span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: 5, borderRadius: 4, background: 'var(--bg-tertiary)' }}>
                        <div style={{ height: '100%', borderRadius: 4, background: item.color, width: `${item.pct}%`, transition: 'width 600ms ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // CLIENT PORTAL
  // ═══════════════════════════════════════════════════════════════
  const renderClientDashboard = () => {
    const matchesClient = (name: string) => {
      const target = name.toLowerCase().trim();
      const org = (session.organizationName || '').toLowerCase().trim();
      const first = (session.firstName || '').toLowerCase().trim();
      
      const cleanTarget = target.replace(/\s+team$|\s+agency$/, '').trim();
      const cleanOrg = org.replace(/\s+team$|\s+agency$/, '').trim();
      
      return cleanTarget.includes(cleanOrg) || 
             cleanOrg.includes(cleanTarget) || 
             target.includes(first) || 
             first.includes(target);
    };

    const clientProjects = projects.filter(p => matchesClient(p.clientName));
    const clientInvoices = invoices.filter(i => matchesClient(i.clientName));
    const totalPending = clientInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);

    return (
      <div className="ios-transition" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Client Hub</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Your campaigns and billing at a glance.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard label="Active Campaigns" value={`${clientProjects.length}`} sub="Running" icon={Briefcase} iconBg="linear-gradient(135deg, #3b82f6, #6366f1)" />
          <KpiCard label="Pending Invoice" value={`₹${totalPending.toLocaleString('en-IN')}`} sub="Due soon" icon={Clock} iconBg="linear-gradient(135deg, #ef4444, #dc2626)" />
          <KpiCard label="Tasks Done" value={`${tasks.filter(t => t.status === 'done').length}`} sub="Milestones" icon={CheckSquare} iconBg="linear-gradient(135deg, #10b981, #059669)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <SectionCard title="Campaign Progress">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {clientProjects.map(p => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{p.completionRate}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: 'var(--bg-tertiary)' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: 'var(--accent)', width: `${p.completionRate}%`, transition: 'width 500ms ease' }} />
                  </div>
                </div>
              ))}
              {clientProjects.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No active campaigns.</p>}
            </div>
          </SectionCard>
          <SectionCard title="Invoices">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {clientInvoices.map(inv => (
                <div key={inv.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-primary)',
                }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.invoiceNumber}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Due: {inv.dueDate}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>₹{inv.amount.toLocaleString('en-IN')}</p>
                    <span className={inv.status === 'paid' ? 'badge-success' : 'badge-warning'} style={{ fontSize: 10 }}>{inv.status}</span>
                  </div>
                </div>
              ))}
              {clientInvoices.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No invoices found.</p>}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // EMPLOYEE PORTAL
  // ═══════════════════════════════════════════════════════════════
  const renderEmployeeDashboard = () => {
    const myTasks = tasks.filter(t => t.assignedTo.toLowerCase().includes(session.firstName.toLowerCase()) || t.assignedTo.toLowerCase().includes('team'));
    const pendingMyTasks = myTasks.filter(t => t.status !== 'done');

    return (
      <div className="ios-transition" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Team Workspace</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Track tasks and meetings.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard label="Open Tasks" value={`${pendingMyTasks.length}`} sub="This week" icon={CheckSquare} iconBg="linear-gradient(135deg, #3b82f6, #6366f1)" />
          <KpiCard label="Productivity" value="95%" sub="Performance score" icon={Activity} iconBg="linear-gradient(135deg, #10b981, #059669)" />
          <KpiCard label="Meetings" value={`${meetings.filter(m => m.status === 'scheduled').length}`} sub="Upcoming" icon={Calendar} iconBg="linear-gradient(135deg, #f59e0b, #d97706)" />
        </div>
        <SectionCard title="My Tasks">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myTasks.map(task => {
              const isCompleted = task.status === 'done';
              return (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-primary)',
                  background: isCompleted ? 'var(--bg-tertiary)/30' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggleTaskStatus(task)}
                      style={{
                        width: 16, height: 16, borderRadius: 4,
                        border: '1.5px solid var(--border-primary)',
                        cursor: 'pointer', accentColor: 'var(--accent)',
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ 
                        fontSize: 12, fontWeight: 600, 
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        transition: 'all 200ms ease',
                      }}>{task.title}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{task.projectName}</p>
                    </div>
                  </div>
                  <span className={isCompleted ? 'badge-success' : 'badge-blue'} style={{ fontSize: 10, textTransform: 'capitalize' }}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
            {myTasks.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No tasks assigned.</p>}
          </div>
        </SectionCard>
      </div>
    );
  };

  if (session.role === 'client') return renderClientDashboard();
  if (session.role === 'employee') return renderEmployeeDashboard();
  return renderFounderDashboard();
}
