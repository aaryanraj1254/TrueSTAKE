import { Navigate } from 'react-router-dom';
import { DashboardHome } from './dashboard/DashboardHome';

export const Dashboard = () => {
  return <DashboardHome />;
};

export const DashboardIndexRedirect = () => {
  return <Navigate to="/dashboard/leaderboard" replace />;
};
