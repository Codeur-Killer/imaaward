// pages/admin/DashboardPage.jsx
// Dashboard complet — suivi temps réel gratuit + payant + jury + score pondéré
import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import StatsCard from '../../components/admin/StatsCard.jsx';
import { useVote } from '../../context/VoteContext.jsx';
import { votesAPI } from '../../services/api.js';
import { getSocket, joinAdmin } from '../../services/socket.js';
import './DashboardPage.css';

// ── Tooltip recharts ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'var(--text-secondary)', marginBottom:6, fontWeight:600 }}>{label}</p>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, display:'flex', justifyContent:'space-between', gap:20, margin:'2px 0' }}>
          <span>{p.name}</span>
          <strong>{typeof p.value === 'number' ? p.value.toLocaleString('fr-FR') : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Barre pondération ─────────────────────────────────────────────────────────
function WeightBar({ free, paid, jury }) {
  const total = (free||0) + (paid||0) + (jury||0);
  if (total === 0) return <div style={{height:8,background:'var(--bg-secondary)',borderRadius:99}} />;
  const pF = Math.round((free/total)*100);
  const pP = Math.round((paid/total)*100);
  const pJ = 100 - pF - pP;
  return (
    <div style={{ display:'flex', height:8, borderRadius:99, overflow:'hidden', gap:1 }}>
      <div style={{ width:`${pF}%`, background:'#10B981', transition:'width 1s' }} title={`Gratuit: ${pF}%`}/>
      <div style={{ width:`${pP}%`, background:'#7C3AED', transition:'width 1s' }} title={`Payant: ${pP}%`}/>
      <div style={{ width:`${pJ}%`, background:'#F59E0B', transition:'width 1s' }} title={`Jury: ${pJ}%`}/>
    </div>
  );
}

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score, max }) {
  const pct = max > 0 ? Math.round((score/max)*100) : 0;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3 }}>
      <span style={{ fontFamily:'var(--font-accent)', fontSize:17, color:'var(--accent-gold-light)' }}>
        {score?.toLocaleString('fr-FR', {maximumFractionDigits:1})}
      </span>
      <div style={{ width:60, height:4, background:'rgba(255,255,255,.08)', borderRadius:99, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#C9A84C,#E8C56A)', transition:'width 1s' }}/>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { categories } = useVote();
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('overview');
  const [topArtists,   setTopArtists]   = useState([]);
  const [recentVotes,  setRecentVotes]  = useState([]);
  const [chartData,    setChartData]    = useState([]);
  const [catScores,    setCatScores]    = useState([]);
  const [lastUpdate,   setLastUpdate]   = useState(null);

  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const loadStats = useCallback(async () => {
    try {
      const res = await votesAPI.getStats();
      const d   = res.data;
      setStats(d);
      setTopArtists(d.topArtists    || []);
      setRecentVotes(d.recentVotes  || []);
      setChartData(d.chartData      || []);
      setCatScores(d.scoresByCategory || []);
      setLastUpdate(new Date());
    } catch (err) { console.error('Stats error:', err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    const socket = getSocket();
    if (socket.connected) joinAdmin(); else socket.on('connect', joinAdmin);
    socket.on('admin:vote-update',  loadStats);
    socket.on('admin:stats-update', loadStats);
    return () => { socket.off('admin:vote-update', loadStats); socket.off('admin:stats-update', loadStats); };
  }, [loadStats]);

  useEffect(() => {
    const i = setInterval(loadStats, 20000);
    return () => clearInterval(i);
  }, [loadStats]);

  if (loading) return (
    <div className="dashboard-page">
      <div className="dashboard-topbar">
        <div><h1 className="dashboard-title">Dashboard</h1><p className="dashboard-date">{dateStr}</p></div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:80,color:'var(--text-secondary)'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:40,height:40,border:'3px solid rgba(201,168,76,.2)',borderTopColor:'var(--accent-gold)',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 16px'}}/>
          Chargement des données en temps réel...
        </div>
      </div>
    </div>
  );

  const { totalVotesFree=0, totalVotesPaid=0, totalVotesJury=0, totalVotes=0, totalRevenue=0, totalArtists=0 } = stats || {};
  const openCats = categories.filter(c => c.status === 'open').length;
  const maxScore = topArtists.reduce((m, a) => Math.max(m, a.scoreTotal||0), 0);

  // Enrichir chartData avec totaux
  const enrichedChart = chartData.map(d => ({
    ...d,
    total: (d.gratuit||0) + (d.payant||0) + (d.jury||0),
  }));

  const TABS = [
    { id: 'overview',  label: ' Vue générale' },
    { id: 'scores',    label: ' Classements' },
    { id: 'evolution', label: ' Évolution' },
    { id: 'recent',    label: ' Votes récents' },
  ];

  return (
    <div className="dashboard-page">
      {/* Topbar */}
      <div className="dashboard-topbar">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-date">{dateStr}</p>
        </div>
        <div className="dashboard-topbar-actions">
          <div className="db-live-indicator">
            <span className="live-dot" style={{width:8,height:8,background:'var(--success)',borderRadius:'50%',animation:'blink 1.5s infinite',display:'inline-block'}}/>
            <span style={{fontSize:12,color:'var(--success)',fontWeight:600}}>LIVE</span>
            {lastUpdate && <span style={{fontSize:11,color:'var(--text-muted)'}}>· {lastUpdate.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>}
          </div>
          <button className="dashboard-notif" onClick={loadStats} title="Rafraîchir" style={{fontSize:16}}>🔄</button>
          <div className="dashboard-topbar-avatar">A</div>
        </div>
      </div>

      {/* ── Pondération officielle ── */}
      <div className="db-weight-banner">
        <span className="db-weight-title"> Pondération officielle :</span>
        <span className="db-weight-item db-weight-free"> Gratuit <strong>20%</strong></span>
        <span className="db-weight-sep">·</span>
        <span className="db-weight-item db-weight-paid"> Payant <strong>60%</strong></span>
        <span className="db-weight-sep">·</span>
        <span className="db-weight-item db-weight-jury"> Jury <strong>20%</strong> <em>(interne)</em></span>
      </div>

      <div className="dashboard-content">
        {/* ── KPI Cards ── */}
        <div className="dashboard-stats-grid db-stats-6">
          <StatsCard icon="" title="Total votes publics" value={totalVotes}      color="gold"   />
          <StatsCard icon="" title="Votes gratuits"      value={totalVotesFree}  color="green"  />
          <StatsCard icon="" title="Votes payants"       value={totalVotesPaid}  color="purple" />
          <StatsCard icon="" title="Votes jury"        value={totalVotesJury}  color="pink"   />
          <StatsCard icon="" title="Revenus FedaPay"     value={totalRevenue}    suffix=" FCFA" color="blue" />
          <StatsCard icon="" title="Catégories ouvertes" value={openCats}        color="gold"   />
        </div>

        {/* ── Répartition des votes ── */}
        <div className="db-vote-distribution">
          <div className="db-vd-title">Répartition des votes</div>
          <div className="db-vd-bars">
            <div className="db-vd-bar-item">
              <div className="db-vd-bar-label">
                <span className="db-vd-dot" style={{background:'#10B981'}}/>
                <span>Gratuits</span>
                <span className="db-vd-count">{totalVotesFree.toLocaleString('fr-FR')}</span>
              </div>
              <div className="db-vd-bar-track">
                <div className="db-vd-bar-fill" style={{width:`${totalVotes>0?Math.round((totalVotesFree/totalVotes)*100):0}%`,background:'#10B981'}}/>
              </div>
              <span className="db-vd-pct">{totalVotes>0?Math.round((totalVotesFree/totalVotes)*100):0}%</span>
            </div>
            <div className="db-vd-bar-item">
              <div className="db-vd-bar-label">
                <span className="db-vd-dot" style={{background:'#7C3AED'}}/>
                <span>Payants</span>
                <span className="db-vd-count">{totalVotesPaid.toLocaleString('fr-FR')}</span>
              </div>
              <div className="db-vd-bar-track">
                <div className="db-vd-bar-fill" style={{width:`${totalVotes>0?Math.round((totalVotesPaid/totalVotes)*100):0}%`,background:'#7C3AED'}}/>
              </div>
              <span className="db-vd-pct">{totalVotes>0?Math.round((totalVotesPaid/totalVotes)*100):0}%</span>
            </div>
            <div className="db-vd-bar-item">
              <div className="db-vd-bar-label">
                <span className="db-vd-dot" style={{background:'#F59E0B'}}/>
                <span>Jury <em style={{fontSize:11,opacity:.7}}>(interne)</em></span>
                <span className="db-vd-count">{totalVotesJury.toLocaleString('fr-FR')}</span>
              </div>
              <div className="db-vd-bar-track">
                <div className="db-vd-bar-fill" style={{width:`${(totalVotesFree+totalVotesPaid+totalVotesJury)>0?Math.round((totalVotesJury/(totalVotesFree+totalVotesPaid+totalVotesJury))*100):0}%`,background:'#F59E0B'}}/>
              </div>
              <span className="db-vd-pct">{(totalVotesFree+totalVotesPaid+totalVotesJury)>0?Math.round((totalVotesJury/(totalVotesFree+totalVotesPaid+totalVotesJury))*100):0}%</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="db-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`db-tab ${activeTab===t.id?'active':''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ TAB: VUE GÉNÉRALE ═══ */}
        {activeTab === 'overview' && (
          <div className="db-tab-content">
            {/* Graphique évolution + Top artistes */}
            <div className="dashboard-main-grid">
              <div className="dashboard-chart-wrap">
                <div className="db-card">
                  <div className="db-card-header">
                    <h3> Évolution 7 jours</h3>
                    <span style={{fontSize:12,color:'var(--text-muted)'}}>Gratuit + Payant + Jury</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={enrichedChart} margin={{top:5,right:5,left:0,bottom:0}}>
                      <defs>
                        <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="4 4"/>
                      <XAxis dataKey="name" tick={{fill:'#8A94A6',fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:'#8A94A6',fontSize:10}} axisLine={false} tickLine={false} width={40} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{fontSize:12}}/>
                      <Area type="monotone" dataKey="gratuit" name="Gratuits"  stroke="#10B981" fill="url(#gF)" strokeWidth={2}/>
                      <Area type="monotone" dataKey="payant"  name="Payants"   stroke="#7C3AED" fill="url(#gP)" strokeWidth={2}/>
                      <Area type="monotone" dataKey="jury"    name="Jury"      stroke="#F59E0B" fill="none"      strokeWidth={1.5} strokeDasharray="4 2"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="db-card">
                <div className="db-card-header">
                  <h3> Top 5 — Score pondéré</h3>
                  <div className="db-legend-small">
                    <span style={{color:'#10B981'}}>■ Gratuit</span>
                    <span style={{color:'#7C3AED'}}>■ Payant</span>
                    <span style={{color:'#F59E0B'}}>■ Jury</span>
                  </div>
                </div>
                {topArtists.slice(0,5).map((a,i) => {
                  const rankC = ['#C9A84C','#8A94A6','#A0522D','#6B7280','#6B7280'];
                  return (
                    <div key={a.id||i} className="db-top-row">
                      <span className="db-top-rank" style={{color:rankC[i]}}>#{i+1}</span>
                      <img src={a.photo} alt={a.name} className="db-top-photo" onError={e=>{e.target.style.display='none';}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="db-top-name">{a.name}</div>
                        <div style={{display:'flex',gap:8,fontSize:11,color:'var(--text-muted)',marginBottom:3}}>
                          <span style={{color:'#10B981'}}>🆓 {(a.votesGratuit||0).toLocaleString()}</span>
                          <span style={{color:'#7C3AED'}}>💳 {(a.votesPay||0).toLocaleString()}</span>
                          <span style={{color:'#F59E0B'}}>👨‍⚖️ {(a.votesJury||0).toLocaleString()}</span>
                        </div>
                        <WeightBar free={a.votesGratuit||0} paid={a.votesPay||0} jury={a.votesJury||0}/>
                      </div>
                      <ScoreBadge score={a.scoreTotal||0} max={maxScore}/>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB: CLASSEMENTS ═══ */}
        {activeTab === 'scores' && (
          <div className="db-tab-content">
            {categories.map(cat => {
              const catId = String(cat.id||cat._id);
              const catArtists = topArtists.filter(a => String(a.categoryId)===catId).sort((a,b)=>(b.scoreTotal||0)-(a.scoreTotal||0));
              if (!catArtists.length) return null;
              const maxCatScore = catArtists[0]?.scoreTotal || 0;
              return (
                <div key={catId} className="db-card db-ranking-card">
                  <div className="db-card-header">
                    <h3>{cat.icon} {cat.name}</h3>
                    <div style={{display:'flex',gap:12,fontSize:12,color:'var(--text-muted)'}}>
                      <span>Gratuit ×0.20</span><span>Payant ×0.60</span><span>Jury ×0.20</span>
                    </div>
                  </div>
                  <div className="db-ranking-table">
                    <div className="db-ranking-header">
                      <span>#</span><span>Artiste</span>
                      <span style={{color:'#10B981'}}> Gratuit</span>
                      <span style={{color:'#7C3AED'}}> Payant</span>
                      <span style={{color:'#F59E0B'}}> Jury</span>
                      <span style={{color:'var(--accent-gold)'}}> Score</span>
                    </div>
                    {catArtists.map((a,i) => (
                      <div key={a.id||i} className={`db-ranking-row ${i<3?'db-ranking-row-top':''}`}>
                        <span className="db-rank-num" style={{color:i===0?'#C9A84C':i===1?'#8A94A6':i===2?'#A0522D':'var(--text-muted)'}}>
                          {i<3?['🥇','🥈','🥉'][i]:`#${i+1}`}
                        </span>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <img src={a.photo} alt={a.name} style={{width:30,height:30,borderRadius:6,objectFit:'cover'}} onError={e=>{e.target.style.display='none';}}/>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{a.name}</div>
                            <div style={{fontSize:11,color:'var(--text-muted)'}}>{a.categoryIcon}</div>
                          </div>
                        </div>
                        <span style={{color:'#10B981',fontWeight:600}}>{(a.votesGratuit||0).toLocaleString('fr-FR')}</span>
                        <span style={{color:'#7C3AED',fontWeight:600}}>{(a.votesPay||0).toLocaleString('fr-FR')}</span>
                        <span style={{color:'#F59E0B',fontWeight:600}}>{(a.votesJury||0).toLocaleString('fr-FR')}</span>
                        <ScoreBadge score={a.scoreTotal||0} max={maxCatScore}/>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ TAB: ÉVOLUTION ═══ */}
        {activeTab === 'evolution' && (
          <div className="db-tab-content">
            <div className="db-card">
              <div className="db-card-header"><h3> Votes par type — 7 derniers jours</h3></div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrichedChart} margin={{top:5,right:5,left:0,bottom:0}}>
                  <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="4 4"/>
                  <XAxis dataKey="name" tick={{fill:'#8A94A6',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'#8A94A6',fontSize:10}} axisLine={false} tickLine={false} width={45}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{fontSize:12}}/>
                  <Bar dataKey="gratuit" name="Gratuits" fill="#10B981" radius={[4,4,0,0]}/>
                  <Bar dataKey="payant"  name="Payants"  fill="#7C3AED" radius={[4,4,0,0]}/>
                  <Bar dataKey="jury"    name="Jury"     fill="#F59E0B" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="db-card">
              <div className="db-card-header"><h3> Revenus FedaPay — 7 jours</h3></div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{top:5,right:5,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="4 4"/>
                  <XAxis dataKey="name" tick={{fill:'#8A94A6',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'#8A94A6',fontSize:10}} axisLine={false} tickLine={false} width={60} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                  <Tooltip content={<CustomTooltip/>} formatter={v=>`${v.toLocaleString('fr-FR')} FCFA`}/>
                  <Area type="monotone" dataKey="revenue" name="Revenus (FCFA)" stroke="#C9A84C" fill="url(#gRev)" strokeWidth={2.5}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ═══ TAB: VOTES RÉCENTS ═══ */}
        {activeTab === 'recent' && (
          <div className="db-tab-content">
            <div className="db-card">
              <div className="db-card-header">
                <h3> 50 derniers votes</h3>
                <button onClick={loadStats} style={{fontSize:12,color:'var(--text-muted)',background:'none',border:'none',cursor:'pointer'}}>🔄 Rafraîchir</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Artiste</th><th>Catégorie</th>
                      <th>Votes</th><th>Type</th><th>Montant</th><th>Heure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVotes.length === 0
                      ? <tr><td colSpan={7}><div className="empty-state">Aucun vote pour l'instant</div></td></tr>
                      : recentVotes.slice(0, 50).map((v, i) => (
                        <tr key={v.id||i}>
                          <td style={{color:'var(--text-muted)',fontSize:12}}>{i+1}</td>
                          <td style={{fontWeight:600,fontSize:13}}>{v.artistName}</td>
                          <td style={{color:'var(--text-secondary)',fontSize:12}}>{v.categoryName}</td>
                          <td><span className="badge badge-gold">{v.votes}</span></td>
                          <td>
                            <span className={`badge ${v.type==='payant'?'badge-purple':v.type==='jury'?'badge-warning':'badge-success'}`}>
                              {v.type==='payant'?' Payant':v.type==='jury'?'👨‍⚖️ Jury':' Gratuit'}
                            </span>
                          </td>
                          <td style={{color:v.amount?'var(--accent-gold)':'var(--text-muted)',fontWeight:v.amount?600:400}}>
                            {v.amount?`${v.amount.toLocaleString('fr-FR')} FCFA`:'—'}
                          </td>
                          <td style={{color:'var(--text-secondary)',fontSize:11}}>
                            {new Date(v.timestamp).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})} {new Date(v.timestamp).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
