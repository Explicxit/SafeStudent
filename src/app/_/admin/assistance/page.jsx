"use client";
import React from "react";

function MainComponent() {
  const toast = ({ title, description, status, duration }) => {
    const toastEl = document.createElement("div");
    toastEl.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
      status === "success" ? "bg-green-500" : "bg-red-500"
    } text-white z-50`;
    toastEl.innerHTML = `
      <h3 class="font-bold">${title}</h3>
      <p>${description}</p>
    `;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      toastEl.remove();
    }, duration);
  };

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState("timestamp_desc");
  const [updatingRequests, setUpdatingRequests] = useState(new Set());
  const { data: user, loading: authLoading } = useUser();
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/get-active-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sort: sortBy,
          status: filterStatus,
          dateStart: dateRange.start,
          dateEnd: dateRange.end,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setRequests(data.assistance || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load assistance requests");
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterStatus, dateRange]);

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const response = await fetch("/api/update-request-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId,
          type: "assistance",
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update request status");
      }

      toast({
        title: "Status Updated",
        description: `Request has been ${newStatus}`,
        status: "success",
        duration: 3000,
      });

      await fetchRequests();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Could not update request status",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleAcknowledge = async (requestId) => {
    setUpdatingRequests((prev) => new Set([...prev, requestId]));
    await handleUpdateStatus(requestId, "acknowledged");
    setUpdatingRequests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  };

  const handleResolve = async (requestId) => {
    setUpdatingRequests((prev) => new Set([...prev, requestId]));
    await handleUpdateStatus(requestId, "resolved");
    setUpdatingRequests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/account/signin?callbackUrl=/admin/assistance";
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [fetchRequests, user]);

  const statusColors = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    acknowledged:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    resolved:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  };
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    if (filterStatus) {
      filtered = filtered.filter((request) => request.status === filterStatus);
    }

    if (dateRange.start) {
      filtered = filtered.filter(
        (request) => new Date(request.created_at) >= new Date(dateRange.start)
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(
        (request) => new Date(request.created_at) <= new Date(dateRange.end)
      );
    }

    return filtered;
  }, [requests, filterStatus, dateRange]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <a
            href="/admin"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
          >
            <i className="fas fa-arrow-left mr-2" />
            Back to Admin Portal
          </a>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">
              {user.email}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="timestamp_desc">Newest First</option>
              <option value="timestamp_asc">Oldest First</option>
              <option value="status_asc">Status A-Z</option>
              <option value="status_desc">Status Z-A</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No assistance requests found
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          statusColors[request.status]
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-inter font-bold text-gray-900 dark:text-white mb-2">
                      From: {request.created_by_name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {request.description}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Location: {request.location}
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2">
                    {request.status === "pending" && (
                      <button
                        onClick={() => handleAcknowledge(request.id)}
                        disabled={updatingRequests.has(request.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingRequests.has(request.id) ? (
                          <i className="fas fa-spinner fa-spin" />
                        ) : (
                          <i className="fas fa-check" />
                        )}
                        Acknowledge
                      </button>
                    )}
                    {request.status !== "resolved" && (
                      <button
                        onClick={() => handleResolve(request.id)}
                        disabled={updatingRequests.has(request.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingRequests.has(request.id) ? (
                          <i className="fas fa-spinner fa-spin" />
                        ) : (
                          <i className="fas fa-check-double" />
                        )}
                        Resolve
                      </button>
                    )}
                    {request.status === "resolved" && (
                      <div className="text-green-500 flex items-center justify-center gap-2">
                        <i className="fas fa-check-circle" />
                        Resolved
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;