'use client';

import { 
  BarChart3,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react';

export default function LetterSystemPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-[#28b4b4] text-white rounded-lg hover:bg-[#229999] transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Letters"
          value="156"
          change="+12%"
          icon={Mail}
          trend="up"
        />
        <StatCard
          title="Pending Review"
          value="23"
          change="+5"
          icon={Clock}
          trend="up"
        />
        <StatCard
          title="Processed"
          value="89"
          change="+18%"
          icon={CheckCircle2}
          trend="up"
        />
        <StatCard
          title="Urgent"
          value="8"
          change="-2"
          icon={AlertCircle}
          trend="down"
        />
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Letters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Letters</h2>
          <div className="space-y-4">
            {recentLetters.map((letter, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(letter.status)}`} />
                  <div>
                    <h3 className="font-medium">{letter.subject}</h3>
                    <p className="text-sm text-gray-500">{letter.sender}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{letter.date}</span>
                  <button className="bg-[#28b4b4] text-white px-3 py-1 rounded hover:bg-[#229999] transition-colors text-sm">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Statistics</h2>
          <div className="h-[300px] flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-gray-300" />
            <span className="ml-2 text-gray-500">Chart will be implemented here</span>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
          <button className="flex items-center bg-[#28b4b4] text-white px-3 py-1 rounded hover:bg-[#229999] transition-colors">
            <Calendar className="w-4 h-4 mr-1" />
            <span>View Calendar</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingDeadlines.map((deadline, index) => (
            <div key={index} className="p-4 border border-gray-100 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{deadline.title}</h3>
                  <p className="text-sm text-gray-500">{deadline.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(deadline.priority)}`}>
                  {deadline.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-50' : 'bg-red-50'}`}>
          <Icon className={`w-6 h-6 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
        <span className="text-gray-500 text-sm ml-1">vs last month</span>
      </div>
    </div>
  );
}

const recentLetters = [
  { subject: 'Budget Approval Request', sender: 'Finance Department', status: 'pending', date: 'Today' },
  { subject: 'Project Timeline Update', sender: 'Project Management', status: 'approved', date: 'Yesterday' },
  { subject: 'Employee Leave Request', sender: 'HR Department', status: 'urgent', date: '2 days ago' },
];

const upcomingDeadlines = [
  { title: 'Annual Report Submission', date: 'Aug 15, 2025', priority: 'High' },
  { title: 'Department Meeting Minutes', date: 'Aug 18, 2025', priority: 'Medium' },
  { title: 'Budget Review', date: 'Aug 20, 2025', priority: 'Low' },
];

function getStatusColor(status) {
  switch (status) {
    case 'pending': return 'bg-yellow-400';
    case 'approved': return 'bg-green-400';
    case 'urgent': return 'bg-red-400';
    default: return 'bg-gray-400';
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
