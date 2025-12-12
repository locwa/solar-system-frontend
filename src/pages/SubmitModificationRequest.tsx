import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function SubmitModificationRequest() {
  const { planetId } = useParams<{ planetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (user?.role !== "Planetary Leader") {
    return <div className="p-6 text-red-500">Unauthorized: Only Planetary Leaders can submit modification requests.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/planets/${planetId}/modification-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title,
          description: description,
        }),
      });

      if (response.ok) {
        const newRequest = await response.json();
        setSuccess(`Modification request \"${newRequest.Title}\" submitted successfully!`);
        setTitle("");
        setDescription("");
        navigate(`/planets/${planetId}/managed-details`); // Navigate back to managed planet details
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to submit modification request");
      }
    } catch (err) {
      setError("Network error or server unavailable");
      console.error("Submit modification request error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Submit Modification Request for Planet {planetId}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={4}
            required
          ></textarea>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/planets/${planetId}/managed-details`)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
