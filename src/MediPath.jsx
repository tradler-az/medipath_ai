import { useState } from "react";

const C = {
  bg:      "#070d1a",
  card:    "#111d2e",
  border:  "rgba(20,184,166,.15)",
  teal:    "#14b8a6",
  teal2:   "#2dd4bf",
  cyan:    "#22d3ee",
  txt:     "#e2e8f0",
  txt2:    "#94a3b8",
  muted:   "#475569",
  success: "#10b981",
  warning: "#f59e0b",
  danger:  "#ef4444",
};

const grad = {
  background: `linear-gradient(135deg, ${C.teal2}, ${C.cyan})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const card = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: "1.25rem",
};

const RISK_COLOR = (pct) =>
  pct >= 50 ? C.danger : pct >= 30 ? C.warning : C.success;

export default function MediPath() {
  const [pid, setPid]         = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [metrics, setMetrics]  = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!pid.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res  = await fetch(`http://localhost:5000/predict?patient_id=${pid.trim()}`);
      const data = await res.json();
      if (data.error && !data.conditions) {
        setError(data.error);
      } else {
        setResult(data);
        if (data.error) setError(data.error);
      }
    } catch {
      setError("Cannot reach server. Make sure app.py is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetrics() {
    try {
      const res = await fetch('http://localhost:5000/metrics');
      const data = await res.json();
      setMetrics(data);
      setShowMetrics(true);
    } catch {
      console.error("Failed to fetch metrics");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.txt,
      fontFamily: "'DM Sans', sans-serif", padding: "2rem 1rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: ${C.teal} !important; box-shadow: 0 0 0 3px rgba(20,184,166,.15) !important; }
        button:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
        button:active { transform: scale(.97) !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem", animation: "fadeUp .4s both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: ".55rem", marginBottom: "1rem" }}>
            <svg width={36} height={36} viewBox="0 0 40 40" fill="none"
                 style={{ filter: "drop-shadow(0 0 8px rgba(20,184,166,.5))" }}>
              <path d="M20 2L36 11V29L20 38L4 29V11L20 2Z" fill="url(#hg)" opacity=".2"/>
              <rect x="17" y="8" width="6" height="24" rx="3" fill="url(#cg)"/>
              <rect x="8" y="17" width="24" height="6" rx="3" fill="url(#cg)"/>
              <path d="M4 20H10L13 13L17 27L21 16L24 22L27 20H36"
                    stroke="#0ff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".8"/>
              <defs>
                <linearGradient id="hg" x1="4" y1="2" x2="36" y2="38">
                  <stop stopColor="#0d9488"/><stop offset="1" stopColor="#0891b2"/>
                </linearGradient>
                <linearGradient id="cg" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#14b8a6"/><stop offset="1" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.7rem" }}>
              <span style={{ color: C.txt }}>Medi</span>
              <span style={grad}>PATH AI</span>
            </span>
          </div>
          
          <p style={{ color: C.muted, fontSize: ".85rem" }}>

            
            Disease progression predictor — enter a Patient ID to run the model
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{
          ...card, display: "flex", gap: ".75rem", marginBottom: "1rem",
          animation: "fadeUp .4s .05s both",
        }}>
            
          <input
            value={pid}
            onChange={e => setPid(e.target.value)}
            placeholder="Enter Patient ID (e.g. P00001)"
            style={{
              flex: 1, padding: ".7rem 1rem",
              background: "#0a1525", border: `1px solid ${C.border}`,
              borderRadius: 10, color: C.txt,
              fontFamily: "'DM Sans', sans-serif", fontSize: "1rem",
              transition: "all .2s",
            }}
          />
          <button type="submit" disabled={loading || !pid.trim()} style={{
            padding: ".7rem 1.4rem", borderRadius: 10, border: "none",
            background: `linear-gradient(135deg, #0f766e, ${C.teal}, #06b6d4)`,
            color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: ".9rem", cursor: loading ? "not-allowed" : "pointer",
            opacity: (!pid.trim() || loading) ? .5 : 1,
            transition: "all .2s", display: "flex", alignItems: "center", gap: ".5rem",
          }}>
            {loading ? (
              <div style={{
                width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)",
                borderTopColor: "#fff", borderRadius: "50%",
                animation: "spin .7s linear infinite",
              }}/>
            ) : "Predict →"}
          </button>
        </form>

        {/* Metrics Button */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button onClick={fetchMetrics} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 20, padding: ".3rem 1rem", color: C.txt2,
            fontSize: ".7rem", cursor: "pointer", transition: "all .2s",
          }}>
             View Model Performance
          </button>
        </div>

        {/* Metrics Modal */}
        {showMetrics && metrics && !metrics.error && (
          <div style={{
            ...card, marginBottom: "1rem",
            borderColor: C.teal, background: "rgba(20,184,166,.05)",
            animation: "fadeUp .3s both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em",
                textTransform: "uppercase", color: C.teal2 }}>
                Model Performance Report
              </div>
              <button onClick={() => setShowMetrics(false)} style={{
                background: "none", border: "none", color: C.muted,
                cursor: "pointer", fontSize: "1.2rem"
              }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: ".7rem", color: C.muted }}>Top-1 Accuracy</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: C.txt }}>{metrics.accuracy}%</div>
              </div>
              <div>
                <div style={{ fontSize: ".7rem", color: C.muted }}>Top-3 Accuracy</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: C.txt }}>{metrics.top3_accuracy}%</div>
              </div>
              <div>
                <div style={{ fontSize: ".7rem", color: C.muted }}>Coverage</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: C.txt2 }}>{metrics.coverage}%</div>
              </div>
              <div>
                <div style={{ fontSize: ".7rem", color: C.muted }}>Exact Matches</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: C.txt2 }}>{metrics.exact_matches} / {metrics.predictions_generated}</div>
              </div>
            </div>
            <div style={{ fontSize: ".7rem", color: C.muted, marginTop: ".75rem", textAlign: "center" }}>
              Based on {metrics.total_eligible} eligible patients
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            ...card, marginBottom: "1rem",
            borderColor: "rgba(239,68,68,.3)", background: "rgba(239,68,68,.06)",
            color: "#fca5a5", fontSize: ".88rem", animation: "fadeUp .3s both",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {result && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "fadeUp .4s both" }}>

            {/* Patient info */}
            <div style={{ ...card, display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, #0f766e, #06b6d4)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff",
              }}>
                {(result.name || result.patient_id).split(" ").map(w => w[0]).slice(0,2).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: C.txt }}>
                  {result.name}
                  <span style={{ marginLeft: ".6rem", fontSize: ".7rem", fontFamily: "'DM Sans'",
                    fontWeight: 400, color: C.muted }}>ID: {result.patient_id}</span>
                </div>
                <div style={{ fontSize: ".8rem", color: C.txt2, marginTop: ".2rem" }}>
                  Age <b style={{ color: C.txt }}>{result.age ?? "—"}</b>
                  &nbsp;·&nbsp;
                  BMI <b style={{ color: C.txt }}>{result.bmi ?? "—"}</b>
                </div>
              </div>
            </div>

            {/* Current Conditions */}
            <div style={card}>
              <div style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".08em",
                textTransform: "uppercase", color: C.muted, marginBottom: ".75rem" }}>
                Current Conditions
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                {result.conditions?.map((c, i) => (
                  <span key={i} style={{
                    padding: ".25rem .75rem", borderRadius: 99,
                    background: "rgba(20,184,166,.1)",
                    border: `1px solid rgba(20,184,166,.25)`,
                    fontSize: ".8rem", color: C.teal2, fontWeight: 500,
                  }}>{c}</span>
                ))}
              </div>
            </div>

            {/* Progression Chain - Like Notebook */}
            {result.chain_match && (
              <div style={{ ...card, borderColor: "rgba(20,184,166,.3)" }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".08em",
                  textTransform: "uppercase", color: C.muted, marginBottom: ".75rem" }}>
                  Progression Path Detected
                </div>
                <div style={{ 
                  fontFamily: "'Syne', sans-serif", 
                  fontWeight: 700, 
                  color: C.teal2, 
                  marginBottom: ".5rem",
                  fontSize: ".9rem"
                }}>
                  {result.chain_match.chain_name}
                </div>
                <div style={{ fontSize: ".8rem", color: C.txt2, marginBottom: ".5rem" }}>
                  Current Stage: Step <b style={{ color: C.txt }}>{result.chain_match.step}</b> of <b style={{ color: C.txt }}>{result.chain_match.total_steps}</b>
                  {result.chain_match.next_disease && !result.chain_match.is_end && (
                    <span style={{ marginLeft: ".5rem" }}>
                      → Next: <b style={{ color: C.warning }}>{result.chain_match.next_disease}</b>
                      <span style={{ color: C.muted }}> (~{result.chain_match.years_to_next?.toFixed(1)} years)</span>
                    </span>
                  )}
                  {result.chain_match.is_end && (
                    <span style={{ marginLeft: ".5rem", color: C.success }}>— End of known trajectory</span>
                  )}
                </div>
                {result.chain_match.risk_factors && result.chain_match.risk_factors !== "nan" && (
                  <div style={{ 
                    fontSize: ".75rem", 
                    color: C.muted, 
                    marginTop: ".5rem",
                    padding: ".5rem",
                    background: "rgba(20,184,166,.05)",
                    borderRadius: 8,
                  }}>
                    <span style={{ color: C.txt2 }}>⚠ Key Risk Factors:</span> {result.chain_match.risk_factors}
                  </div>
                )}
              </div>
            )}

            {/* No Chain Found Message */}
            {result.chain_match === null && result.conditions?.length >= 3 && (
              <div style={{ ...card, borderColor: C.border }}>
                <div style={{ fontSize: ".8rem", color: C.txt2, textAlign: "center" }}>
                  🔍 No matching progression chain found for this condition combination.
                  <br />
                  <span style={{ fontSize: ".7rem", color: C.muted }}>Prediction based on similar patients and clinical evidence.</span>
                </div>
              </div>
            )}

            {/* Predictions */}
            {result.predictions?.length > 0 && (
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".08em",
                    textTransform: "uppercase", color: C.muted }}>
                    Predicted Next Conditions
                  </div>
                  {result.similar_patients_count > 0 && (
                    <div style={{ fontSize: ".65rem", color: C.muted }}>
                      Based on {result.similar_patients_count} similar patients
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {result.predictions.map((p, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".35rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: i === 0 ? "rgba(239,68,68,.2)" : "rgba(20,184,166,.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: ".7rem", fontWeight: 800,
                            color: i === 0 ? C.danger : C.teal2,
                            fontFamily: "'Syne', sans-serif",
                          }}>{p.rank || i + 1}</span>
                          <span style={{ fontWeight: 600, color: C.txt, fontSize: ".9rem" }}>{p.disease}</span>
                          {p.is_highest_risk && (
                            <span style={{
                              padding: ".1rem .5rem", borderRadius: 99,
                              background: "rgba(239,68,68,.15)",
                              border: "1px solid rgba(239,68,68,.3)",
                              fontSize: ".6rem", fontWeight: 700, color: "#fca5a5",
                            }}>← Highest Risk</span>
                          )}
                        </div>
                        <span style={{
                          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: ".95rem",
                          color: RISK_COLOR(p.probability),
                        }}>{p.probability}%</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,.06)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 99, width: `${p.probability}%`,
                          background: RISK_COLOR(p.probability),
                          transition: "width .6s cubic-bezier(.16,1,.3,1)",
                        }}/>
                      </div>
                      {p.reasons?.length > 0 && (
                        <div style={{ fontSize: ".7rem", color: C.muted, marginTop: ".4rem", lineHeight: "1.4" }}>
                          {p.reasons.join(" · ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning for <3 conditions */}
            {result.warning && (
              <div style={{
                ...card, borderColor: "rgba(245,158,11,.3)",
                background: "rgba(245,158,11,.05)", textAlign: "center"
              }}>
                <div style={{ fontSize: ".8rem", color: C.warning }}>
                  ⚠ {result.warning}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              fontSize: ".7rem", color: C.muted, textAlign: "center",
              padding: ".75rem", borderTop: `1px solid ${C.border}`,
            }}>
              ⚕ Clinical support tool only — not a substitute for professional medical diagnosis
            </div>
          </div>
        )}
      </div>
    </div>
  );
}