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
  Planet: {
    PlanetID: number;
    Name: string;
  };
}

export function CitizenDetails() {
  const { citizenId } = useParams<{ citizenId: string }>();
  const { user } = useAuth();
  const [citizen, setCitizen] = useState<CitizenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCitizenDetails = async () => {
      if (!user || !citizenId) return; // Should be caught by PrivateRoute

      setLoading(true);
      try {
        const response = await fetch(`/api/citizens/${citizenId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data: CitizenData = await response.json();
          setCitizen(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch citizen details");
        }
      } catch (err) {
        setError("Network error or server unavailable");
        console.error("Fetch citizen details error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCitizenDetails();
  }, [user, citizenId]);

  if (loading) {
    return <div className="p-6">Loading citizen details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!citizen) {
    return <div className="p-6">Citizen not found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Citizen Details: {citizen.User.FullName}</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p><strong>Citizen ID:</strong> {citizen.CitizenID}</p>
        <p><strong>Username:</strong> {citizen.User.Username}</p>
        <p><strong>Role:</strong> {citizen.User.Role}</p>
        <p><strong>Planet:</strong> {citizen.Planet.Name}</p>
        <p><strong>Citizenship Start:</strong> {new Date(citizen.CitizenshipStartDate).toLocaleDateString()}</p>
      </div>

      {/* Conditional actions based on user role */}
      {(user?.role === "Planetary Leader" || (user?.role === "Citizen" && user?.id === citizen.CitizenID)) && (
        <div className="mt-4 flex gap-4">
          {user?.role === "Planetary Leader" && (
            <Link to={`/citizens/${citizen.CitizenID}/edit`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edit Citizen (Not Implemented)</Link>
          )}
          {user?.role === "Planetary Leader" && (
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Remove Citizen (Not Implemented)</button>
          )}
          {user?.role === "Citizen" && user?.id === citizen.CitizenID && (
            <Link to={`/citizens/${citizen.CitizenID}/profile`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View My Profile</Link>
          )}
        </div>
      )}

    </div>
  );
}
