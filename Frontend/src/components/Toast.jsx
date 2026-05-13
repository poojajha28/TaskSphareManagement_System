import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const toastTypes = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800'
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 text-red-800'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800'
  }
};

function Toast({ type = 'info', message, onClose, autoClose = true }) {
  const { icon: Icon, className } = toastTypes[type];

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div className={`rounded-lg border p-4 shadow-md ${className} max-w-sm`}>
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Toast;