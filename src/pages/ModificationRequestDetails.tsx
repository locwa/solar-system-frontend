import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Proposal {
  ProposalID: number;
  PlanetID: number;
  ProposedBy: number;
  Title: string;
  Description: string;
  Status: string;
  DateProposed: string;
  Proposer?: { FullName: string; Username: string; };
  Planet?: { Name: string; };
}

export function ModificationRequestDetails() {
  const { planetId, requestId } = useParams<{ planetId: string; requestId: string }>();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposalDetails = async () => {
      if (user?.role !== "Citizen" || !planetId || !requestId) return; // Only citizens can view

      setLoading(true);
      try {
        const response = await fetch(`https://solar-system-backend-production.up.railway.app/api/planets/${planetId}/modification-requests/${requestId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data: Proposal = await response.json();
          setProposal(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch modification request details");
        }
      } catch (err) {
        setError("Network error or server unavailable");
        console.error("Fetch modification request details error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposalDetails();
  }, [user, planetId, requestId]);

  if (user?.role !== "Citizen") {
    return <div className="p-6 text-red-500">Unauthorized: Only Citizens can view modification request details.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading modification request details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!proposal) {
    return <div className="p-6">Modification request not found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Modification Request: {proposal.Title}</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p><strong>Request ID:</strong> {proposal.ProposalID}</p>
        <p><strong>Planet:</strong> {proposal.Planet?.Name} (ID: {proposal.PlanetID})</p>
        <p><strong>Proposed By:</strong> {proposal.Proposer?.FullName} ({proposal.Proposer?.Username})</p>
        <p><strong>Description:</strong> {proposal.Description}</p>
        <p><strong>Status:</strong> {proposal.Status}</p>
        <p><strong>Date Proposed:</strong> {new Date(proposal.DateProposed).toLocaleDateString()}</p>
      </div>

      {/* Option to vote if status is pending */}
      {user?.role === "Citizen" && proposal.Status === "Pending" && (
        <div className="mt-4">
          <Link to={`/planets/${planetId}/modification-requests/${requestId}/vote`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Cast Your Vote</Link>
        </div>
      )}
    </div>
  );
}
