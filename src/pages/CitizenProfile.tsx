import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

export function CitizenProfile() {
  const { citizenId } = useParams<{ citizenId: string }>();
  const { user } = useAuth();
  const [citizen, setCitizen] = useState<CitizenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCitizenProfile = async () => {
      if (user?.role !== "Citizen" || !citizenId || user.id !== parseInt(citizenId)) return; // Ensure it's the current user's profile

      setLoading(true);
      try {
        const response = await fetch(`    https://solar-system-backend-production.up.railway.app/api/citizens/${citizenId}/profile`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data: CitizenData = await response.json();
          setCitizen(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch citizen profile");
        }
      } catch (err) {
        setError("Network error or server unavailable");
        console.error("Fetch citizen profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCitizenProfile();
  }, [user, citizenId]);

  if (user?.role !== "Citizen" || user?.id !== parseInt(citizenId || "0")) {
    return <div className="p-6 text-red-500">Unauthorized: You can only view your own citizen profile.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!citizen) {
    return <div className="p-6">Citizen profile not found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Citizen Profile: {citizen.User.FullName}</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p><strong>Citizen ID:</strong> {citizen.CitizenID}</p>
        <p><strong>Username:</strong> {citizen.User.Username}</p>
        <p><strong>Role:</strong> {citizen.User.Role}</p>
        <p><strong>Planet:</strong> {citizen.Planet.Name}</p>
        <p><strong>Citizenship Start:</strong> {new Date(citizen.CitizenshipStartDate).toLocaleDateString()}</p>
      </div>
      {/* Add options for citizen: e.g., request citizenship change */}
    </div>
  );
}
