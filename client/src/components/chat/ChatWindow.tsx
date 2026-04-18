import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { enviarPergunta, type Mensagem } from '@/lib/chatApi';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const sugestoes = [
  'Quantos clientes tenho?',
  'Qual foi minha ultima venda?',
  'Quantas vendas fiz esse mes?',
];

export default function ChatWindow() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: nanoid(),
      tipo: 'ia',
      texto: 'Ola! Sou seu assistente de dados. Pode me perguntar sobre seus clientes, vendas e muito mais!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  async function enviar(texto?: string) {
    const pergunta = texto ?? input.trim();
    if (!pergunta || carregando) return;

    const msgUsuario: Mensagem = {
      id: nanoid(),
      tipo: 'usuario',
      texto: pergunta,
      timestamp: new Date(),
    };

    setMensagens((prev) => [...prev, msgUsuario]);
    setInput('');
    setCarregando(true);

    try {
      const resposta = await enviarPergunta(pergunta);
      setMensagens((prev) => [
        ...prev,
        { id: nanoid(), tipo: 'ia', texto: resposta, timestamp: new Date() },
      ]);
    } catch {
      toast.error('Erro ao consultar o assistente. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/40">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
          <Bot size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Assistente IA</p>
          <p className="text-xs text-muted-foreground">Consulte seus dados em linguagem natural</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Mensagens */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-4">
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.tipo === 'usuario' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                ${msg.tipo === 'ia' ? 'bg-primary/10' : 'bg-secondary'}`}
              >
                {msg.tipo === 'ia'
                  ? <Bot size={14} className="text-primary" />
                  : <User size={14} className="text-foreground" />
                }
              </div>

              {/* Balão */}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${msg.tipo === 'usuario'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                {msg.texto}
              </div>
            </div>
          ))}

          {/* Indicador de digitação */}
          {carregando && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-primary" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Sugestões */}
      {mensagens.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {sugestoes.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 
                         text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && enviar()}
            placeholder="Pergunte sobre seus dados..."
            disabled={carregando}
            className="flex-1 bg-background"
          />
          <Button
            onClick={() => enviar()}
            disabled={!input.trim() || carregando}
            size="icon"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}