import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Planet {
  PlanetID: number;
  Name: string;
  Mass: number;
  Population: number;
  PlanetType: string;
}

export function ManagedPlanetDetails() {
  const { planetId } = useParams<{ planetId: string }>();
  const { user } = useAuth();
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManagedPlanetDetails = async () => {
      if (user?.role !== "Planetary Leader" || !planetId) return; // Should be caught by PrivateRoute

      setLoading(true);
      try {
        const response = await fetch(`https://solar-system-backend-production.up.railway.app/api/planets/${planetId}/details`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data: Planet = await response.json();
          setPlanet(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch managed planet details");
        }
      } catch (err) {
        setError("Network error or server unavailable");
        console.error("Fetch managed planet details error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagedPlanetDetails();
  }, [user, planetId]);

  if (user?.role !== "Planetary Leader") {
    return <div className="p-6 text-red-500">Unauthorized: Only Planetary Leaders can view managed planet details.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading managed planet details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!planet) {
    return <div className="p-6">Managed planet not found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Managed Planet Details: {planet.Name}</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p><strong>ID:</strong> {planet.PlanetID}</p>
        <p><strong>Name:</strong> {planet.Name}</p>
        <p><strong>Mass:</strong> {planet.Mass}</p>
        <p><strong>Population:</strong> {planet.Population}</p>
        <p><strong>Type:</strong> {planet.PlanetType}</p>
      </div>
      {/* Add specific management options for planetary leader */}
    </div>
  );
}
