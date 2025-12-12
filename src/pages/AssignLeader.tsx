import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface User {
  UserID: number;
  Username: string;
  FullName: string;
  Role: string;
}

export function AssignLeader() {
  const { planetId } = useParams<{ planetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role !== 'Galactic Leader') return; // Should be caught by PrivateRoute

      try {
        // Assuming an API endpoint to get all users or users eligible to be leaders
        // For simplicity, let's assume we fetch all users and filter them.
        // In a real app, you might have a dedicated endpoint for potential leaders.
        const response = await fetch('https://solar-system-backend-production.up.railway.app/api/users'); // Assuming this route exists or we create it
        if (response.ok) {
          const data: User[] = await response.json();
          setUsers(data.filter(u => u.Role !== 'Galactic Leader')); // Cannot assign GL as PL
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch users');
        }
      } catch (err) {
        setError('Network error or server unavailable');
        console.error('Fetch users error:', err);
      }
    };

    fetchUsers();
  }, [user]);

  // Redirect if not Galactic Leader
  if (user?.role !== 'Galactic Leader') {
    return <div className="p-6 text-red-500">Unauthorized: Only Galactic Leaders can assign planetary leaders.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!selectedLeader) {
      setError('Please select a leader.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://solar-system-backend-production.up.railway.app/api/planets/${planetId}/leader`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(selectedLeader) }),
      });

      if (response.ok) {
        setSuccess('Planetary Leader assigned successfully!');
        navigate(`/planets/${planetId}`); // Go back to planet details
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to assign planetary leader');
      }
    } catch (err) {
      setError('Network error or server unavailable');
      console.error('Assign leader error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Assign Planetary Leader to Planet {planetId}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        <div className="mb-4">
          <label htmlFor="leader" className="block text-gray-700 text-sm font-bold mb-2">Select User to Assign as Leader:</label>
          <select
            id="leader"
            value={selectedLeader}
            onChange={(e) => setSelectedLeader(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">-- Select a User --</option>
            {users.map((u) => (
              <option key={u.UserID} value={u.UserID}>
                {u.FullName} ({u.Username})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Assigning...' : 'Assign Leader'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/planets/${planetId}`)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
