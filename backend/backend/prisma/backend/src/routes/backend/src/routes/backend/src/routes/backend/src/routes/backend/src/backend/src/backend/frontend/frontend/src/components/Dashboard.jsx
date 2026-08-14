import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const eventsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { organizationId: user.organizationId },
      });

      setUserData(user);
      setEvents(eventsRes.data.events || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Welcome, {userData?.firstName}!</h1>
          <p className="text-gray-600 mt-2">Role: <span className="font-semibold">{userData?.role}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Events</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{events.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{events.filter(e => e.status === 'APPROVED').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{events.filter(e => e.status === 'DRAFT' || e.status === 'SUBMITTED').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-gray-500 text-sm font-semibold uppercase">Upcoming</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{events.filter(e => new Date(e.eventDate) > new Date()).length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-left text-sm font-semibold">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Venue</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{event.title}</td>
                    <td className="px-4 py-2">{new Date(event.eventDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{event.venue}</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        event.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
