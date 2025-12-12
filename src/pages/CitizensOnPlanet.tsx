import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface CitizenData {
  CitizenID: number;
  PlanetID: number;
  CitizenshipStartDate: string;
  User: {
    UserID: number;
    FullName: string;
    Username: string;
    Role: string;
  };
}

export function CitizensOnPlanet() {
  const { planetId } = useParams<{ planetId: string }>();
  const { user } = useAuth();
  const [citizens, setCitizens] = useState<CitizenData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCitizensOnPlanet = async () => {
      if (user?.role !== "Planetary Leader" || !planetId) return; // Should be caught by PrivateRoute

      setLoading(true);
      try {
        const response = await fetch(`https://solar-system-backend-production.up.railway.app/api/planets/${planetId}/citizens`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data: CitizenData[] = await response.json();
          setCitizens(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch citizens on planet");
        }
      } catch (err) {
        setError("Network error or server unavailable");
        console.error("Fetch citizens on planet error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCitizensOnPlanet();
  }, [user, planetId]);

  if (user?.role !== "Planetary Leader") {
    return <div className="p-6 text-red-500">Unauthorized: Only Planetary Leaders can view citizens on their managed planet.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading citizens...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Citizens on Planet {planetId}</h1>
      {citizens.length === 0 ? (
        <p>No citizens found on this planet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citizens.map((citizen) => (
            <div key={citizen.CitizenID} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{citizen.User.FullName}</h2>
              <p><strong>Username:</strong> {citizen.User.Username}</p>
              <p><strong>Citizen ID:</strong> {citizen.CitizenID}</p>
              <p><strong>Citizenship Start:</strong> {new Date(citizen.CitizenshipStartDate).toLocaleDateString()}</p>
              <div className="mt-4">
                <Link to={`/citizens/${citizen.CitizenID}`} className="text-blue-500 hover:underline">View Citizen Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
