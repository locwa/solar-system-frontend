import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Planet {
  PlanetID: number;
  Name: string;
  Mass: number;
  Population: number;
  PlanetType: string;
}

export function PlanetDetails() {
  const { planetId } = useParams<{ planetId: string }>();
  const { user } = useAuth();
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanetDetails = async () => {
      if (!user || !planetId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/planets/${planetId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data: Planet = await response.json();
          setPlanet(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch planet details");
        }
      } catch (err) {
        setError("Network error or server unavailable");
        console.error("Fetch planet details error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanetDetails();
  }, [user, planetId]);

  if (loading) {
    return <div className="p-6">Loading planet details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!planet) {
    return <div className="p-6">Planet not found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Planet Details: {planet.Name}</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p><strong>ID:</strong> {planet.PlanetID}</p>
        <p><strong>Name:</strong> {planet.Name}</p>
        <p><strong>Mass:</strong> {planet.Mass}</p>
        <p><strong>Population:</strong> {planet.Population}</p>
        <p><strong>Type:</strong> {planet.PlanetType}</p>
      </div>

      {/* Conditional actions based on user role */}
      {user?.role === "Galactic Leader" && (
        <div className="mt-4 flex gap-4">
          <Link to={`/planets/${planet.PlanetID}/edit`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Modify Planet</Link>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete Planet</button>
          <Link to={`/planets/${planet.PlanetID}/assign-leader`} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Assign Leader</Link>
        </div>
      )}

      {user?.role === "Planetary Leader" && (
        <div className="mt-4 flex gap-4">
          <Link to={`/planets/${planet.PlanetID}/managed-details`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Managed Planet Details</Link>
          <Link to={`/planets/${planet.PlanetID}/citizens`} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">View Citizens</Link>
          <Link to={`/planets/${planet.PlanetID}/submit-request`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Submit Modification Request</Link>
        </div>
      )}

      {user?.role === "Citizen" && (
        <div className="mt-4 flex gap-4">
          {/* Citizens can view details, but specific details of managed planet is for leader */}
          <p>You can view general information about this planet.</p>
        </div>
      )}

    </div>
  );
}
