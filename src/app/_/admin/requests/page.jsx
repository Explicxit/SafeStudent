"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading: authLoading } = useUser();

  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: { start: "", end: "" },
    sort: "newest",
    search: "",
  });
  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/list-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...filters, type: "assistance" }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to fetch requests");
      }
      setRequests(data.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/account/signin?callbackUrl=/admin/assistance";
      return;
    }

    if (user) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchRequests, user, authLoading]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);
  const handleStatusUpdate = useCallback(
    async (requestId, status) => {
      try {
        const response = await fetch("/api/update-request-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: requestId,
            type: "assistance",
            status,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update status");
        }

        const data = await response.json();
        if (!data.ok) {
          throw new Error(data.error || "Failed to update status");
        }

        fetchRequests();
      } catch (err) {
        console.error(err);
        setError("Failed to update request status");
      }
    },
    [fetchRequests]
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-red-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0B14] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <a
            href="/admin"
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <i className="fas fa-arrow-left" />
            Back to Admin Portal
          </a>
          <div className="text-gray-400">{user?.email}</div>
        </div>

        <RequestFilters
          onFilterChange={handleFilterChange}
          defaultStatus={filters.status}
          defaultDateRange={filters.dateRange}
          defaultSort={filters.sort}
          defaultSearch={filters.search}
          className="mb-6"
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            {error}
            <button onClick={fetchRequests} className="ml-2 text-sm underline">
              Retry
            </button>
          </div>
        )}

        <div className="bg-[#1A1B23] rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#0A0B14]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {request.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
      ${request.status === "pending" ? "bg-yellow-900/30 text-yellow-300" : ""}
      ${request.status === "acknowledged" ? "bg-blue-900/30 text-blue-300" : ""}
      ${request.status === "resolved" ? "bg-green-900/30 text-green-300" : ""}
    `}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {request.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {request.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(request.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {request.created_by_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RequestStatusManager
                        currentStatus={request.status}
                        requestId={request.id}
                        requestType="assistance"
                        onStatusUpdate={(newStatus) =>
                          handleStatusUpdate(request.id, newStatus)
                        }
                      />
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;