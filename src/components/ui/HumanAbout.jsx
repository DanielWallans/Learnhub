import React from "react";
import { ArrowRight, Sparkles, Heart } from "lucide-react";

export function HumanAbout({ onRegisterClick }) {
  return (
    <section className="w-full py-12 relative z-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Clean, loose typography grid (no outer card or background container) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative">
          
          {/* Left Column: What is LearnHub */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                O que é o LearnHub, afinal?
              </span>
            </div>
            
            <h3 className="font-display text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
              Um espaço simples para você se organizar, sem aquela pressão chata de planilhas complexas.
            </h3>
            
            <div className="space-y-4 text-on-surface-variant text-base md:text-lg leading-relaxed font-medium">
              <p>
                Para falar a verdade, a gente criou o LearnHub porque cansa ter que abrir dez abas diferentes só para organizar a vida de estudante. É o prazo do trabalho que acumula, a grana do mês que some, o livro da biblioteca vencendo... Dá uma ansiedade só de pensar.
              </p>
              <p>
                O LearnHub é o nosso jeito de simplificar isso. Não queremos ser mais uma ferramenta cheia de botões e gráficos difíceis que você nunca vai usar. É só um espaço limpo, leve e direto ao ponto, feito para você se organizar, planejar seus hábitos e respirar fundo.
              </p>
            </div>
          </div>

          {/* Right Column: Empathic CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 pt-6 lg:pt-0 relative">
            {/* Elegant vertical separator line on desktop */}
            <div className="hidden lg:block absolute -left-8 top-0 bottom-0 w-[1px] bg-outline-variant/30" />
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-secondary">
                <Heart className="w-4 h-4 fill-current text-secondary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  De estudante para estudante
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-2xl font-bold text-on-surface leading-tight">
                  Quer dar uma olhada e ver como funciona?
                </h4>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Criar sua conta leva menos de um minuto (de verdade). É gratuito, amigável e sem complicação.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={onRegisterClick}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Criar meu espaço grátis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs text-on-surface-variant/80">
                  Sem pegadinhas. 100% gratuito.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


