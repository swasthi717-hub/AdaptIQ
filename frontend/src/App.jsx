// AdaptIQ App component. Replace frontend/src/App.jsx with this file.
import React, { useMemo, useState } from "react";
import {
  Home, CalendarDays, BookOpen, CheckSquare, Target, BarChart3,
  Plus, Sparkles, Clock3, Flame, ChevronRight, GraduationCap,
  Menu, X, CircleHelp, Settings, WandSparkles, Trash2, CheckCircle2,
  Circle, ListChecks, ArrowUpRight, Trophy, BookMarked
} from "lucide-react";
import "./styles.css";

const starterTopics = [
  { id: 1, subject: "Artificial Intelligence", topic: "Greedy Best-First Search", daysLeft: 1, difficulty: 5, duration: 1.5, completed: false },
  { id: 2, subject: "Discrete Mathematics", topic: "Relations and Functions", daysLeft: 2, difficulty: 4, duration: 1, completed: false },
  { id: 3, subject: "Database Systems", topic: "Normalisation", daysLeft: 4, difficulty: 3, duration: 1.25, completed: false },
];

const navItems = [
  ["Overview", Home], ["My Topics", BookOpen], ["Study Planner", CalendarDays],
  ["Progress", BarChart3], ["Goals", Target]
];

function App() {
  const [topics, setTopics] = useState(starterTopics);
  const [hours, setHours] = useState(4);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState("Overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", topic: "", daysLeft: 2, difficulty: 3, duration: 1 });
  const [goalInput, setGoalInput] = useState("");
  const [goals, setGoals] = useState([
    { id: 1, title: "Study for at least 2 hours", done: false },
    { id: 2, title: "Complete one difficult topic", done: false },
    { id: 3, title: "Revise class notes", done: false },
  ]);

  const completedCount = topics.filter(t => t.completed).length;
  const plannedPercent = useMemo(() => {
    if (!plan || !Number(plan.availableHours)) return 0;
    return Math.round((Number(plan.plannedHours) / Number(plan.availableHours)) * 100);
  }, [plan]);

  function addTopic(e) {
    e.preventDefault();
    const newTopic = {
      ...form, id: Date.now(), daysLeft: Number(form.daysLeft),
      difficulty: Number(form.difficulty), duration: Number(form.duration), completed: false
    };
    setTopics(prev => [...prev, newTopic]);
    setForm({ subject: "", topic: "", daysLeft: 2, difficulty: 3, duration: 1 });
    setPlan(null); setError("");
  }

  function removeTopic(id) {
    setTopics(prev => prev.filter(t => t.id !== id));
    setPlan(null);
  }

  function toggleTopic(id) {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function addGoal(e) {
    e.preventDefault();
    const title = goalInput.trim();
    if (!title) return;
    setGoals(prev => [...prev, { id: Date.now(), title, done: false }]);
    setGoalInput("");
  }

  function toggleGoal(id) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
  }

  async function buildPlan() {
    setError("");

    const available = Number(hours);
    if (!Number.isFinite(available) || available <= 0) {
      setError("Enter a valid number of available study hours.");
      return;
    }

    const activeTopics = topics.filter((t) => !t.completed);
    if (activeTopics.length === 0) {
      setError("Please add at least one active topic.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availableHours: available,
          topics: activeTopics.map((t) => ({
            id: t.id,
            subject: t.subject,
            topic: t.topic,
            daysLeft: Number(t.daysLeft),
            difficulty: Number(t.difficulty),
            duration: Number(t.duration),
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not create your plan.");
      }
      setPlan(data);
    } catch (err) {
      setError(err.message || "Could not reach the planner. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function renderTopicRows(showStatus = false) {
    if (!topics.length) {
      return (
        <div className="empty-inline">
          <BookOpen size={22} />
          <b>No topics yet</b>
          <span>Add your first topic above.</span>
        </div>
      );
    }

    return (
      <>
        {topics.map((t) => (
          <div className="topic-row" key={t.id}>
            {showStatus && (
              <button
                className="status-toggle"
                title={t.completed ? "Mark as not completed" : "Mark as completed"}
                onClick={() => toggleTopic(t.id)}
              >
                {t.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
              </button>
            )}

            <div className="topic-details">
              <span>{t.topic}</span>
              <small>
                {t.subject} · Difficulty {t.difficulty}/5 · {t.duration}h · {t.daysLeft}d left
              </small>
            </div>

            <button
              className="remove"
              title="Remove topic"
              onClick={() => removeTopic(t.id)}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </>
    );
  }

  function renderTopicForm() {
    return <form className="topic-form" onSubmit={addTopic}>
      <div className="form-title"><Plus size={16}/> Add a topic</div>
      <div className="form-row"><label>Subject<input required placeholder="e.g. Artificial Intelligence" value={form.subject} onChange={e => setForm({...form, subject:e.target.value})}/></label><label>Topic<input required placeholder="e.g. Search Algorithms" value={form.topic} onChange={e => setForm({...form, topic:e.target.value})}/></label></div>
      <div className="form-row three"><label>Deadline (days)<input type="number" min="0" value={form.daysLeft} onChange={e => setForm({...form, daysLeft:e.target.value})}/></label><label>Difficulty<select value={form.difficulty} onChange={e => setForm({...form, difficulty:e.target.value})}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></label><label>Duration (hrs)<input type="number" min="0.25" step="0.25" value={form.duration} onChange={e => setForm({...form, duration:e.target.value})}/></label></div>
      <button className="add-button" type="submit"><Plus size={15}/> Add topic</button>
    </form>;
  }

  function renderPlan() {
    if (!plan) return <div className="empty-state"><div className="empty-illustration"><WandSparkles size={28}/></div><h3>Your plan will appear here</h3><p>Add your topics, set your available hours and generate a plan to see your personalised study schedule.</p><div className="empty-tip"><Sparkles size={15}/> Tip: Add realistic study durations.</div></div>;
    return <><div className="result-summary"><div><span>Planned study time</span><b>{plan.plannedHours} <small>/ {plan.availableHours} hrs</small></b></div><div className="progress-ring" style={{"--progress":`${plannedPercent}%`}}><span>{plannedPercent}%</span></div></div>
      <div className="progress-track"><div style={{width:`${plannedPercent}%`}}/></div>
      <div className="schedule-list">{(plan.plan || []).map((t,i)=><div className="schedule-item" key={t.id}><div className="schedule-number">{String(i+1).padStart(2,"0")}</div><div className="schedule-copy"><b>{t.topic}</b><small>{t.subject} · Difficulty {t.difficulty}/5</small></div><span className="duration-pill">{t.duration}h</span></div>)}</div>
      {plan.notScheduled?.length>0 && <div className="not-scheduled"><b>Not scheduled this time</b>{plan.notScheduled.map((t)=><span key={t.id}>{t.topic} · {t.duration}h</span>)}</div>}
      <div className="result-foot"><span><CheckSquare size={15}/> {plan.statesExpanded} search states explored</span><span>{plan.remainingHours}h left</span></div>
    </>;
  }

  function renderOverview() {
    return <>
      <section className="stats-grid">
        <div className="stat-card"><div className="stat-icon lavender"><BookOpen size={18}/></div><span>Topics added</span><strong>{topics.length}</strong><small>Across your subjects</small></div>
        <div className="stat-card"><div className="stat-icon peach"><Clock3 size={18}/></div><span>Study time available</span><strong>{hours} <i>hrs</i></strong><small>For this planning session</small></div>
        <div className="stat-card"><div className="stat-icon mint"><CheckSquare size={18}/></div><span>Topics completed</span><strong>{completedCount}</strong><small>Keep your momentum going</small></div>
        <div className="stat-card"><div className="stat-icon pink"><Flame size={18}/></div><span>Goals completed</span><strong>{goals.filter(g=>g.done).length}/{goals.length}</strong><small>Your daily targets</small></div>
      </section>
      <div className="content-grid">
        <section className="panel planner-panel">
          <div className="panel-heading"><div><div className="eyebrow">YOUR STUDY SPACE</div><h2>Build your study plan</h2><p>Tell AdaptIQ what you need to study. It will prioritise your topics.</p></div><div className="heading-icon"><WandSparkles size={20}/></div></div>
          <div className="hours-control"><label htmlFor="hours">Available study hours</label><div className="hours-input"><Clock3 size={16}/><input id="hours" type="number" min="0.5" step="0.5" value={hours} onChange={e => setHours(e.target.value)}/><span>hours</span></div></div>
          {renderTopicForm()}
          <div className="topic-list-head"><b>Your topics</b><span>{topics.length} added</span></div>
          {renderTopicRows()}
          <button className="generate-button" onClick={buildPlan} disabled={loading || topics.length===0}><Sparkles size={17}/>{loading ? "Creating your plan..." : "Generate my study plan"}</button>
          {error && <p className="error">{error}</p>}
        </section>
        <section className="panel results-panel"><div className="panel-heading"><div><div className="eyebrow">YOUR PERSONALISED ROUTINE</div><h2>Today's plan</h2><p>Based on your topics and available time.</p></div><div className="heading-icon peach"><CalendarDays size={20}/></div></div>{renderPlan()}</section>
      </div>
    </>;
  }

  function renderMyTopics() {
    return <section className="panel page-panel">
      <div className="panel-heading"><div><div className="eyebrow">SUBJECTS & CHAPTERS</div><h2>My Topics</h2><p>Add topics, set their urgency and track what you have completed.</p></div><div className="heading-icon"><BookMarked size={20}/></div></div>
      {renderTopicForm()}
      <div className="topic-list-head"><b>All study topics</b><span>{topics.length} topics · {completedCount} completed</span></div>
      {renderTopicRows(true)}
      {error && <p className="error">{error}</p>}
    </section>;
  }

  function renderStudyPlanner() {
    return <div className="content-grid planner-page-grid">
      <section className="panel planner-panel"><div className="panel-heading"><div><div className="eyebrow">GREEDY BEST-FIRST SEARCH</div><h2>Plan a study session</h2><p>Choose how much time you have. AdaptIQ will prioritise the topics that fit.</p></div><div className="heading-icon"><WandSparkles size={20}/></div></div>
        <div className="hours-control"><label htmlFor="planner-hours">Available study hours</label><div className="hours-input"><Clock3 size={16}/><input id="planner-hours" type="number" min="0.5" step="0.5" value={hours} onChange={e => setHours(e.target.value)}/><span>hours</span></div></div>
        <div className="planner-info"><b>{topics.filter(t=>!t.completed).length} active topics ready</b><span>Completed topics are excluded from the next plan. Update topic details in My Topics.</span></div>
        <button className="generate-button" onClick={buildPlan} disabled={loading || !topics.some(t=>!t.completed)}><Sparkles size={17}/>{loading ? "Creating your plan..." : "Generate my study plan"}</button>
        {error && <p className="error">{error}</p>}
      </section>
      <section className="panel results-panel"><div className="panel-heading"><div><div className="eyebrow">GENERATED OUTPUT</div><h2>Your study schedule</h2><p>Topics are selected according to the search heuristic.</p></div><div className="heading-icon peach"><CalendarDays size={20}/></div></div>{renderPlan()}</section>
    </div>;
  }

  function renderProgress() {
    const total = topics.length;
    const percent = total ? Math.round(completedCount / total * 100) : 0;
    const goalDone = goals.filter(g=>g.done).length;
    return <div className="progress-page-grid">
      <section className="stats-grid progress-stats">
        <div className="stat-card"><div className="stat-icon lavender"><BookOpen size={18}/></div><span>Total topics</span><strong>{total}</strong><small>In your study list</small></div>
        <div className="stat-card"><div className="stat-icon mint"><CheckCircle2 size={18}/></div><span>Completed topics</span><strong>{completedCount}</strong><small>Marked as complete</small></div>
        <div className="stat-card"><div className="stat-icon peach"><Target size={18}/></div><span>Completion rate</span><strong>{percent}%</strong><small>Based on your topic list</small></div>
        <div className="stat-card"><div className="stat-icon pink"><Trophy size={18}/></div><span>Goals achieved</span><strong>{goalDone}/{goals.length}</strong><small>Personal targets</small></div>
      </section>
      <section className="panel page-panel"><div className="panel-heading"><div><div className="eyebrow">YOUR LEARNING ACTIVITY</div><h2>Topic completion</h2><p>Mark topics complete in My Topics to update this progress.</p></div><div className="heading-icon"><BarChart3 size={20}/></div></div>
        <div className="large-progress"><div className="large-progress-label"><b>Overall topic progress</b><strong>{percent}%</strong></div><div className="progress-track"><div style={{width:`${percent}%`}}/></div><span>{completedCount} of {total} topics completed</span></div>
        {renderTopicRows(true)}
      </section>
    </div>;
  }

  function renderGoals() {
    return <section className="panel page-panel goals-panel"><div className="panel-heading"><div><div className="eyebrow">SMALL STEPS, STEADY PROGRESS</div><h2>My Goals</h2><p>Set simple study targets and tick them off as you complete them.</p></div><div className="heading-icon"><Target size={20}/></div></div>
      <form className="goal-form" onSubmit={addGoal}><input value={goalInput} onChange={e=>setGoalInput(e.target.value)} placeholder="e.g. Revise AI Unit 1" aria-label="New goal"/><button className="add-button" type="submit"><Plus size={15}/> Add goal</button></form>
      <div className="goal-summary"><div><span>Goals completed</span><b>{goals.filter(g=>g.done).length} / {goals.length}</b></div><div className="progress-track"><div style={{width:`${goals.length ? goals.filter(g=>g.done).length/goals.length*100 : 0}%`}}/></div></div>
      <div className="goal-list">{goals.length ? goals.map(g=><div className={`goal-row ${g.done ? "goal-done" : ""}`} key={g.id}><button onClick={()=>toggleGoal(g.id)}>{g.done ? <CheckCircle2 size={19}/> : <Circle size={19}/>}</button><span>{g.title}</span><small>{g.done ? "Completed" : "In progress"}</small></div>) : <div className="empty-inline"><Target size={22}/><b>No goals yet</b><span>Add your first goal above.</span></div>}</div>
    </section>;
  }

  function renderActivePage() {
    switch (active) {
      case "My Topics": return renderMyTopics();
      case "Study Planner": return renderStudyPlanner();
      case "Progress": return renderProgress();
      case "Goals": return renderGoals();
      default: return renderOverview();
    }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><GraduationCap size={21}/></div><span>Adapt<span className="brand-accent">IQ</span></span><button className="close-mobile-nav" onClick={()=>setMobileNavOpen(false)}><X size={18}/></button></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{navItems.map(([name, Icon]) => <button key={name} className={`nav-item ${active === name ? "active" : ""}`} onClick={() => {setActive(name);setMobileNavOpen(false);}}><Icon size={17}/>{name}</button>)}</nav>
      <div className="sidebar-bottom"><div className="mini-card"><Sparkles size={17}/><b>Small steps add up.</b><span>Stay consistent, one topic at a time.</span></div>
        <div className="profile"><div className="avatar">S</div><div><b>Swasti</b><small>Personal study hub</small></div><Settings size={16}/></div>
      </div>
    </aside>
    {mobileNavOpen && <button className="nav-backdrop" aria-label="Close navigation" onClick={()=>setMobileNavOpen(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileNavOpen(true)}><Menu size={20}/></button><div className="crumb">Workspace <ChevronRight size={14}/> <b>{active}</b></div><div className="top-actions"><span className="date-chip"><CalendarDays size={15}/> Your study space</span><div className="avatar">S</div></div></header>
      <section className="welcome"><div><div className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL STUDY SPACE</div><h1>{active === "Overview" ? <>Make today <em>count.</em></> : <>{active} <em>space.</em></>}</h1><p>{active === "Overview" ? "A calmer way to organise your subjects, plan your time and keep moving forward." : `Manage your ${active.toLowerCase()} and keep moving forward, one step at a time.`}</p></div><div className="welcome-art"><div className="art-orbit"></div><BookOpen size={54}/><Sparkles className="art-spark" size={20}/></div></section>
      {renderActivePage()}
      <footer className="footer"><span>AdaptIQ</span><span>Plan with purpose. Learn at your pace.</span><span><CircleHelp size={14}/> Built for focused study</span></footer>
    </main>
  </div>;
}

export default App;
