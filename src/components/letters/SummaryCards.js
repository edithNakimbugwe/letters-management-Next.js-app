'use client';

import { useMemo } from 'react';
import { AlertTriangle, AlertCircle, Clock, Zap } from 'lucide-react';

export default function SummaryCards({ letters }) {
  const summaryData = useMemo(() => {
    const urgencyLevels = ['low', 'medium', 'high', 'urgent'];
    
    return urgencyLevels.map(urgency => {
      const urgencyLetters = letters.filter(letter => {
        const priority = letter.priority || 'low';
        return priority.toLowerCase() === urgency.toLowerCase();
      });
      
      const sent = urgencyLetters.filter(letter => letter.status === 'sent').length;
      const pending = urgencyLetters.filter(letter => letter.status === 'pending').length;
      const draft = urgencyLetters.filter(letter => letter.status === 'draft').length;
      const total = urgencyLetters.length;
      
      return {
        urgency,
        total,
        sent,
        pending,
        draft
      };
    });
  }, [letters]);

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'low':
        return <Clock className="h-5 w-5" style={{ color: '#28b4b4' }} />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'urgent':
        return <Zap className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getUrgencyColor = (urgency) => {
    return 'border-l-gray-200 bg-white';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryData.map(({ urgency, total, sent, pending, draft }) => (
        <div
          key={urgency}
          className={`bg-white rounded-lg shadow-md border-l-4 p-4 ${getUrgencyColor(urgency)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getUrgencyIcon(urgency)}
              <h3 className="text-sm font-medium text-gray-700 capitalize">
                {urgency} Priority
              </h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{total}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Sent:</span>
              <span className="font-medium" style={{ color: '#28b4b4' }}>{sent}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">{pending}</span>
            </div>
            {draft > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Draft:</span>
                <span className="font-medium text-gray-600">{draft}</span>
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              {sent > 0 && (
                <div 
                  style={{ 
                    backgroundColor: '#28b4b4',
                    width: `${(sent / total) * 100}%` 
                  }}
                ></div>
              )}
              {pending > 0 && (
                <div 
                  className="bg-yellow-500" 
                  style={{ width: `${(pending / total) * 100}%` }}
                ></div>
              )}
              {draft > 0 && (
                <div 
                  className="bg-gray-500" 
                  style={{ width: `${(draft / total) * 100}%` }}
                ></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
