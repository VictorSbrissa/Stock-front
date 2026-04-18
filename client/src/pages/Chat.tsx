import ChatWindow from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function Chat() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">

            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation("/")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Assistente IA</h1>
                        <p className="text-sm text-muted-foreground">Consulte seus dados em linguagem natural</p>
                    </div>
                </div>
            </header>

            {/* Chat */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col min-h-0">
                <div className="flex-1 min-h-0">
                    <ChatWindow />
                </div>
            </main>

        </div>
    );
}