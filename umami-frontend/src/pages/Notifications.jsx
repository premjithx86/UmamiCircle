import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card } from '../components/Card';
import { Heart, MessageSquare, UserPlus, Bell, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });
    }

    return () => {
      if (socket) socket.off('new_notification');
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="text-red-500 fill-red-500" size={18} />;
      case 'comment': return <MessageSquare className="text-blue-500 fill-blue-500" size={18} />;
      case 'follow': return <UserPlus className="text-green-500" size={18} />;
      default: return <Bell className="text-orange-500" size={18} />;
    }
  };

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
        return notification.targetType === 'Post' 
          ? `/posts/${notification.targetId}` 
          : `/recipes/${notification.targetId}`;
      case 'follow':
        return `/u/${notification.actor?.username || ''}`;
      default:
        return '#';
    }
  };

  const getNotificationText = (notification) => {
    const actor = notification.actor?.username || 'Someone';
    switch (notification.type) {
      case 'like': return `${actor} liked your ${notification.targetType.toLowerCase()}.`;
      case 'comment': return `${actor} commented on your ${notification.targetType.toLowerCase()}.`;
      case 'follow': return `${actor} started following you.`;
      default: return `${actor} interacted with you.`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Notifications" 
        description="Stay updated with your social activity on UmamiCircle."
      />
      
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        {notifications.length > 0 && (
          <button 
            onClick={async () => {
              await api.put('/notifications/read-all');
              setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }}
            className="text-sm font-bold text-orange-600 hover:text-orange-500 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="md" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <Link key={notification._id} to={getNotificationLink(notification)}>
              <Card className={`p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 mb-3 ${!notification.isRead ? 'bg-orange-50/50 dark:bg-orange-900/10 border-l-4 border-l-orange-500' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {getNotificationText(notification)}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock size={12} className="mr-1" />
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-4">🔔</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">No notifications yet</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Interactions with your profile and content will show up here.
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export { Notifications };
