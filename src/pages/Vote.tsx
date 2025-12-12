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

interface Proposal {
  ProposalID: number;
  PlanetID: number;
  ProposedBy: number;
  ProposalType: string;
  Details: string;
  Status: string;
  DateProposed: string;
  Planet?: Planet;
  Proposer?: User;
  hasVoted: boolean;
  userVote: string | null;
  voteSummary: {
    for: number;
    against: number;
  };
}

export function Vote() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const fetchProposals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/citizen/proposals`, {
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

  const handleVote = async (proposalId: number, planetId: number, voteType: "For" | "Against") => {
    setVotingId(proposalId);
    try {
      const response = await fetch(
        `/api/planets/${planetId}/modification-requests/${proposalId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ voteType }),
        }
      );

      if (response.ok) {
        await fetchProposals();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to cast vote");
      }
    } catch (err) {
      alert("Network error or server unavailable");
      console.error("Vote error:", err);
    } finally {
      setVotingId(null);
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

  if (loading) {
    return <div className="p-6">Loading proposals...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Vote on Planet Proposals</h1>
      <p className="text-gray-600 mb-6">
        As a citizen, you can vote on modification requests proposed by your planetary leader.
      </p>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">No pending proposals to vote on.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <div key={proposal.ProposalID} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {proposal.Planet?.Name || "Unknown Planet"}
                  </h2>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getProposalTypeColor(
                      proposal.ProposalType
                    )}`}
                  >
                    {proposal.ProposalType}
                  </span>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Proposed on</p>
                  <p>{new Date(proposal.DateProposed).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Details</h3>
                <p className="text-gray-800 mt-1">{proposal.Details}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Proposed By</h3>
                <p className="text-gray-800 mt-1">{proposal.Proposer?.Name || "Unknown"}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Current Votes</h3>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-semibold">For:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {proposal.voteSummary.for}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600 font-semibold">Against:</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                      {proposal.voteSummary.against}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                {proposal.hasVoted ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">You voted:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proposal.userVote === "For"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {proposal.userVote}
                    </span>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleVote(proposal.ProposalID, proposal.PlanetID, "For")}
                      disabled={votingId === proposal.ProposalID}
                      className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {votingId === proposal.ProposalID ? "Voting..." : "Vote For"}
                    </button>
                    <button
                      onClick={() => handleVote(proposal.ProposalID, proposal.PlanetID, "Against")}
                      disabled={votingId === proposal.ProposalID}
                      className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {votingId === proposal.ProposalID ? "Voting..." : "Vote Against"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
