'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, getMonthlyStats } from '@/services/firestore';
import MonthlyBarChart from '@/components/charts/MonthlyBarChart';
import { 
  BarChart3,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react';

export default function LetterSystemPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    urgent: 0,
    recent: []
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [dashboardStats, monthlyStats] = await Promise.all([
        getDashboardStats(user.uid),
        getMonthlyStats(user.uid)
      ]);
      setStats(dashboardStats);
      setMonthlyData(monthlyStats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-[#28b4b4] text-white rounded-lg hover:bg-[#229999] transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Letters"
          value={stats.total.toString()}
          change={`${stats.total > 0 ? '+' : ''}${stats.total}`}
          icon={Mail}
          trend="up"
        />
        <StatCard
          title="Pending"
          value={stats.pending.toString()}
          change={`${stats.pending} not sent`}
          icon={Clock}
          trend={stats.pending > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Sent"
          value={stats.sent.toString()}
          change={`${stats.sent} emails sent`}
          icon={CheckCircle2}
          trend="up"
        />
        <StatCard
          title="Urgent"
          value={stats.urgent.toString()}
          change={`${stats.urgent} high priority`}
          icon={AlertCircle}
          trend={stats.urgent > 0 ? "up" : "neutral"}
        />
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Letters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Letters</h2>
          <div className="space-y-4">
            {stats.recent.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No letters found. Create your first letter!</p>
              </div>
            ) : (
              stats.recent.map((letter, index) => (
                <div key={letter.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div 
                      className={`w-2 h-2 rounded-full ${getLetterStatusColor(letter.status || 'pending')}`}
                      style={(letter.status || 'pending') === 'sent' ? { backgroundColor: '#28b4b4' } : {}}
                    />
                    <div>
                      <h3 className="font-medium">{letter.title || 'Untitled'}</h3>
                      <p className="text-sm text-gray-500">{letter.senderName || 'Unknown Sender'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {letter.createdAt?.toDate ? 
                        letter.createdAt.toDate().toLocaleDateString() : 
                        'Recently'
                      }
                    </span>
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${getLetterStatusColor(letter.status || 'pending')}`}
                      style={(letter.status || 'pending') === 'sent' ? { backgroundColor: '#28b4b4' } : {}}
                    >
                      {letter.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Monthly Statistics</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <BarChart3 className="w-4 h-4" />
              <span>Last 6 months</span>
            </div>
          </div>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <MonthlyBarChart monthlyData={monthlyData} />
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Quick Insights</h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Success Rate</h3>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
                </p>
                <p className="text-sm text-blue-600">Letters sent successfully</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-yellow-900">Pending Actions</h3>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                <p className="text-sm text-yellow-600">Letters awaiting action</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-900">Priority Items</h3>
                <p className="text-2xl font-bold text-red-700">{stats.urgent}</p>
                <p className="text-sm text-red-600">High priority letters</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/lettersystem/add-letter"
            className="p-4 border border-gray-200 rounded-lg hover:border-[#28b4b4] transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <Mail className="w-8 h-8 text-[#28b4b4] group-hover:text-[#229999]" />
              <div>
                <h3 className="font-medium">Add New Letter</h3>
                <p className="text-sm text-gray-500">Create a new letter entry</p>
              </div>
            </div>
          </a>
          
          <a 
            href="/lettersystem/letters"
            className="p-4 border border-gray-200 rounded-lg hover:border-[#28b4b4] transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-[#28b4b4] group-hover:text-[#229999]" />
              <div>
                <h3 className="font-medium">View All Letters</h3>
                <p className="text-sm text-gray-500">Manage your letters</p>
              </div>
            </div>
          </a>
          
          <button 
            onClick={fetchDashboardData}
            className="p-4 border border-gray-200 rounded-lg hover:border-[#28b4b4] transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-[#28b4b4] group-hover:text-[#229999]" />
              <div>
                <h3 className="font-medium">Refresh Data</h3>
                <p className="text-sm text-gray-500">Update dashboard stats</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, trend }) {
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-white';
      case 'down':
        return 'bg-red-50 text-red-500';
      default:
        return 'bg-blue-50 text-blue-500';
    }
  };

  const getChangeColor = (trend) => {
    switch (trend) {
      case 'up':
        return '';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div 
          className={`p-3 rounded-lg ${getTrendColor(trend)}`}
          style={trend === 'up' ? { backgroundColor: '#28b4b4' } : {}}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4">
        <span 
          className={`text-sm ${getChangeColor(trend)}`}
          style={trend === 'up' ? { color: '#28b4b4' } : {}}
        >
          {change}
        </span>
      </div>
    </div>
  );
}

function getLetterStatusColor(status) {
  switch (status) {
    case 'sent':
      return 'text-white';
    case 'pending':
      return 'bg-yellow-400';
    case 'draft':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
}
