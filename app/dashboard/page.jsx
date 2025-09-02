import Dashboard from "./../../components/Dashboard";
import ProtectedRoute from "./../../components/ProtectedRoutes";

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    );
}
