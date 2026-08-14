import React, { useState } from 'react';
import axios from 'axios';

const EventBuilder = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    venue: '',
    capacity: '',
    duration: '',
    isPaid: false,
    ticketPrice: '',
  });

  const [clashWarning, setClashWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const checkClash = async () => {
    if (!formData.venue || !formData.eventDate || !formData.duration) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/check-clash`,
        {
          venue: formData.venue,
          eventDate: formData.eventDate,
          duration: parseInt(formData.duration),
        }
      );

      if (res.data.hasClash) {
        setClashWarning({
          message: 'Venue clash detected!',
          clashes: res.data.clashes,
        });
      } else {
        setClashWarning(null);
      }
    } catch (error) {
      console.error('Error checking clash:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/create`,
        { ...formData, organizationId: user.organizationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        venue: '',
        capacity: '',
        duration: '',
        isPaid: false,
        ticketPrice: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Event Proposal</h1>

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            ✅ Event created successfully!
          </div>
        )}

        {clashWarning && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            <strong>⚠️ Clash Detected:</strong> {clashWarning.message}
            <ul className="mt-2 text-sm">
              {clashWarning.clashes.map(clash => (
                <li key={clash.id}>• {clash.event.title}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Describe your event"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
              <input
                type="datetime-local"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                onBlur={checkClash}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Venue *</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                onBlur={checkClash}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g., Auditorium A"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Max attendees"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                onBlur={checkClash}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g., 120"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 rounded"
            />
            <label className="ml-2 text-sm font-semibold text-gray-700">This is a paid event</label>
          </div>

          {formData.isPaid && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ticket Price (₹) *</label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                step="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Price per ticket"
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="reset"
              className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventBuilder;
