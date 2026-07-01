import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownRight, 
  Sparkles, 
  Send, 
  X, 
  Wallet, 
  ArrowLeft, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  Home, 
  CreditCard, 
  BookOpen,
  Code,
  ShoppingBag,
  Cpu,
  Music,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import FinancasBg from '../IMG/FINANCA.jpg';
import './financas.css';

// Ticker effect component for rolling numbers
const AnimatedCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    let start = displayValue;
    const end = parseFloat(value);
    if (start === end) return;
    
    const range = end - start;
    const duration = 800; // ms
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      const current = start + range * progressRatio;
      setDisplayValue(current);
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      R$ {displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};

export default function ModuloFinancas() {
  const navigate = useNavigate();
  const [showDashboard, setShowDashboard] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Dashboard values (start at 0)
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [cardBalance, setCardBalance] = useState(0);

  // Custom Card states
  const [cardBrand, setCardBrand] = useState('VISA');
  const [cardNumber, setCardNumber] = useState('**** **** 1287 2342');
  const [cardExpiration, setCardExpiration] = useState('05/29');
  const [cardColor, setCardColor] = useState('lime');
  const [cardNickname, setCardNickname] = useState('Principal');

  // Modals visibility states
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txModalType, setTxModalType] = useState('saque'); // 'saque' or 'deposito'
  const [tempTxValue, setTempTxValue] = useState('');
  const [tempTxDesc, setTempTxDesc] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Input states for balance modal
  const [tempBalance, setTempBalance] = useState('');
  const [tempSaved, setTempSaved] = useState('');

  // Input states for card modal
  const [tempCardBrand, setTempCardBrand] = useState('VISA');
  const [tempCardNumber, setTempCardNumber] = useState('**** **** 1287 2342');
  const [tempCardExpiration, setTempCardExpiration] = useState('05/29');
  const [tempCardColor, setTempCardColor] = useState('lime');
  const [tempCardNickname, setTempCardNickname] = useState('Principal');
  const [tempCardBalance, setTempCardBalance] = useState('');

  // Transactions list (start empty)
  const [transacoes, setTransacoes] = useState([]);

  // AI Chat States
  const [chatMessages, setChatMessages] = useState([
    { 
      sender: 'ia', 
      text: 'Olá! Sou seu assistente financeiro pessoal com IA. Posso te ajudar a registrar seus gastos ou entradas em tempo real. Digite algo como "gastei 200 com manutenção" ou "recebi 1200 de freelancer" para testar!' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // 1. Observe Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Load data from localStorage if offline
        const localSummary = localStorage.getItem('financas_resumo');
        const localTx = localStorage.getItem('financas_transacoes');
        if (localSummary) {
          const parsed = JSON.parse(localSummary);
          setTotalBalance(parsed.totalBalance || 0);
          setTotalSpending(parsed.totalSpending || 0);
          setTotalSaved(parsed.totalSaved || 0);
          setCardBalance(parsed.cardBalance || 0);
          setCardBrand(parsed.cardBrand || 'VISA');
          setCardNumber(parsed.cardNumber || '**** **** 1287 2342');
          setCardExpiration(parsed.cardExpiration || '05/29');
          setCardColor(parsed.cardColor || 'lime');
          setCardNickname(parsed.cardNickname || 'Principal');
        } else {
          setTotalBalance(0);
          setTotalSpending(0);
          setTotalSaved(0);
          setCardBalance(0);
          setCardBrand('VISA');
          setCardNumber('**** **** 1287 2342');
          setCardExpiration('05/29');
          setCardColor('lime');
          setCardNickname('Principal');
        }
        if (localTx) {
          setTransacoes(JSON.parse(localTx));
        } else {
          setTransacoes([]);
        }
      }
    });
    return unsubscribe;
  }, []);

  // 2. Load Real-time Data from Firebase when user is logged in
  useEffect(() => {
    if (!user) return;

    // Listen to summary
    const summaryRef = doc(db, 'financas_resumo', user.uid);
    const unsubSummary = onSnapshot(summaryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTotalBalance(data.totalBalance || 0);
        setTotalSpending(data.totalSpending || 0);
        setTotalSaved(data.totalSaved || 0);
        setCardBalance(data.cardBalance || 0);
        setCardBrand(data.cardBrand || 'VISA');
        setCardNumber(data.cardNumber || '**** **** 1287 2342');
        setCardExpiration(data.cardExpiration || '05/29');
        setCardColor(data.cardColor || 'lime');
        setCardNickname(data.cardNickname || 'Principal');
        localStorage.setItem('financas_resumo', JSON.stringify(data));
      } else {
        // If document doesn't exist, initialize it in Firebase
        const initialData = {
          totalBalance: 0,
          totalSpending: 0,
          totalSaved: 0,
          cardBalance: 0,
          cardBrand: 'VISA',
          cardNumber: '**** **** 1287 2342',
          cardExpiration: '05/29',
          cardColor: 'lime',
          cardNickname: 'Principal'
        };
        setDoc(summaryRef, initialData);
        setTotalBalance(0);
        setTotalSpending(0);
        setTotalSaved(0);
        setCardBalance(0);
        setCardBrand('VISA');
        setCardNumber('**** **** 1287 2342');
        setCardExpiration('05/29');
        setCardColor('lime');
        setCardNickname('Principal');
        localStorage.setItem('financas_resumo', JSON.stringify(initialData));
      }
    }, (err) => {
      console.error("Firestore summary error: ", err);
    });

    // Listen to transactions
    const txQuery = query(collection(db, 'financas_transacoes'), where('userId', '==', user.uid));
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const txData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by createdAt descending
      txData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setTransacoes(txData);
      localStorage.setItem('financas_transacoes', JSON.stringify(txData));
    }, (err) => {
      console.error("Firestore transactions error: ", err);
    });

    return () => {
      unsubSummary();
      unsubTx();
    };
  }, [user]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);


  // Map icon strings to Lucide components
  const getTxIcon = (iconName) => {
    switch (iconName) {
      case 'Code': return Code;
      case 'ShoppingBag': return ShoppingBag;
      case 'Cpu': return Cpu;
      case 'Music': return Music;
      case 'BookOpen': return BookOpen;
      default: return Wallet;
    }
  };

  // Mock NLP processor
  const processAICmd = (text) => {
    const textLower = text.toLowerCase();
    const numberPattern = /\b\d+(?:[.,]\d+)?\b/g;
    const matches = textLower.match(numberPattern);
    
    if (!matches) {
      return {
        reply: "Não consegui identificar nenhum valor numérico na sua mensagem. Pode reformular? Exemplo: 'gastei 150 reais com livros'.",
        success: false
      };
    }
    
    const valString = matches[0].replace('.', '').replace(',', '.');
    const valor = parseFloat(valString);
    
    if (isNaN(valor) || valor <= 0) {
      return {
        reply: "O valor informado parece inválido. Por favor, tente novamente.",
        success: false
      };
    }

    const isExpense = /gast|saida|saída|compr|pagu|perdi|cust|manuten|livr|lanche|raç/i.test(textLower);
    const isIncome = /receb|ganh|entrad|freel|salari|salári|receita|deposi/i.test(textLower);
    const isSave = /guard|reserv|poup|estud|projet/i.test(textLower);

    if (isSave) {
      return {
        type: 'save',
        value: valor,
        reply: `Perfeito! Guardei R$ ${valor.toFixed(2)} na sua Reserva para Estudos e Projetos. Seu saldo principal foi atualizado.`,
        success: true
      };
    } else if (isExpense) {
      let category = 'Outros';
      let icon = 'ShoppingBag';
      if (/livr|estud|facul|curs|soft/i.test(textLower)) {
        category = 'Estudos';
        icon = 'BookOpen';
      } else if (/lanche|comid|restaur|raç/i.test(textLower)) {
        category = 'Alimentação';
        icon = 'ShoppingBag';
      } else if (/peça|hardw|comput/i.test(textLower)) {
        category = 'Hardware';
        icon = 'Cpu';
      }
      
      let desc = "Gasto registrado";
      if (/livr/i.test(textLower)) desc = "Compra de Livros";
      else if (/lanche/i.test(textLower)) desc = "Lanche / Refeição";
      else if (/raç/i.test(textLower)) desc = "Ração para pets";
      else if (/soft/i.test(textLower)) desc = "Licença de Software";
      else if (/hardw/i.test(textLower)) desc = "Peças de Hardware";
      else if (/manuten/i.test(textLower)) desc = "Manutenção";
      
      return {
        type: 'expense',
        value: valor,
        desc: desc,
        category: category,
        icon: icon,
        reply: `Registrado! Lancei uma saída de R$ ${valor.toFixed(2)} em "${desc}" (categoria: ${category}). Os gráficos foram atualizados.`,
        success: true
      };
    } else if (isIncome || textLower.includes('recebi') || textLower.includes('ganhei')) {
      let desc = "Receita extra";
      if (/freel/i.test(textLower)) desc = "Trabalho Freelancer";
      else if (/salari/i.test(textLower)) desc = "Salário Mensal";
      else if (/bolsa/i.test(textLower)) desc = "Bolsa de Estudos";
      
      return {
        type: 'income',
        value: valor,
        desc: desc,
        category: 'Renda',
        icon: 'Wallet',
        reply: `Excelente! Registrei uma entrada de R$ ${valor.toFixed(2)} proveniente de "${desc}". Seu saldo atual foi aumentado!`,
        success: true
      };
    } else {
      return {
        reply: `Identifiquei o valor de R$ ${valor.toFixed(2)}, mas não entendi se foi um gasto, uma entrada ou se deseja guardar na reserva. Poderia especificar? Ex: 'gastei ${valor}' ou 'recebi ${valor}'.`,
        success: false
      };
    }
  };

  const handleUpdateFinanceData = async ({ type, value, desc, category, icon }) => {
    let newBalance = totalBalance;
    let newSpending = totalSpending;
    let newSaved = totalSaved;
    let newCardBalance = cardBalance;

    if (type === 'save') {
      newBalance = Math.max(0, totalBalance - value);
      newSaved = totalSaved + value;
    } else if (type === 'expense') {
      newSpending = totalSpending + value;
      newBalance = totalBalance - value;
    } else if (type === 'income') {
      newBalance = totalBalance + value;
    } else if (type === 'transfer') {
      newBalance = Math.max(0, totalBalance - value);
      newSpending = totalSpending + value;
      newCardBalance = Math.max(0, cardBalance - value);
    }

    const txDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    const newTx = {
      nome: desc,
      valor: type === 'income' ? value : -value,
      data: txDate,
      categoria: category,
      icone: icon,
      createdAt: Date.now()
    };

    if (user) {
      try {
        await addDoc(collection(db, 'financas_transacoes'), {
          ...newTx,
          userId: user.uid
        });

        const summaryRef = doc(db, 'financas_resumo', user.uid);
        await setDoc(summaryRef, {
          totalBalance: newBalance,
          totalSpending: newSpending,
          totalSaved: newSaved,
          cardBalance: newCardBalance
        }, { merge: true });
      } catch (err) {
        console.error("Erro ao salvar no Firestore: ", err);
      }
    } else {
      const offlineTx = { id: Date.now().toString(), ...newTx };
      const updatedTx = [offlineTx, ...transacoes];
      setTransacoes(updatedTx);
      setTotalBalance(newBalance);
      setTotalSpending(newSpending);
      setTotalSaved(newSaved);
      setCardBalance(newCardBalance);

      localStorage.setItem('financas_transacoes', JSON.stringify(updatedTx));
      localStorage.setItem('financas_resumo', JSON.stringify({
        totalBalance: newBalance,
        totalSpending: newSpending,
        totalSaved: newSaved,
        cardBalance: newCardBalance
      }));
    }
  };

  const handleSaveBalance = async (e) => {
    e.preventDefault();
    const newBal = parseFloat(tempBalance) || 0;
    const newSav = parseFloat(tempSaved) || 0;

    if (user) {
      try {
        const summaryRef = doc(db, 'financas_resumo', user.uid);
        await setDoc(summaryRef, {
          totalBalance: newBal,
          totalSaved: newSav
        }, { merge: true });
      } catch (err) {
        console.error("Erro ao salvar saldo no Firestore: ", err);
      }
    } else {
      setTotalBalance(newBal);
      setTotalSaved(newSav);
      const localSummary = JSON.parse(localStorage.getItem('financas_resumo') || '{}');
      const updated = {
        ...localSummary,
        totalBalance: newBal,
        totalSaved: newSav
      };
      localStorage.setItem('financas_resumo', JSON.stringify(updated));
    }
    setShowBalanceModal(false);
  };

  const handleResetAllData = async () => {
    setTotalBalance(0);
    setTotalSpending(0);
    setTotalSaved(0);
    setCardBalance(0);
    setTransacoes([]);

    localStorage.removeItem('financas_transacoes');
    localStorage.setItem('financas_resumo', JSON.stringify({
      totalBalance: 0,
      totalSpending: 0,
      totalSaved: 0,
      cardBalance: 0,
      cardBrand: 'VISA',
      cardNumber: '**** **** 1287 2342',
      cardExpiration: '05/29',
      cardColor: 'lime',
      cardNickname: 'Principal'
    }));

    if (user) {
      try {
        const summaryRef = doc(db, 'financas_resumo', user.uid);
        await setDoc(summaryRef, {
          totalBalance: 0,
          totalSpending: 0,
          totalSaved: 0,
          cardBalance: 0
        }, { merge: true });

        for (const tx of transacoes) {
          await deleteDoc(doc(db, 'financas_transacoes', tx.id));
        }
      } catch (err) {
        console.error("Erro ao zerar dados no Firestore: ", err);
      }
    }
    setShowResetConfirm(false);
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    const newCardBal = parseFloat(tempCardBalance) || 0;

    if (user) {
      try {
        const summaryRef = doc(db, 'financas_resumo', user.uid);
        await setDoc(summaryRef, {
          cardBrand: tempCardBrand,
          cardNumber: tempCardNumber,
          cardExpiration: tempCardExpiration,
          cardColor: tempCardColor,
          cardNickname: tempCardNickname,
          cardBalance: newCardBal
        }, { merge: true });
      } catch (err) {
        console.error("Erro ao salvar cartão no Firestore: ", err);
      }
    } else {
      setCardBrand(tempCardBrand);
      setCardNumber(cardNumber);
      setCardExpiration(tempCardExpiration);
      setCardColor(tempCardColor);
      setCardNickname(tempCardNickname);
      setCardBalance(newCardBal);

      const localSummary = JSON.parse(localStorage.getItem('financas_resumo') || '{}');
      const updated = {
        ...localSummary,
        cardBrand: tempCardBrand,
        cardNumber: tempCardNumber,
        cardExpiration: tempCardExpiration,
        cardColor: tempCardColor,
        cardNickname: tempCardNickname,
        cardBalance: newCardBal
      };
      localStorage.setItem('financas_resumo', JSON.stringify(updated));
    }
  };

  const handleExecuteTx = async (e) => {
    e.preventDefault();
    const val = parseFloat(tempTxValue) || 0;
    if (val <= 0) return;

    const isSaque = txModalType === 'saque';
    const txDesc = tempTxDesc.trim() || (isSaque ? 'Retirada / Saque' : 'Depósito efetuado');
    const category = isSaque ? 'Saque' : 'Depósito';
    const icon = isSaque ? 'ArrowDownRight' : 'Wallet';

    let newBalance = totalBalance;
    let newSpending = totalSpending;
    let newCardBalance = cardBalance;

    if (isSaque) {
      newBalance = Math.max(0, totalBalance - val);
      newSpending = totalSpending + val;
      newCardBalance = Math.max(0, cardBalance - val);
    } else {
      newBalance = totalBalance + val;
      newCardBalance = cardBalance + val;
    }

    const txDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    const newTx = {
      nome: txDesc,
      valor: isSaque ? -val : val,
      data: txDate,
      categoria: category,
      icone: icon,
      createdAt: Date.now()
    };

    if (user) {
      try {
        await addDoc(collection(db, 'financas_transacoes'), {
          ...newTx,
          userId: user.uid
        });

        const summaryRef = doc(db, 'financas_resumo', user.uid);
        await setDoc(summaryRef, {
          totalBalance: newBalance,
          totalSpending: newSpending,
          cardBalance: newCardBalance
        }, { merge: true });
      } catch (err) {
        console.error("Erro ao salvar transação no Firestore: ", err);
      }
    } else {
      const offlineTx = { id: Date.now().toString(), ...newTx };
      const updatedTx = [offlineTx, ...transacoes];
      setTransacoes(updatedTx);
      setTotalBalance(newBalance);
      setTotalSpending(newSpending);
      setCardBalance(newCardBalance);

      localStorage.setItem('financas_transacoes', JSON.stringify(updatedTx));
      localStorage.setItem('financas_resumo', JSON.stringify({
        totalBalance: newBalance,
        totalSpending: newSpending,
        totalSaved,
        cardBalance: newCardBalance,
        cardBrand,
        cardNumber,
        cardExpiration,
        cardColor,
        cardNickname
      }));
    }

    setShowTxModal(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const result = processAICmd(userMsg);
      
      if (result.success) {
        handleUpdateFinanceData({
          type: result.type,
          value: result.value,
          desc: result.desc || 'Reserva para Estudos',
          category: result.category || 'Reserva',
          icon: result.icon || 'PiggyBank'
        });
      }

      setChatMessages(prev => [...prev, { sender: 'ia', text: result.reply }]);
      setIsTyping(false);
    }, 1000);
  };

  // SVG Chart bezier coordinates (width: 550, height: 150)
  const chartBezierPath = "M 30,120 C 70,110 90,90 130,90 C 170,90 190,105 230,105 C 270,105 290,65 330,65 C 370,65 390,75 430,75 C 470,75 480,25 520,25";
  const chartGradientPath = `${chartBezierPath} L 520,150 L 30,150 Z`;

  const monthlyExpenses = useMemo(() => {
    const displayMonths = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
    const totals = { Abr: 0, Mai: 0, Jun: 0, Jul: 0, Ago: 0, Set: 0 };

    transacoes.forEach(tx => {
      if (tx.valor < 0) {
        const lowerDate = tx.data.toLowerCase();
        if (lowerDate.includes('apr') || lowerDate.includes('abr')) totals.Abr += Math.abs(tx.valor);
        else if (lowerDate.includes('may') || lowerDate.includes('mai')) totals.Mai += Math.abs(tx.valor);
        else if (lowerDate.includes('jun')) totals.Jun += Math.abs(tx.valor);
        else if (lowerDate.includes('jul')) totals.Jul += Math.abs(tx.valor);
        else if (lowerDate.includes('aug') || lowerDate.includes('ago')) totals.Ago += Math.abs(tx.valor);
        else if (lowerDate.includes('sep') || lowerDate.includes('set')) totals.Set += Math.abs(tx.valor);
      }
    });

    const maxSpend = Math.max(...Object.values(totals), 100);

    return displayMonths.map(m => {
      const val = totals[m];
      const pct = Math.min((val / maxSpend) * 80, 80);
      
      const currentMonthIndex = new Date().getMonth(); // 0-11
      const monthsPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const active = m === monthsPt[currentMonthIndex] || (m === 'Jul' && displayMonths.indexOf(monthsPt[currentMonthIndex]) === -1);

      return {
        month: m,
        height: `${Math.max(5, pct)}%`,
        value: val,
        active
      };
    });
  }, [transacoes]);

  const activeMonthSpending = useMemo(() => {
    const activeBar = monthlyExpenses.find(b => b.active) || monthlyExpenses.find(b => b.month === 'Jul');
    return activeBar ? activeBar.value : 0;
  }, [monthlyExpenses]);

  const activeIndex = useMemo(() => {
    const idx = monthlyExpenses.findIndex(bar => bar.active);
    return idx !== -1 ? idx : 3;
  }, [monthlyExpenses]);

  const badgeLeft = useMemo(() => {
    return `${(activeIndex * 16.66) + 8.33}%`;
  }, [activeIndex]);

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="financas-page-wrapper">
      <AnimatePresence mode="wait">
        {!showDashboard ? (
          /* HERO LANDING PAGE */
          <motion.div 
            key="hero"
            className="financas-hero-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <img src={FinancasBg} alt="Finanças" className="financas-hero-bg" />
            <div className="financas-hero-overlay"></div>
            
            <div className="financas-hero-content">
              <header className="financas-hero-header">
                <button className="financas-back-btn" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft size={16} /> Voltar ao Painel
                </button>
              </header>

              <div className="financas-hero-center">
                <motion.h1 
                  className="financas-hero-title"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Finanças
                </motion.h1>
                <motion.p 
                  className="financas-hero-subtitle"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Monitore despesas, planeje suas metas e tome decisões financeiras inteligentes auxiliado por IA.
                </motion.p>
                <motion.button 
                  className="financas-hero-action-btn"
                  onClick={() => setShowDashboard(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Acessar Painel Financeiro <ArrowRight size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* FULL FINANCIAL DASHBOARD (OFF-WHITE THEME) */
          <motion.div 
            key="dashboard"
            className={`financas-dashboard-layout ${chatOpen ? 'sidebar-active' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Sidebar Dim Layer */}
            {chatOpen && (
              <div className="dashboard-dim-overlay" onClick={() => setChatOpen(false)}></div>
            )}

            {/* LEFT NAVIGATION BAR */}
            <aside className="dashboard-nav-sidebar">
              <div className="sidebar-logo-area">
                <div className="logo-spark-icon" onClick={() => setShowDashboard(false)}>
                  <Plus size={20} className="rotate-45 text-[#22c55e]" />
                </div>
              </div>
              
              <nav className="sidebar-links">
                <button className="sidebar-nav-item active" onClick={() => navigate('/dashboard')} title="Voltar ao Painel Geral"><Home size={20} /></button>
              </nav>
            </aside>

            {/* MAIN DASHBOARD CONTENT AREA */}
            <motion.main 
              className="dashboard-main-container"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Header bar */}
              <div className="dashboard-header-bar">
                <div>
                  <h2 className="welcome-title text-black">Bem-vindo de volta!</h2>
                  <span className="welcome-subtitle">Painel Financeiro</span>
                </div>
              </div>

              {/* 3-Column Dashboard Content Layout */}
              <div className="dashboard-grid-content">
                
                {/* LEFT & CENTER COMBO COLUMN */}
                <div className="dashboard-left-center-area">
                  
                  {/* Top Stats Cards Row */}
                  <div className="dashboard-stats-row">
                    
                    {/* Card 1: Balance (Dark Background) */}
                    <motion.div 
                      className="stats-card-dark cursor-pointer" 
                      variants={cardVariant}
                      onClick={() => {
                        setTempBalance(totalBalance.toString());
                        setTempSaved(totalSaved.toString());
                        setShowBalanceModal(true);
                      }}
                    >
                      <div className="stats-card-header">
                        <div className="stats-icon-circle-neon">
                          <span className="font-extrabold text-sm">$</span>
                        </div>
                        <button className="stats-more-btn" onClick={(e) => {
                          e.stopPropagation();
                          setTempBalance(totalBalance.toString());
                          setTempSaved(totalSaved.toString());
                          setShowBalanceModal(true);
                        }}><Plus size={14} className="rotate-45" /></button>
                      </div>
                      <div className="stats-card-body">
                        <span className="stats-label text-zinc-400">Saldo Principal</span>
                        <h4 className="stats-value-main">
                          <AnimatedCounter value={totalBalance} />
                        </h4>
                      </div>
                    </motion.div>

                    {/* Card 2: Spending (Light Background) */}
                    <motion.div className="stats-card-light" variants={cardVariant}>
                      <div className="stats-card-header">
                        <div className="stats-icon-circle-grey blue">
                          <RefreshCw size={14} className="text-[#38bdf8]" />
                        </div>
                        <button className="stats-more-btn-light"><Plus size={14} className="rotate-45" /></button>
                      </div>
                      <div className="stats-card-body">
                        <span className="stats-label-light">Total Gasto</span>
                        <h4 className="stats-value-neutral-light">
                          <AnimatedCounter value={totalSpending} />
                        </h4>
                      </div>
                    </motion.div>

                    {/* Card 3: Saved (Light Background) */}
                    <motion.div 
                      className="stats-card-light cursor-pointer" 
                      variants={cardVariant}
                      onClick={() => {
                        setTempBalance(totalBalance.toString());
                        setTempSaved(totalSaved.toString());
                        setShowBalanceModal(true);
                      }}
                    >
                      <div className="stats-card-header">
                        <div className="stats-icon-circle-grey text-zinc-700">
                          <CreditCard size={14} />
                        </div>
                        <button className="stats-more-btn-light" onClick={(e) => {
                          e.stopPropagation();
                          setTempBalance(totalBalance.toString());
                          setTempSaved(totalSaved.toString());
                          setShowBalanceModal(true);
                        }}><Plus size={14} className="rotate-45" /></button>
                      </div>
                      <div className="stats-card-body">
                        <span className="stats-label-light">Total Guardado</span>
                        <h4 className="stats-value-neutral-light">
                          <AnimatedCounter value={totalSaved} />
                        </h4>
                      </div>
                    </motion.div>

                  </div>

                  {/* Sub-grid: Left Column (Graphs) & Right Column (Transactions) */}
                  <div className="dashboard-sub-grid mt-6">
                    
                    {/* Sub-column 1: Graphs */}
                    <div className="dashboard-left-graphs-col">
                      
                      {/* Income Graph */}
                      <motion.div className="dashboard-card-wrapper" variants={cardVariant}>
                        <div className="card-header-row">
                          <h3 className="card-inner-title text-black">Receitas</h3>
                          <span className="card-header-info">30 dias</span>
                        </div>

                        <div className="card-value-highlight">
                          <span className="highlight-price text-black">
                            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="highlight-percentage text-[#22c55e] flex items-center gap-0.5">
                            <TrendingUp size={12} /> +28%
                          </span>
                        </div>

                        <div className="chart-canvas-area">
                          <svg viewBox="0 0 550 150" className="w-full h-full">
                            <defs>
                              <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <motion.path 
                              d={chartGradientPath} 
                              fill="url(#green-grad)"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5, duration: 1 }}
                            />
                            <motion.path 
                              d={chartBezierPath} 
                              fill="none" 
                              stroke="#22c55e" 
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                            <circle cx="330" cy="65" r="5" fill="#18181b" stroke="#22c55e" strokeWidth="2.5" />
                          </svg>
                        </div>
                      </motion.div>

                      {/* Expences Bar Chart */}
                      <motion.div className="dashboard-card-wrapper mt-6" variants={cardVariant}>
                        <div className="card-header-row">
                          <h3 className="card-inner-title text-black">Despesas</h3>
                          <select className="card-header-select">
                            <option>Últimos 6 meses</option>
                            <option>Este Ano</option>
                          </select>
                        </div>

                        <div className="expenses-chart-container flex items-end justify-between h-36 pt-8 pb-1 px-2 relative">
                          {/* Selected Indicator floating badge */}
                          <div 
                            className="absolute top-[2px] transform -translate-x-1/2 bg-[#18181b] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#18181b] transition-all duration-300"
                            style={{ left: badgeLeft }}
                          >
                            R$ {activeMonthSpending.toFixed(0)}
                          </div>

                          {monthlyExpenses.map((bar, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                              <div className="w-8 bg-gray-100 rounded-full overflow-hidden relative flex items-end" style={{ height: '85px' }}>
                                <div 
                                  className={`w-full rounded-full transition-all duration-500 ${
                                    bar.active 
                                      ? 'bg-[#5c60f5]' 
                                      : 'stripe-bar-bg'
                                  }`}
                                  style={{ height: bar.height }}
                                >
                                  {bar.active && (
                                    <div className="absolute bottom-[80%] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400 font-semibold">{bar.month}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                    </div>

                    {/* Sub-column 2: Transactions */}
                    <div className="dashboard-middle-tx-col">
                      
                      <motion.div className="dashboard-card-wrapper h-full" variants={cardVariant}>
                        <div className="card-header-row">
                          <h3 className="card-inner-title text-black">Transações</h3>
                          <span className="card-header-info">Esta Semana</span>
                        </div>

                        <div className="transactions-list-scroller pr-1">
                          {transacoes.map((tx) => {
                            const Icon = getTxIcon(tx.icone);
                            const isNeg = tx.valor < 0;
                            
                            return (
                              <div key={tx.id} className="transaction-item-card">
                                <div className="tx-left-block">
                                  <div className="tx-icon-black">
                                    <Icon size={16} className="text-[#22c55e]" />
                                  </div>
                                  <div>
                                    <h5 className="tx-item-title text-black">{tx.nome}</h5>
                                    <span className="tx-item-date">{tx.data}</span>
                                  </div>
                                </div>
                                <span className={`tx-item-value ${isNeg ? 'neg' : 'pos'}`}>
                                  {isNeg ? '-' : '+'} R$ {Math.abs(tx.valor).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>

                    </div>

                  </div>

                </div>

                {/* RIGHT SIDEBAR PANEL */}
                <div className="dashboard-right-panel">
                  
                  {/* Credit Card Box */}
                  <motion.div className="credit-card-panel-dark" variants={cardVariant}>
                    <div className="credit-card-header">
                      <span className="card-header-label">Meus Cartões</span>
                      <button 
                        className="card-add-btn"
                        onClick={() => {
                          setTempCardBrand(cardBrand);
                          setTempCardNumber(cardNumber);
                          setTempCardExpiration(cardExpiration);
                          setTempCardColor(cardColor);
                          setTempCardNickname(cardNickname);
                          setTempCardBalance(cardBalance.toString());
                          setShowCardModal(true);
                        }}
                      ><Plus size={16} /></button>
                    </div>

                    {/* Actual Physical-looking Neon Card */}
                    <div 
                      className={`neon-credit-card ${cardColor} cursor-pointer`}
                      onClick={() => {
                        setTempCardBrand(cardBrand);
                        setTempCardNumber(cardNumber);
                        setTempCardExpiration(cardExpiration);
                        setTempCardColor(cardColor);
                        setTempCardNickname(cardNickname);
                        setTempCardBalance(cardBalance.toString());
                        setShowCardModal(true);
                      }}
                    >
                      <div className="neon-card-top">
                        <span className={`neon-brand font-bold italic ${cardColor === 'black' || cardColor === 'pink' || cardColor === 'blue' ? 'text-white' : 'text-black'}`}>{cardBrand}</span>
                        <span className={`neon-nickname font-semibold text-[11px] ${cardColor === 'black' || cardColor === 'pink' || cardColor === 'blue' ? 'text-zinc-300' : 'text-zinc-800'}`}>{cardNickname}</span>
                      </div>
                      
                      <div className="neon-card-middle">
                        <span className={`neon-card-value ${cardColor === 'black' || cardColor === 'pink' || cardColor === 'blue' ? 'text-white' : 'text-black'}`}>
                          R$ {cardBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="neon-card-bottom">
                        <span className={`neon-card-number ${cardColor === 'black' || cardColor === 'pink' || cardColor === 'blue' ? 'text-white' : 'text-black'}`}>{cardNumber}</span>
                        <span className={`neon-card-date ${cardColor === 'black' || cardColor === 'pink' || cardColor === 'blue' ? 'text-white' : 'text-black'}`}>Val. {cardExpiration}</span>
                      </div>
                    </div>

                    <div className="neon-card-buttons">
                      <button 
                        className="neon-card-action-btn flex items-center justify-center gap-1.5"
                        onClick={() => {
                          setTxModalType('saque');
                          setTempTxValue('');
                          setTempTxDesc('');
                          setShowTxModal(true);
                        }}
                      >
                        <TrendingUp size={14} /> Sacar
                      </button>
                      <button 
                        className="neon-card-action-btn flex items-center justify-center gap-1.5"
                        onClick={() => {
                          setTxModalType('deposito');
                          setTempTxValue('');
                          setTempTxDesc('');
                          setShowTxModal(true);
                        }}
                      >
                        <ArrowDownRight size={14} /> Depositar
                      </button>
                    </div>

                  </motion.div>

                </div>

              </div>
            </motion.main>

            {/* FLOATING ACTION BUTTON (FAB) FOR AI CHAT */}
            <motion.button 
              className="ai-chat-fab"
              onClick={() => setChatOpen(prev => !prev)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ 
                scale: [1, 1.03, 1],
                boxShadow: [
                  '0 4px 15px rgba(34, 197, 94, 0.3)',
                  '0 4px 25px rgba(34, 197, 94, 0.6)',
                  '0 4px 15px rgba(34, 197, 94, 0.3)'
                ]
              }}
              transition={{
                scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                boxShadow: { repeat: Infinity, duration: 3, ease: "easeInOut" }
              }}
            >
              <Sparkles size={20} className="text-[#22c55e]" />
            </motion.button>

            {/* AI SIDEBAR CHAT PANEL */}
            <AnimatePresence>
              {chatOpen && (
                <motion.aside 
                  className="ai-chat-sidebar"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  <div className="sidebar-chat-header">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#22c55e]" />
                      <span className="chat-header-title text-white">IA Assistente</span>
                    </div>
                    <button className="chat-close-btn text-gray-400 hover:text-white" onClick={() => setChatOpen(false)}>
                      <X size={18} />
                    </button>
                  </div>

                  <div className="sidebar-chat-messages">
                    {chatMessages.map((msg, index) => (
                      <motion.div 
                        key={index} 
                        className={`chat-bubble-row ${msg.sender === 'user' ? 'user' : 'ia'}`}
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="chat-bubble">
                          <p>{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <div className="chat-bubble-row ia">
                        <div className="chat-bubble typing-dots">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="sidebar-chat-footer">
                    <input 
                      type="text" 
                      placeholder="Gastei R$ 50 no almoço..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="chat-input-text"
                    />
                    <button type="submit" className="chat-send-btn">
                      <Send size={14} className="text-[#22c55e]" />
                    </button>
                  </form>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* MODAL AJUSTAR SALDO */}
            <AnimatePresence>
              {showBalanceModal && (
                <div className="modal-overlay" onClick={() => setShowBalanceModal(false)}>
                  <motion.div 
                    className="modal-window"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <h3>Ajustar Saldos</h3>
                      <button className="modal-close-btn" onClick={() => setShowBalanceModal(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={handleSaveBalance} className="modal-form">
                      <div className="modal-form-group">
                        <label htmlFor="modal-balance-input">Saldo Principal (R$)</label>
                        <input 
                          id="modal-balance-input"
                          type="number"
                          step="0.01"
                          placeholder="Ex: 5000.00"
                          value={tempBalance}
                          onChange={(e) => setTempBalance(e.target.value)}
                          required
                          className="modal-input"
                        />
                      </div>
                      <div className="modal-form-group">
                        <label htmlFor="modal-saved-input">Reserva de Estudos (R$)</label>
                        <input 
                          id="modal-saved-input"
                          type="number"
                          step="0.01"
                          placeholder="Ex: 1200.00"
                          value={tempSaved}
                          onChange={(e) => setTempSaved(e.target.value)}
                          required
                          className="modal-input"
                        />
                      </div>
                      <div className="modal-actions-row flex justify-between items-center w-full">
                        <button 
                          type="button" 
                          id="btn-reset-all" 
                          className="modal-reset-btn"
                          onClick={() => {
                            setShowBalanceModal(false);
                            setShowResetConfirm(true);
                          }}
                        >
                          Zerar Tudo
                        </button>
                        <div className="flex gap-2">
                          <button type="button" id="btn-cancel-balance" className="modal-cancel-btn" onClick={() => setShowBalanceModal(false)}>
                            Cancelar
                          </button>
                          <button type="submit" id="btn-save-balance" className="modal-submit-btn">
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* MODAL CONFIGURAR CARTÃO */}
            <AnimatePresence>
              {showCardModal && (
                <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
                  <motion.div 
                    className="modal-window card-modal-w"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <h3>Configurar Cartão</h3>
                      <button className="modal-close-btn" onClick={() => setShowCardModal(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={handleSaveCard} className="modal-form">
                      <div className="modal-form-grid">
                        <div className="modal-form-group">
                          <label htmlFor="modal-card-nickname">Apelido do Cartão</label>
                          <input 
                            id="modal-card-nickname"
                            type="text"
                            placeholder="Ex: Nubank, Principal"
                            value={tempCardNickname}
                            onChange={(e) => setTempCardNickname(e.target.value)}
                            required
                            className="modal-input"
                          />
                        </div>
                        <div className="modal-form-group">
                          <label htmlFor="modal-card-brand">Bandeira</label>
                          <select 
                            id="modal-card-brand"
                            value={tempCardBrand}
                            onChange={(e) => setTempCardBrand(e.target.value)}
                            className="modal-input select-input"
                          >
                            <option value="VISA">VISA</option>
                            <option value="MASTERCARD">MASTERCARD</option>
                            <option value="ELO">ELO</option>
                            <option value="AMEX">AMEX</option>
                          </select>
                        </div>
                        <div className="modal-form-group">
                          <label htmlFor="modal-card-number">Número do Cartão</label>
                          <input 
                            id="modal-card-number"
                            type="text"
                            placeholder="Ex: **** **** **** 4321"
                            value={tempCardNumber}
                            onChange={(e) => setTempCardNumber(e.target.value)}
                            required
                            className="modal-input"
                          />
                        </div>
                        <div className="modal-form-group">
                          <label htmlFor="modal-card-expiration">Validade</label>
                          <input 
                            id="modal-card-expiration"
                            type="text"
                            placeholder="Ex: 08/30"
                            value={tempCardExpiration}
                            onChange={(e) => setTempCardExpiration(e.target.value)}
                            required
                            className="modal-input"
                          />
                        </div>
                        <div className="modal-form-group full-width">
                          <label htmlFor="modal-card-balance">Saldo / Limite (R$)</label>
                          <input 
                            id="modal-card-balance"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 2500.00"
                            value={tempCardBalance}
                            onChange={(e) => setTempCardBalance(e.target.value)}
                            required
                            className="modal-input"
                          />
                        </div>
                        <div className="modal-form-group full-width">
                          <label>Cor do Cartão</label>
                          <div className="card-color-selector">
                            {[
                              { id: 'lime', name: 'Verde Neon', class: 'bg-[#b5f500]' },
                              { id: 'pink', name: 'Rosa Cyber', class: 'bg-[#ff007f]' },
                              { id: 'black', name: 'Preto Absoluto', class: 'bg-[#18181b]' },
                              { id: 'blue', name: 'Azul Elétrico', class: 'bg-[#3b82f6]' }
                            ].map((color) => (
                              <button
                                key={color.id}
                                id={`color-opt-${color.id}`}
                                type="button"
                                className={`color-bubble-btn ${color.class} ${tempCardColor === color.id ? 'active' : ''}`}
                                onClick={() => setTempCardColor(color.id)}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="modal-actions-row">
                        <button type="button" id="btn-cancel-card" className="modal-cancel-btn" onClick={() => setShowCardModal(false)}>
                          Cancelar
                        </button>
                        <button type="submit" id="btn-save-card" className="modal-submit-btn">
                          Salvar Alterações
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* MODAL TRANSAÇÃO (SACAR / DEPOSITAR) */}
            <AnimatePresence>
              {showTxModal && (
                <div className="modal-overlay" onClick={() => setShowTxModal(false)}>
                  <motion.div 
                    className="modal-window"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <h3>{txModalType === 'saque' ? 'Registrar Retirada / Saque' : 'Registrar Depósito'}</h3>
                      <button className="modal-close-btn" onClick={() => setShowTxModal(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={handleExecuteTx} className="modal-form">
                      <div className="modal-form-group">
                        <label htmlFor="modal-tx-value">Valor (R$)</label>
                        <input 
                          id="modal-tx-value"
                          type="number"
                          step="0.01"
                          placeholder="Ex: 150.00"
                          value={tempTxValue}
                          onChange={(e) => setTempTxValue(e.target.value)}
                          required
                          className="modal-input"
                          min="0.01"
                        />
                      </div>
                      <div className="modal-form-group">
                        <label htmlFor="modal-tx-desc">Descrição / Nome do Lançamento</label>
                        <input 
                          id="modal-tx-desc"
                          type="text"
                          placeholder={txModalType === 'saque' ? 'Ex: Saque em Espécie' : 'Ex: Depósito Semanal'}
                          value={tempTxDesc}
                          onChange={(e) => setTempTxDesc(e.target.value)}
                          className="modal-input"
                        />
                      </div>
                      <div className="modal-actions-row">
                        <button type="button" id="btn-cancel-tx" className="modal-cancel-btn" onClick={() => setShowTxModal(false)}>
                          Cancelar
                        </button>
                        <button type="submit" id="btn-save-tx" className="modal-submit-btn">
                          Confirmar
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* MODAL DE CONFIRMAÇÃO DE RESET */}
            <AnimatePresence>
              {showResetConfirm && (
                <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
                  <motion.div 
                    className="modal-window"
                    style={{ maxWidth: '400px' }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <h3 className="flex items-center gap-2" style={{ color: '#ef4444' }}>
                        <AlertTriangle size={20} />
                        Confirmar Reset
                      </h3>
                      <button className="modal-close-btn" onClick={() => setShowResetConfirm(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="py-4" style={{ padding: '1rem 0' }}>
                      <p style={{ color: '#d4d4d8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Tem certeza que deseja zerar todos os seus saldos, limite de cartão e histórico de transações?
                      </p>
                      <p style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: '600' }}>
                        Esta ação é irreversível e apagará definitivamente todos os dados da nuvem.
                      </p>
                    </div>
                    <div className="modal-actions-row flex justify-end gap-3" style={{ marginTop: '1rem' }}>
                      <button 
                        type="button" 
                        id="btn-cancel-reset" 
                        className="modal-cancel-btn" 
                        onClick={() => setShowResetConfirm(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="button" 
                        id="btn-confirm-reset" 
                        className="modal-submit-btn"
                        style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                        onClick={handleResetAllData}
                      >
                        Sim, Zerar Tudo
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}