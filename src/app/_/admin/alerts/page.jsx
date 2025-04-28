"use client";
import React from "react";

function MainComponent() {
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [sortBy, setSortBy] = useState("timestamp_desc");
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    severity: "low",
  });

  const severityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  };

  const handleSelectAlert = useCallback((id) => {
    setSelectedAlerts((prev) =>
      prev.includes(id)
        ? prev.filter((alertId) => alertId !== id)
        : [...prev, id]
    );
  }, []);

  const handleEdit = useCallback((alert) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
    });
    setShowForm(true);
  }, []);

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedAlerts.length} alerts?`
      )
    ) {
      return;
    }

    let hasError = false;
    for (const id of selectedAlerts) {
      try {
        const response = await fetch("/api/delete-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error(`Failed to delete alert ${id}`);
      } catch (err) {
        console.error(err);
        hasError = true;
      }
    }

    if (hasError) {
      setError("Some alerts could not be deleted");
    }
    setSelectedAlerts([]);
    fetchAlerts();
  };

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/list-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort: sortBy }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAlerts(data.alerts || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/create-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: editingAlert?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create alert");
      }

      setFormData({
        title: "",
        message: "",
        severity: "low",
      });
      setShowForm(false);
      setEditingAlert(null);
      fetchAlerts();
    } catch (err) {
      console.error(err);
      setError("Could not create alert");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) {
      return;
    }

    try {
      const response = await fetch("/api/delete-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete alert");
      }

      fetchAlerts();
    } catch (err) {
      console.error(err);
      setError("Could not delete alert");
    }
  };

  const { data: user, loading: authLoading } = useUser();

  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (alert) =>
          alert.title.toLowerCase().includes(query) ||
          alert.message.toLowerCase().includes(query)
      );
    }

    if (filterSeverity) {
      filtered = filtered.filter((alert) => alert.severity === filterSeverity);
    }

    return filtered;
  }, [alerts, searchQuery, filterSeverity]);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/account/signin?callbackUrl=/admin/alerts";
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [fetchAlerts, user]);

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
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="fas fa-plus mr-2" />
              Create New Alert
            </button>
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

        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-inter font-bold text-gray-900 dark:text-white">
                {editingAlert ? "Edit Alert" : "New Alert"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAlert(null);
                  setFormData({
                    title: "",
                    message: "",
                    severity: "low",
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAlert ? "Update Alert" : "Create Alert"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="timestamp_desc">Newest First</option>
              <option value="timestamp_asc">Oldest First</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
              <option value="severity_asc">Severity Low-High</option>
              <option value="severity_desc">Severity High-Low</option>
            </select>
          </div>
        </div>

        {selectedAlerts.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-300 flex justify-between items-center">
            <span>{selectedAlerts.length} alerts selected</span>
            <button
              onClick={handleBulkDelete}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
            >
              <i className="fas fa-trash" />
              Delete Selected
            </button>
          </div>
        )}

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600" />
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedAlerts.includes(alert.id)}
                      onChange={() => handleSelectAlert(alert.id)}
                      className="mt-1"
                    />
                    <div>
                      <h3 className="font-inter font-bold text-gray-900 dark:text-white mb-2">
                        {alert.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            severityColors[alert.severity]
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(alert)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <i className="fas fa-trash" />
                    </button>
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