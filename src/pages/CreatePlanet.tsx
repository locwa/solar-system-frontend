import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function CreatePlanet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [mass, setMass] = useState('');
  const [population, setPopulation] = useState('');
  const [planetType, setPlanetType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not Galactic Leader (though PrivateRoute should handle this)
  if (user?.role !== 'Galactic Leader') {
    return <div className="p-6 text-red-500">Unauthorized: Only Galactic Leaders can create planets.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('https://solar-system-backend-production.up.railway.app/api/planets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: name,
          Mass: parseFloat(mass),
          Population: parseInt(population),
          PlanetType: planetType,
        }),
      });

      if (response.ok) {
        const newPlanet = await response.json();
        setSuccess(`Planet ${newPlanet.Name} created successfully!`);
        setName('');
        setMass('');
        setPopulation('');
        setPlanetType('');
        navigate('/planets'); // Navigate back to planet list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create planet');
      }
    } catch (err) {
      setError('Network error or server unavailable');
      console.error('Create planet error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Planet</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Planet Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="mass" className="block text-gray-700 text-sm font-bold mb-2">Mass (e.g., 1.5):</label>
          <input
            type="number"
            id="mass"
            step="0.01"
            value={mass}
            onChange={(e) => setMass(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="population" className="block text-gray-700 text-sm font-bold mb-2">Population:</label>
          <input
            type="number"
            id="population"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="planetType" className="block text-gray-700 text-sm font-bold mb-2">Planet Type:</label>
          <input
            type="text"
            id="planetType"
            value={planetType}
            onChange={(e) => setPlanetType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Planet'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/planets')}
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
