import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom"; // Import Link for navigation

interface Planet {
  PlanetID: number;
  Name: string;
  Mass: number;
  Population: number;
  PlanetType: string;
}

export function Planets() {
  const { user } = useAuth();
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanets = async () => {
      if (!user) return; // Should be caught by PrivateRoute, but good practice

      setLoading(true);
      try {
        const response = await fetch(`/api/planets`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data: Planet[] = await response.json();
          setPlanets(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch planets");
        }
      } catch (err) {
        setError("Network error or server unavailable");
        console.error("Fetch planets error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanets();
  }, [user]);

  if (loading) {
    return <div className="p-6">Loading planets...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Planets</h1>

      {user?.role === "Galactic Leader" && (
        <div className="mb-4">
          <Link to="/planets/create" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Create New Planet</Link>
        </div>
      )}

      {planets.length === 0 ? (
        <p>No planets found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planets.map((planet) => (
            <div key={planet.PlanetID} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{planet.Name}</h2>
              <p><strong>ID:</strong> {planet.PlanetID}</p>
              <p><strong>Mass:</strong> {planet.Mass}</p>
              <p><strong>Population:</strong> {planet.Population}</p>
              <p><strong>Type:</strong> {planet.PlanetType}</p>
              <div className="mt-4">
                <Link to={`/planets/${planet.PlanetID}`} className="text-blue-500 hover:underline">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
