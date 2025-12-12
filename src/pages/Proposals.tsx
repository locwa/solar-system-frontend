import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

interface Planet {
  PlanetID: number;
  Name: string;
}

interface User {
  UserID: number;
  Name: string;
}

interface Vote {
  VoteID: number;
  VoteChoice: string;
}

interface Proposal {
  ProposalID: number;
  PlanetID: number;
  ProposedBy: number;
  ProposalType: string;
  Details: string;
  Status: string;
  DateProposed: string;
  DecisionDate?: string;
  Planet?: Planet;
  Proposer?: User;
  Decider?: User;
  Votes?: Vote[];
}

export function Proposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const fetchProposals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/proposals`, {
        credentials: "include",
      });

      if (response.ok) {
        const data: Proposal[] = await response.json();
        setProposals(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch proposals");
      }
    } catch (err) {
      setError("Network error or server unavailable");
      console.error("Fetch proposals error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (proposalId: number, decision: "Approved" | "Rejected") => {
    setDecidingId(proposalId);
    try {
      const response = await fetch(`https://solar-system-backend-production.up.railway.app/api/proposals/${proposalId}/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ decision }),
      });

      if (response.ok) {
        await fetchProposals();
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

  const getProposalTypeColor = (type: string) => {
    switch (type) {
      case "Terraform":
        return "bg-green-100 text-green-800";
      case "Destruction":
        return "bg-red-100 text-red-800";
      case "Rename":
        return "bg-blue-100 text-blue-800";
      case "Resource Change":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProposals =
    filter === "all" ? proposals : proposals.filter((p) => p.Status === filter);

  if (loading) {
    return <div className="p-6">Loading proposals...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Planet Modification Proposals</h1>
      <p className="text-gray-600 mb-6">
        Review and decide on modification requests from planetary leaders.
      </p>

      <div className="mb-6">
        <label className="mr-2 font-medium">Filter by status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {filteredProposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">No proposals found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProposals.map((proposal) => (
            <div key={proposal.ProposalID} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {proposal.Planet?.Name || "Unknown Planet"}
                  </h2>
                  <div className="flex space-x-2 mt-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getProposalTypeColor(
                        proposal.ProposalType
                      )}`}
                    >
                      {proposal.ProposalType}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        proposal.Status
                      )}`}
                    >
                      {proposal.Status}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Proposed on</p>
                  <p>{new Date(proposal.DateProposed).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Details</h3>
                  <p className="text-gray-800 mt-1">{proposal.Details}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Proposed By</h3>
                  <p className="text-gray-800 mt-1">{proposal.Proposer?.Name || "Unknown"}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Citizen Votes</h3>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-semibold">For:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {proposal.Votes?.filter((v) => v.VoteChoice === "For").length || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600 font-semibold">Against:</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                      {proposal.Votes?.filter((v) => v.VoteChoice === "Against").length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {proposal.Status === "Pending" && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Your Decision</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleDecision(proposal.ProposalID, "Approved")}
                      disabled={decidingId === proposal.ProposalID}
                      className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {decidingId === proposal.ProposalID ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleDecision(proposal.ProposalID, "Rejected")}
                      disabled={decidingId === proposal.ProposalID}
                      className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {decidingId === proposal.ProposalID ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              )}

              {proposal.Status !== "Pending" && proposal.Decider && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Decided by <span className="font-medium">{proposal.Decider.Name}</span> on{" "}
                    {proposal.DecisionDate
                      ? new Date(proposal.DecisionDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
