import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Plus, 
  Minus, 
  Flame, 
  Clock, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  Target 
} from "lucide-react";

export function InteractiveShowcase() {
  // --- Timer State ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleStartPause = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Habits State ---
  const [habits, setHabits] = useState([
    { id: 1, text: "Estudar Programação (React)", completed: false },
    { id: 2, text: "Ler 10 páginas de um livro", completed: false },
    { id: 3, text: "Revisar vocabulário de Inglês", completed: false },
  ]);
  const [streak, setStreak] = useState(4);

  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          const newCompleted = !habit.completed;
          // Dynamically adjust streak based on completion
          if (newCompleted) {
            const allElseCompleted = prev.every((h) => h.id === id || h.completed);
            if (allElseCompleted) setStreak((s) => s + 1);
          } else {
            const allCompletedBefore = prev.every((h) => h.completed);
            if (allCompletedBefore) setStreak((s) => Math.max(4, s - 1));
          }
          return { ...habit, completed: newCompleted };
        }
        return habit;
      })
    );
  };

  const completedCount = habits.filter((h) => h.completed).length;

  // --- Finance Goal State ---
  const [savings, setSavings] = useState(450);
  const goalTarget = 1000;

  const adjustSavings = (amount) => {
    setSavings((prev) => Math.min(goalTarget, Math.max(0, prev + amount)));
  };

  const progressPercent = Math.min(100, Math.round((savings / goalTarget) * 100));

  return (
    <section className="w-full py-8 mt-4 relative z-20">
      {/* Container Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-secondary" />
          <span>LearnHub em Ação</span>
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight leading-tight">
          Painel de Foco Interativo
        </h2>
        <p className="text-on-surface-variant text-base md:text-lg">
          Experimente alguns dos nossos principais módulos diretamente da nossa vitrine de aprendizado.
        </p>
      </div>

      {/* Grid of Interactive Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch w-full max-w-7xl mx-auto">
        
        {/* Widget 1: Focus Timer */}
        <div className="glass-card p-8 rounded-[32px] border border-outline-variant/20 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Gestão de Tempo
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-bold text-on-surface mb-2">Cronômetro de Foco</h3>
            <p className="text-xs text-on-surface-variant mb-8 leading-relaxed">
              Mantenha o foco absoluto usando o método Pomodoro. Experimente iniciar o contador!
            </p>
          </div>

          <div className="flex flex-col items-center justify-center my-6">
            {/* Timer Display */}
            <div className="relative flex items-center justify-center">
              <div className="text-6xl font-mono font-black text-on-surface tracking-tighter tabular-nums drop-shadow-sm select-none">
                {formatTime(timeLeft)}
              </div>
              {isRunning && (
                <span className="absolute -top-4 text-[10px] font-bold text-primary tracking-widest uppercase animate-pulse">
                  Focando
                </span>
              )}
            </div>

            {/* Circular Progress Mock Ring */}
            <div className="w-full max-w-[200px] h-1.5 bg-outline-variant/20 rounded-full mt-8 overflow-hidden relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: `${(timeLeft / (25 * 60)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleStartPause}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                isRunning 
                  ? "bg-secondary/15 border border-secondary/30 text-secondary hover:bg-secondary/20" 
                  : "bg-primary text-on-primary hover:bg-primary/95 shadow-primary/10 hover:shadow-primary/20"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" /> <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> <span>Iniciar Foco</span>
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="p-3.5 border border-outline-variant/40 rounded-2xl hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Widget 2: Habit Tracker */}
        <div className="glass-card p-8 rounded-[32px] border border-outline-variant/20 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-secondary/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-secondary/10 transition-colors" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" /> Hábitos & Streaks
              </span>
              <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streak} Dias</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-on-surface mb-2">Checklist de Hábitos</h3>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              Marque as atividades concluídas para manter sua ofensiva ativa e desenvolver consistência acadêmica. Se marcar todas, seu streak aumenta!
            </p>
          </div>

          <div className="flex flex-col gap-3 my-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer select-none transition-all duration-300 ${
                  habit.completed
                    ? "bg-secondary/5 border-secondary/30 text-on-surface"
                    : "bg-surface-container-lowest/40 border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/50 hover:bg-surface-container-lowest/60"
                }`}
              >
                <span className={`text-xs font-medium transition-all ${habit.completed ? "line-through opacity-70" : ""}`}>
                  {habit.text}
                </span>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    habit.completed
                      ? "bg-secondary text-on-secondary scale-110"
                      : "border border-outline-variant/60"
                  }`}
                >
                  {habit.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            ))}
          </div>

          {/* Habits progress bar info */}
          <div className="mt-4 pt-4 border-t border-outline-variant/10">
            <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant mb-2">
              <span>{completedCount} de {habits.length} concluídos</span>
              <span>{Math.round((completedCount / habits.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-secondary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(completedCount / habits.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Widget 3: Finance Goal Tracker */}
        <div className="glass-card p-8 rounded-[32px] border border-outline-variant/20 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-tertiary/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-tertiary/10 transition-colors" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Planejamento Financeiro
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-tertiary/10 text-tertiary rounded-md">Meta Dinâmica</span>
            </div>
            
            <h3 className="text-xl font-bold text-on-surface mb-2">Poupança e Objetivos</h3>
            <p className="text-xs text-on-surface-variant mb-8 leading-relaxed">
              Mantenha o foco em seus objetivos financeiros de médio prazo. Aumente e diminua as economias simuladas abaixo!
            </p>
          </div>

          <div className="flex flex-col items-center my-4">
            {/* Money progress indicator */}
            <div className="text-center space-y-1 select-none">
              <span className="text-xs font-medium text-on-surface-variant">Reserva Acumulada</span>
              <div className="text-4xl font-extrabold text-on-surface tracking-tight flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-emerald-500" />
                <span className="font-mono">{savings}</span>
                <span className="text-xs font-bold text-on-surface-variant/70 ml-1">/ R$ {goalTarget}</span>
              </div>
            </div>

            {/* Savings dynamic progress bar */}
            <div className="w-full h-2 bg-outline-variant/20 rounded-full mt-8 overflow-hidden relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-tertiary rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
            </div>
            
            {/* Celebrate goal target reached */}
            <div className="h-6 mt-3 flex items-center justify-center">
              <AnimatePresence>
                {progressPercent >= 100 && (
                  <motion.span
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" /> Meta atingida! Parabéns! 🎉
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => adjustSavings(-50)}
              disabled={savings <= 0}
              className="py-3 px-4 border border-outline-variant/40 rounded-2xl hover:bg-surface-container-low text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <Minus className="w-3.5 h-3.5 text-red-500" /> <span>Retirar R$ 50</span>
            </button>
            <button
              onClick={() => adjustSavings(50)}
              disabled={savings >= goalTarget}
              className="py-3 px-4 border border-outline-variant/40 rounded-2xl hover:bg-surface-container-low text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500" /> <span>Adicionar R$ 50</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
