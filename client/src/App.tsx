import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Clients from "./pages/Clients";
import Sales from "./pages/Sales";
import Admin from "./pages/Admin";
import Chat from './pages/Chat';


function Router() {
    return (
        <Switch>
            <Route path={"/login"} component={Login} />
            <Route path={"/register"} component={Register} />
            <Route path={"/"}>
                <ProtectedRoute>
                    <Home />
                </ProtectedRoute>
            </Route>
            <Route path={"/clients"}>
                <ProtectedRoute>
                    <Clients />
                </ProtectedRoute>
            </Route>
            <Route path={"/sales"}>
                <ProtectedRoute>
                    <Sales />
                </ProtectedRoute>
            </Route>
            <Route path={"/admin"}>
                <ProtectedRoute requiredRole="Admin">
                    <Admin />
                </ProtectedRoute>
            </Route>
            <Route path={"/chat"}>
                <ProtectedRoute>
                    <Chat />
                </ProtectedRoute>
            </Route>
            <Route path={"/404"} component={NotFound} />
            {/* Final fallback route */}
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider defaultTheme="light">
                <AuthProvider>
                    <TenantProvider>
                        <TooltipProvider>
                            <Toaster />
                            <Router />
                        </TooltipProvider>
                    </TenantProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
