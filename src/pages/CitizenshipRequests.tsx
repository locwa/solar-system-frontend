import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface Planet {
  PlanetID: number;
  Name: string;
  Description: string;
  Population: number;
}

interface Citizen {
  CitizenID: number;
  PlanetID: number;
  Planet?: Planet;
}

interface CitizenshipRequest {
  RequestID: number;
  CitizenID: number;
  FromPlanetID: number;
  ToPlanetID: number;
  Status: string;
  RequestDate: string;
  FromPlanet?: Planet;
  ToPlanet?: Planet;
}

export function CitizenshipRequests() {
  const { user } = useAuth();
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [requests, setRequests] = useState<CitizenshipRequest[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [citizenRes, planetsRes] = await Promise.all([
        fetch(`https://solar-system-backend-production.up.railway.app/api/citizen/me`, { credentials: "include" }),
        fetch(`https://solar-system-backend-production.up.railway.app/api/citizen/planets`, { credentials: "include" }),
      ]);

      if (citizenRes.ok) {
        const citizenData = await citizenRes.json();
        setCitizen(citizenData);

        const requestsRes = await fetch(
          `https://solar-system-backend-production.up.railway.app/api/citizens/${citizenData.CitizenID}/citizenship-request`,
          { credentials: "include" }
        );
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRequests(Array.isArray(requestsData) ? requestsData : []);
        } else if (requestsRes.status !== 404) {
          console.error("Failed to fetch requests");
        }
      }

      if (planetsRes.ok) {
        const planetsData = await planetsRes.json();
        setPlanets(planetsData);
      }
    } catch (err) {
      setError("Network error or server unavailable");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedPlanet || !citizen) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://solar-system-backend-production.up.railway.app/api/citizens/${citizen.CitizenID}/citizenship-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ newPlanetId: selectedPlanet }),
        }
      );

      if (response.ok) {
        setSelectedPlanet(null);
        await fetchData();
        alert("Citizenship transfer request submitted successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit request");
      }
    } catch (err) {
      alert("Network error or server unavailable");
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasPendingRequest = requests.some((r) => r.Status === "Pending");
  const availablePlanets = planets.filter((p) => p.PlanetID !== citizen?.PlanetID);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Citizenship Requests</h1>

      {citizen && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Planet</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg font-medium">{citizen.Planet?.Name || "Unknown"}</p>
            {citizen.Planet?.Description && (
              <p className="text-gray-600 mt-1">{citizen.Planet.Description}</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Request Planet Transfer</h2>
        {hasPendingRequest ? (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800">
              You already have a pending citizenship transfer request. Please wait for it to be
              reviewed before submitting a new one.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Select a planet to request citizenship transfer. Your request will be reviewed by
              the planetary leader of the destination planet.
            </p>

            {availablePlanets.length === 0 ? (
              <p className="text-gray-500">No other planets available for transfer.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Destination Planet
                  </label>
                  <select
                    value={selectedPlanet || ""}
                    onChange={(e) => setSelectedPlanet(Number(e.target.value))}
                    className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select a planet --</option>
                    {availablePlanets.map((planet) => (
                      <option key={planet.PlanetID} value={planet.PlanetID}>
                        {planet.Name} (Population: {planet.Population})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSubmitRequest}
                  disabled={!selectedPlanet || submitting}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Transfer Request"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Request History</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">No citizenship requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From Planet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To Planet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.RequestID}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.FromPlanet?.Name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.ToPlanet?.Name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          request.Status
                        )}`}
                      >
                        {request.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(request.RequestDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
