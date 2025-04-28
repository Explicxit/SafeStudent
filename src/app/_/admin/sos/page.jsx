"use client";
import React from "react";

function MainComponent() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: { start: "", end: "" },
    sort: "newest",
    search: "",
  });
  const { data: user, loading: authLoading } = useUser();
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/list-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "sos",
          ...filters,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/account/signin?callbackUrl=/admin/sos";
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.ok) {
        setAlerts(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch alerts");
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching SOS alerts:", err);
      if (err.message === "Unauthorized") {
        window.location.href = "/account/signin?callbackUrl=/admin/sos";
      } else {
        setError(
          "We couldn't load the alerts right now. Please refresh the page or try again later."
        );
      }
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/account/signin?callbackUrl=/admin/sos";
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchAlerts, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-red-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white">
      <div className="p-4 flex items-center justify-between">
        <a
          href="/admin"
          className="text-gray-400 hover:text-white flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Admin Portal
        </a>
        <div className="text-gray-400">{user?.email}</div>
      </div>
      <div className="mx-4">
        <RequestFilters
          onFilterChange={setFilters}
          defaultStatus={filters.status}
          defaultDateRange={filters.dateRange}
          defaultSort={filters.sort}
          defaultSearch={filters.search}
        />
      </div>

      <div className="m-4 space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1A1B23] h-32 rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 text-red-400 p-4 rounded-lg border border-red-700">
            {error}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No alerts found</div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="bg-[#1A1B23] rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <RequestStatusManager
                      currentStatus={alert.status}
                      requestId={alert.id}
                      requestType="sos"
                      onStatusUpdate={fetchAlerts}
                    />
                    <span className="text-gray-400 text-sm">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <div className="text-white mb-1">SOS Alert #{alert.id}</div>
                    <div className="text-gray-400 text-sm">
                      Location: {alert.location || "Unknown"}
                    </div>
                    {alert.creator_name && (
                      <div className="text-gray-400 text-sm">
                        Requested by: {alert.creator_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MainComponent;