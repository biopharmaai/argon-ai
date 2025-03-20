"use client";
// app/search/page.tsx (if using Next.js App Router)
import { useState } from "react";
import { Transition } from "@headlessui/react";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  // State for query parameters
  const [term, setTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [studyTypeFilter, setStudyTypeFilter] = useState("");

  // State for results and loading/error state
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to build querystring and fetch data
  const handleSearch = async () => {
    setLoading(true);
    setError("");

    // Base query string with term and limit
    let queryString = `?term=${encodeURIComponent(term)}&limit=${limit}`;

    // Append sort parameter if provided (e.g. sort=overallStatus:asc)
    if (sortField) {
      queryString += `&sort=${encodeURIComponent(sortField)}:${encodeURIComponent(sortDirection)}`;
    }

    // Append filters using bracket notation
    if (statusFilter) {
      queryString += `&filter[overallStatus]=${encodeURIComponent(statusFilter)}`;
    }
    if (studyTypeFilter) {
      queryString += `&filter[studyType]=${encodeURIComponent(studyTypeFilter)}`;
    }

    try {
      const res = await fetch(`/api/search${queryString}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setError("No data returned");
      }
    } catch (err) {
      setError("Failed to fetch search results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Clinical Trials Search</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Term */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Search Term
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. nsclc"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Limit
          </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {/* Sort Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sort Field
          </label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">None</option>
            <option value="overallStatus">Overall Status</option>
            <option value="officialTitle">Official Title</option>
            <option value="briefTitle">Brief Title</option>
          </select>
        </div>

        {/* Sort Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sort Direction
          </label>
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Filter by Overall Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Overall Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">None</option>
            <option value="RECRUITING">Recruiting</option>
            <option value="NOT_YET_RECRUITING">Not Yet Recruiting</option>
            <option value="COMPLETED">Completed</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>

        {/* Filter by Study Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Study Type
          </label>
          <select
            value={studyTypeFilter}
            onChange={(e) => setStudyTypeFilter(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">None</option>
            <option value="INTERVENTIONAL">Interventional</option>
            <option value="OBSERVATIONAL">Observational</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring"
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-600">Loading...</div>
      )}

      {error && <div className="mt-4 text-center text-red-600">{error}</div>}

      <Transition
        show={results.length > 0}
        enter="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
      >
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NCT ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brief Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((trial) => (
                <tr key={trial.protocolSection.identificationModule.nctId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trial.protocolSection.identificationModule.nctId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trial.protocolSection.identificationModule.briefTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trial.protocolSection.statusModule.overallStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Transition>
    </div>
  );
}
