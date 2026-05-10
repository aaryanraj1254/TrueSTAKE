import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Markets } from './pages/Markets';
import { MarketDetail } from './pages/MarketDetail';
import { Wallet } from './pages/Wallet';
import { Dashboard, DashboardIndexRedirect } from './pages/Dashboard';
import { Leaderboard } from './pages/Leaderboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardShell } from './components/dashboard/DashboardShell';
import { Portfolio } from './pages/dashboard/Portfolio';
import { Profile } from './pages/dashboard/Profile';
import { AdminShell } from './components/admin/AdminShell';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { CreateMarketAdmin } from './pages/admin/CreateMarketAdmin';
import { ResolveMarketAdmin } from './pages/admin/ResolveMarketAdmin';
import { UserManagementAdmin } from './pages/admin/UserManagementAdmin';
import { TransactionApprovalAdmin } from './pages/admin/TransactionApprovalAdmin';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public routes for markets */}
              <Route path="/markets" element={<Markets />} />
              <Route path="/markets/:id" element={<MarketDetail />} />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminAnalytics />} />
                <Route path="create" element={<CreateMarketAdmin />} />
                <Route path="resolve" element={<ResolveMarketAdmin />} />
                <Route path="users" element={<UserManagementAdmin />} />
                <Route path="transactions" element={<TransactionApprovalAdmin />} />
              </Route>

              <Route path="/" element={<Home />} />
              <Route path="/leaderboard" element={<DashboardIndexRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster richColors position="top-right" />
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
