import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaUserPlus, FaGithub, FaLinkedin } from "react-icons/fa";
import { Calendar, BookOpen, TrendingUp } from "lucide-react";
import { Footer } from "../../components/ui/footer";
import { HumanAbout } from "../../components/ui/HumanAbout";
import { DotGlobeHero } from "../../components/ui/globe-hero";
import HeroText from "../../components/ui/hero-shutter-text";
import ShinyButton from "../../components/ui/shiny-button";
import { ProductHighlightCard } from "../../components/ui/product-card";

// Import images from assets directory
import IconeEstudos from "../../IMG/ICONE_ESTUDO.png";
import IconeBiblioteca from "../../IMG/ICONE_BIBLIOTECA.png";
import IconeGestao from "../../IMG/ICONE_GESTAODEOBJETIVOS.png";

function Home() {
  const navigate = useNavigate();

  const handleCadastroAluno = () => {
    navigate('/cadastro-aluno');
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative overflow-x-hidden font-body-md">
      
      {/* Cabeçalho */}
      <header className="absolute top-0 left-0 right-0 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <HeroText 
            text="LearnHub" 
            transparent={true} 
            charClassName="text-2xl font-extrabold tracking-tight" 
            charWrapperClassName="relative px-[0.5px] overflow-hidden group"
            textContainerClassName="relative z-10 flex items-center justify-start"
            gradientClassName="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            className="w-auto h-auto"
          />
        </div>
        <nav className="flex items-center gap-4">
          <ShinyButton 
            className="px-5 py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all rounded-xl shadow-sm hover:shadow-md hover:shadow-primary/10 flex items-center justify-center backdrop-blur-md"
            textClassName="text-primary font-bold text-sm tracking-normal capitalize"
            onClick={() => navigate('/login')}
          >
            Entrar
          </ShinyButton>
        </nav>
      </header>

      {/* Hero Section */}
      <DotGlobeHero
        rotationSpeed={0.003}
        globeRadius={1.2}
        globeColor="#2563eb"
        className="relative min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center overflow-hidden"
      >
        {/* Glow ambient effects inside Hero */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-8 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center space-y-8"
          >
            {/* Tagline */}
            <motion.div 
              variants={itemVariants}
              className="relative inline-flex items-center gap-3 px-6 py-2 rounded-full bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/15 border border-primary/20 backdrop-blur-xl shadow-md"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span className="text-xs font-bold text-primary tracking-wider uppercase">Plataforma Integrada de Estudos</span>
              <div className="w-2 h-2 bg-secondary rounded-full animate-ping" />
            </motion.div>
            
            {/* Big Premium Title */}
            <motion.div variants={itemVariants} className="space-y-4 w-full flex flex-col items-center">
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] select-none text-center">
                <span className="block font-light text-on-surface-variant/80 mb-4 text-3xl md:text-5xl lg:text-6xl tracking-normal leading-normal">
                  Conecte seu
                </span>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Aprendizado
                </span>
              </h1>
            </motion.div>
            
            {/* Description Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-on-surface-variant max-w-3xl leading-relaxed font-medium"
            >
              Experiência acadêmica sob controle. Organize seus estudos, gerencie finanças, controle hábitos e planeje sua carreira com nossa{" "}
              <span className="text-on-surface font-semibold bg-gradient-to-r from-primary/15 to-secondary/10 px-2 py-1 rounded-md">
                infraestrutura unificada de aprendizado.
              </span>
            </motion.p>

            {/* CTAs */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-md"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 20px 40px rgba(37, 99, 235, 0.15), 0 0 20px rgba(37, 99, 235, 0.2)",
                  y: -1
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary via-primary to-primary/90 text-on-primary rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/30 transition-all duration-300 border border-primary/20"
              >
                <span>Acessar Plataforma</span>
                <FaArrowRight className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.03,
                  y: -1
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCadastroAluno}
                className="w-full sm:w-auto px-8 py-4 border-2 border-outline-variant/40 rounded-2xl font-bold text-lg hover:border-primary/40 transition-all duration-300 backdrop-blur-xl bg-surface-container-lowest/60 hover:bg-surface-container-lowest/90 text-on-surface flex items-center justify-center gap-3 shadow-md"
              >
                <FaUserPlus className="w-5 h-5 text-primary" />
                <span>Criar Minha Conta</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </DotGlobeHero>

      {/* Seções Adicionais da Landing Page */}
      <main className="max-w-7xl mx-auto w-full px-6 py-16 sm:py-24 z-10 flex flex-col gap-24">
        {/* Sessão Sobre Nós (Humanista) */}
        <HumanAbout onRegisterClick={handleCadastroAluno} />

        {/* Grid de Features */}
        <motion.section 
          id="features"
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 scroll-mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Card 1 */}
          <ProductHighlightCard
            category="Organização"
            categoryIcon={<Calendar className="h-5 w-5 text-primary" />}
            title="Planejamento de Estudos"
            description="Organize seus horários de aula, crie listas de tarefas, prazos acadêmicos e reduza a procrastinação diária."
            imageSrc={IconeEstudos}
            imageAlt="Planejamento de Estudos"
            className="w-full md:w-full max-w-[350px] mx-auto"
          />

          {/* Card 2 */}
          <ProductHighlightCard
            category="Leitura"
            categoryIcon={<BookOpen className="h-5 w-5 text-secondary" />}
            title="Biblioteca Pessoal"
            description="Adicione livros à sua estante virtual, registre páginas lidas e acompanhe o progresso de resumos e apostilas."
            imageSrc={IconeBiblioteca}
            imageAlt="Biblioteca Pessoal"
            className="w-full md:w-full max-w-[350px] mx-auto"
          />

          {/* Card 3 */}
          <ProductHighlightCard
            category="Carreira"
            categoryIcon={<TrendingUp className="h-5 w-5 text-tertiary" />}
            title="Gestão de Objetivos"
            description="Planeje suas candidaturas a vagas de estágio e desenvolva hábitos saudáveis com análises gráficas."
            imageSrc={IconeGestao}
            imageAlt="Gestão de Objetivos"
            className="w-full md:w-full max-w-[350px] mx-auto"
          />
        </motion.section>
      </main>

      {/* Footer da Plataforma */}
      <div className="border-t border-outline-variant/20 w-full bg-surface-container-lowest/30 backdrop-blur-md mt-16">
        <div className="max-w-7xl mx-auto w-full px-6">
          <Footer
            logo={<BookOpen className="h-8 w-8 text-primary" />}
            brandName="LearnHub"
            socialLinks={[
              {
                icon: <FaGithub className="h-5 w-5" />,
                href: "https://github.com",
                label: "GitHub",
              },
              {
                icon: <FaLinkedin className="h-5 w-5" />,
                href: "https://linkedin.com",
                label: "LinkedIn",
              },
            ]}
            mainLinks={[
              { href: "/home", label: "Início" },
              { href: "/login", label: "Entrar" },
              { href: "/cadastro-aluno", label: "Criar Conta" },
            ]}
            legalLinks={[
              { href: "#", label: "Privacidade" },
              { href: "#", label: "Termos" },
            ]}
            copyright={{
              text: "© 2026 LearnHub",
              license: "Todos os direitos reservados.",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
