import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";

interface Planet {
  PlanetID: number;
  Name: string;
}

interface User {
  UserID: number;
  Name: string;
  Email: string;
}

interface Citizen {
  CitizenID: number;
  User?: User;
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
  Requester?: Citizen;
}

export function IncomingCitizenshipRequests() {
  const { user } = useAuth();
  const { planetId } = useParams<{ planetId: string }>();
  const [requests, setRequests] = useState<CitizenshipRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [user, planetId]);

  const fetchRequests = async () => {
    if (!user || !planetId) return;

    setLoading(true);
    try {
      const response = await fetch(`https://solar-system-backend-production.up.railway.app/api/planets/${planetId}/citizenship-requests`, {
        credentials: "include",
      });

      if (response.ok) {
        const data: CitizenshipRequest[] = await response.json();
        setRequests(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch citizenship requests");
      }
    } catch (err) {
      setError("Network error or server unavailable");
      console.error("Fetch requests error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (requestId: number, decision: "Approved" | "Rejected") => {
    setDecidingId(requestId);
    try {
      const response = await fetch(
        `https://solar-system-backend-production.up.railway.app/api/planets/${planetId}/citizenship-requests/${requestId}/decide`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ decision }),
        }
      );

      if (response.ok) {
        await fetchRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to process decision");
      }
    } catch (err) {
      alert("Network error or server unavailable");
      console.error("Decision error:", err);
    } finally {
      setDecidingId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading citizenship requests...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Incoming Citizenship Requests</h1>
      <p className="text-gray-600 mb-6">
        Review and decide on citizenship transfer requests from citizens wanting to join your
        planet.
      </p>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">No pending citizenship requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.RequestID} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {request.Requester?.User?.Name || "Unknown Citizen"}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {request.Requester?.User?.Email || "No email"}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Requested on</p>
                  <p>{new Date(request.RequestDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">From Planet</h3>
                  <p className="text-gray-800 mt-1">{request.FromPlanet?.Name || "Unknown"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">To Planet</h3>
                  <p className="text-gray-800 mt-1">{request.ToPlanet?.Name || "Unknown"}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDecision(request.RequestID, "Approved")}
                    disabled={decidingId === request.RequestID}
                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {decidingId === request.RequestID ? "Processing..." : "Accept"}
                  </button>
                  <button
                    onClick={() => handleDecision(request.RequestID, "Rejected")}
                    disabled={decidingId === request.RequestID}
                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {decidingId === request.RequestID ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
