"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading: authLoading } = useUser();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    category: "Student Assistance",
    urgency: "normal",
    sort_order: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href =
        "/account/signin?callbackUrl=/admin/assistance-options";
    }
  }, [user, authLoading]);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/list-assistance-options", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setOptions(data.options || []);
    } catch (err) {
      setError("Failed to load assistance options");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOptions();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOption) {
        const response = await fetch("/api/update-assistance-option", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: editingOption.id }),
        });
        if (!response.ok) throw new Error("Failed to update option");
      } else {
        const response = await fetch("/api/create-assistance-option", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Failed to create option");
      }

      setIsCreating(false);
      setEditingOption(null);
      setFormData({
        label: "",
        category: "Student Assistance",
        urgency: "normal",
        sort_order: 0,
      });
      fetchOptions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    try {
      const response = await fetch("/api/delete-assistance-option", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete option");

      fetchOptions();
    } catch (err) {
      setError("Failed to delete option");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left" /> Back to Admin Portal
            </a>
            <h1 className="text-2xl font-bold">Manage Assistance Options</h1>
          </div>
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingOption(null);
            }}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus" /> Add New Option
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-400 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {(isCreating || editingOption) && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingOption ? "Edit Option" : "Create New Option"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="Student Assistance">Student Assistance</option>
                  <option value="Teacher Assistance">Teacher Assistance</option>
                  <option value="Student/Teacher Assistance">
                    Student/Teacher Assistance
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Urgency</label>
                <select
                  value={formData.urgency}
                  onChange={(e) =>
                    setFormData({ ...formData, urgency: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
                >
                  {editingOption ? "Save Changes" : "Create Option"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingOption(null);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="px-6 py-3 text-left text-gray-400">Label</th>
                <th className="px-6 py-3 text-left text-gray-400">Category</th>
                <th className="px-6 py-3 text-left text-gray-400">Urgency</th>
                <th className="px-6 py-3 text-left text-gray-400">
                  Sort Order
                </th>
                <th className="px-6 py-3 text-right text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <i className="fas fa-spinner fa-spin text-blue-500" />
                  </td>
                </tr>
              ) : options.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No assistance options found
                  </td>
                </tr>
              ) : (
                options.map((option) => (
                  <tr
                    key={option.id}
                    className="border-t border-gray-800 hover:bg-gray-900/30"
                  >
                    <td className="px-6 py-4">{option.label}</td>
                    <td className="px-6 py-4">{option.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          option.urgency === "urgent"
                            ? "bg-red-900/20 text-red-400"
                            : "bg-blue-900/20 text-blue-400"
                        }`}
                      >
                        {option.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">{option.sort_order}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingOption(option);
                          setFormData({
                            label: option.label,
                            category: option.category,
                            urgency: option.urgency,
                            sort_order: option.sort_order,
                          });
                          setIsCreating(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
                      >
                        <i className="fas fa-edit" />
                      </button>
                      <button
                        onClick={() => handleDelete(option.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;