import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface User {
  UserID: number;
  Username: string;
  FullName: string;
  Role: string;
}

export function CreateCitizen() {
  const { planetId } = useParams<{ planetId: string }>(); // Get planetId from URL
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role !== "Planetary Leader" || !planetId) return;

      setLoading(true);
      try {
        const usersResponse = await fetch(`https://solar-system-backend-production.up.railway.app/api/auth/users`, { credentials: 'include' });
        const usersData: User[] = usersResponse.ok ? await usersResponse.json() : [];

        setUsers(usersData.filter(u => u.Role !== 'Galactic Leader' && u.Role !== 'Planetary Leader'));

      } catch (err) {
        setError("Network error or server unavailable");
        console.error("Fetch users error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, planetId]);

  if (user?.role !== "Planetary Leader") {
    return <div className="p-6 text-red-500">Unauthorized: Only Planetary Leaders can create citizens.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!selectedUser) {
      setError("Please select a user.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/citizens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          PlanetID: parseInt(planetId!),
          UserID: parseInt(selectedUser),
        }),
      });

      if (response.ok) {
        const newCitizen = await response.json();
        setSuccess(`Citizen ${newCitizen.CitizenID} created successfully!`);
        setSelectedUser("");
        navigate(`/planets/${planetId!}/citizens`); // Use non-null assertion
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create citizen");
      }
    } catch (err) {
      setError("Network error or server unavailable");
      console.error("Create citizen error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Citizen on Planet {planetId}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        <div className="mb-4">
          <label htmlFor="user" className="block text-gray-700 text-sm font-bold mb-2">Select User:</label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
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
            {loading ? "Creating..." : "Create Citizen"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/planets/${planetId!}/citizens`)}
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
