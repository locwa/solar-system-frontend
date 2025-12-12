import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface PlanetaryLeaderData {
  LeaderID: number;
  PlanetID: number;
  StartDate: string; // Assuming date string
  User: {
    UserID: number;
    FullName: string;
    Username: string;
    Role: string;
  };
  Planet: {
    PlanetID: number;
    Name: string;
  };
}

export function PlanetaryLeaders() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<PlanetaryLeaderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanetaryLeaders = async () => {
      if (user?.role !== "Galactic Leader") return; // Should be caught by PrivateRoute

      setLoading(true);
      try {
        const response = await fetch(`https://solar-system-backend-production.up.railway.app/api/planetary-leaders`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data: PlanetaryLeaderData[] = await response.json();
          setLeaders(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch planetary leaders");
        }
      } catch (err) {
        setError("Network error or server unavailable");
        console.error("Fetch planetary leaders error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanetaryLeaders();
  }, [user]);

  if (user?.role !== "Galactic Leader") {
    return <div className="p-6 text-red-500">Unauthorized: Only Galactic Leaders can view planetary leaders.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading planetary leaders...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Planetary Leaders</h1>
      {leaders.length === 0 ? (
        <p>No planetary leaders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((leader) => (
            <div key={leader.LeaderID} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{leader.User.FullName}</h2>
              <p><strong>Username:</strong> {leader.User.Username}</p>
              <p><strong>Planet:</strong> {leader.Planet.Name}</p>
              <p><strong>Assigned Date:</strong> {new Date(leader.StartDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
