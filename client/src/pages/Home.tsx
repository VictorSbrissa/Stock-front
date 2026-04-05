import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { LogOut, Users, ShoppingCart, Settings, Package } from "lucide-react";

export default function Home() {
    const { user, logout, hasRole } = useAuth();
    const [, setLocation] = useLocation();

    const handleLogout = () => {
        logout();
        setLocation("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Multi-Tenant App</h1>
                        <p className="text-sm text-muted-foreground">Gerenciamento de Clientes e Vendas</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-medium text-slate-900">{user?.username}</p>
                            <p className="text-xs text-muted-foreground">
                                {user?.roles?.join(", ") || "Usuário"}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Clientes Card */}
                    {hasRole("UsuarioComum") && (
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/clients")}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Clientes
                                </CardTitle>
                                <CardDescription>Gerenciar clientes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-slate-900">Compradores</p>
                                <p className="text-sm text-muted-foreground mt-2">Clique para acessar</p>
                            </CardContent>
                        </Card>
                    )} 

                    {/* Vendas Card */}
                    {hasRole("UsuarioComum") && (
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/sales")}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-green-600" />
                                    Vendas
                                </CardTitle>
                                <CardDescription>Gerenciar vendas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-slate-900">Receita</p>
                                <p className="text-sm text-muted-foreground mt-2">Clique para acessar</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Estoque Card */}
                    {hasRole("UsuarioComum") && (
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/inventory")}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-orange-600" />
                                    Estoque
                                </CardTitle>
                                <CardDescription>Gerenciar estoque</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-slate-900">Provisão</p>
                                <p className="text-sm text-muted-foreground mt-2">Clique para acessar</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Admin Card - Apenas para Admins */}
                    {hasRole("Admin") && (
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/admin")}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-purple-600" />
                                    Administração
                                </CardTitle>
                                <CardDescription>Gerenciar tenants e roles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-slate-900">⚙️</p>
                                <p className="text-sm text-muted-foreground mt-2">Clique para acessar</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Welcome Section */}
                <div className="mt-12 bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Bem-vindo, {user?.username}!</h2>
                    <p className="text-slate-600 mb-4">
                        Esta é uma aplicação multi-tenant para gerenciar clientes e vendas. Use o menu acima para navegar entre as diferentes seções.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-2">👥 Clientes</h3>
                            <p className="text-sm text-blue-700">Crie, edite e delete clientes. Visualize todas as vendas associadas a cada cliente.</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h3 className="font-semibold text-green-900 mb-2">🛒 Vendas</h3>
                            <p className="text-sm text-green-700">Registre novas vendas, acompanhe o status de pagamento e visualize histórico.</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <h3 className="font-semibold text-orange-900 mb-2">📦 Estoque</h3>
                            <p className="text-sm text-orange-700">Gerencie produtos, quantidades em estoque e movimentações.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
