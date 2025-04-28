"use client";
import React from "react";

function MainComponent() {
  const [tips, setTips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [newTip, setNewTip] = useState({
    tip: "",
    category: "",
    scheduledFor: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const validCategories = [
    "mental",
    "physical",
    "emotional",
    "social",
    "environmental",
    "spiritual",
    "occupational",
    "financial",
  ];
  const fetchTips = useCallback(async () => {
    try {
      const response = await fetch("/api/list-tips", {
        method: "POST",
        body: JSON.stringify({
          search: searchTerm || null,
          category: selectedCategory || null,
        }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setTips(data.tips);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load tips");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tipData = editingTip ? { ...newTip, id: editingTip.id } : newTip;

      const response = await fetch("/api/create-tip", {
        method: "POST",
        body: JSON.stringify(tipData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setNewTip({ tip: "", category: "", scheduledFor: "" });
      setShowForm(false);
      setEditingTip(null);
      fetchTips();
    } catch (err) {
      console.error(err);
      setError("Failed to save tip");
    }
  };

  const handleEdit = (tip) => {
    setEditingTip(tip);
    setNewTip({
      tip: tip.tip,
      category: tip.category,
      scheduledFor: tip.scheduled_for
        ? new Date(tip.scheduled_for).toISOString().slice(0, 16)
        : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/delete-tip", {
        method: "POST",
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      fetchTips();
    } catch (err) {
      console.error(err);
      setError("Failed to delete tip");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <a
            href="/admin"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            <i className="fas fa-arrow-left mr-2" />
            Back to Admin Portal
          </a>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <i className="fas fa-plus mr-2" />
            Add New Tip
          </button>
        </div>
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search tips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {validCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            {error}
            <button onClick={fetchTips} className="ml-2 text-sm underline">
              Retry
            </button>
          </div>
        )}

        {showForm && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-inter font-bold text-gray-900 dark:text-white">
                {editingTip ? "Edit Wellbeing Tip" : "Add New Wellbeing Tip"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTip(null);
                  setNewTip({ tip: "", category: "", scheduledFor: "" });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tip Content
                </label>
                <textarea
                  name="tip"
                  value={newTip.tip}
                  onChange={(e) =>
                    setNewTip({ ...newTip, tip: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={newTip.category}
                  onChange={(e) =>
                    setNewTip({ ...newTip, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {validCategories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule For (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  value={newTip.scheduledFor}
                  onChange={(e) =>
                    setNewTip({ ...newTip, scheduledFor: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Tip
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white mb-2">
                    {tip.tip}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                      {tip.category}
                    </span>
                    {tip.scheduled_for && (
                      <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                        Scheduled:{" "}
                        {new Date(tip.scheduled_for).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(tip)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Edit tip"
                  >
                    <i className="fas fa-edit" />
                  </button>
                  <button
                    onClick={() => handleDelete(tip.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete tip"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;