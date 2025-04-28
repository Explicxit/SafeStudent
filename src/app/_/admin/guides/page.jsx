"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [guides, setGuides] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    steps: [],
  });
  const emergencyGuides = [
    {
      title: "Treating Burns",
      category: "burns",
      url: "https://www.wikihow.com/Treat-a-Burn",
      icon: "fa-fire",
    },
    {
      title: "Performing CPR",
      category: "cpr",
      url: "https://www.wikihow.com/Do-CPR",
      icon: "fa-heartbeat",
    },
    {
      title: "Helping Someone Who's Choking",
      category: "choking",
      url: "https://www.wikihow.com/Do-the-Heimlich-Maneuver",
      icon: "fa-user-slash",
    },
    {
      title: "Treating Cuts and Bleeding",
      category: "cuts",
      url: "https://www.wikihow.com/Treat-a-Cut",
      icon: "fa-band-aid",
    },
  ];
  const fetchGuides = useCallback(async () => {
    try {
      const response = await fetch("/api/get-first-aid-guides", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch guides");
      }
      const data = await response.json();
      setGuides(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch guides");
      setLoading(false);
    }
  }, []);
  const createInitialGuides = useCallback(async () => {
    for (const guide of emergencyGuides) {
      try {
        const response = await fetch("/api/create-guide", {
          method: "POST",
          body: JSON.stringify({
            title: guide.title,
            content: "",
            category: guide.category,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to create guide: ${guide.title}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);
  const filteredAndSortedGuides = useMemo(() => {
    return guides
      .filter((guide) => {
        const matchesSearch =
          guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || guide.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const aValue = a[sortBy].toLowerCase();
        const bValue = b[sortBy].toLowerCase();
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
  }, [guides, searchTerm, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/account/signin?callbackUrl=/admin/guides";
      return;
    }
    if (!userLoading && user) {
      fetchGuides();
      createInitialGuides();
    }
  }, [fetchGuides, createInitialGuides, user, userLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/create-guide", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          steps: formData.steps,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create guide");
      }

      setFormData({ title: "", content: "", category: "", steps: [] });
      setShowForm(false);
      setIsEditing(false);
      fetchGuides();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create guide");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/delete-guide", {
        method: "POST",
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete guide");
      }

      fetchGuides();
    } catch (err) {
      console.error(err);
      setError("Failed to delete guide");
    }
  };

  const handleEdit = (guide) => {
    setFormData({
      title: guide.title,
      content: guide.content,
      category: guide.category,
      steps: guide.steps || [],
    });
    setIsEditing(true);
    setShowForm(true);
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex items-center justify-center h-full">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <a
              href="/admin"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <i className="fas fa-arrow-left mr-2" />
              Back to Admin Portal
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">
              {user.email}
            </span>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-2" />
              Create New Guide
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={fetchGuides}
              className="text-red-600 hover:underline text-sm mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-inter font-bold text-gray-900 dark:text-white">
                {isEditing ? "Edit Guide" : "Create New Guide"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setFormData({
                    title: "",
                    content: "",
                    category: "",
                    steps: [],
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="title"
                  placeholder="Guide Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <textarea
                  name="content"
                  placeholder="Guide Description"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-inter font-bold text-gray-900 dark:text-white">
                  Steps
                </h3>
                {formData.steps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      placeholder={`Step ${index + 1} description`}
                      value={step.description}
                      onChange={(e) => {
                        const newSteps = [...formData.steps];
                        newSteps[index] = { description: e.target.value };
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      rows={2}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = formData.steps.filter(
                          (_, i) => i !== index
                        );
                        setFormData({ ...formData, steps: newSteps });
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      steps: [...formData.steps, { description: "" }],
                    });
                  }}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <i className="fas fa-plus mr-2" />
                  Add Step
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? "Save Changes" : "Create Guide"}
              </button>
            </form>
          </div>
        )}

        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <input
                type="text"
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(guides.map((guide) => guide.category))).map(
                  (category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="title">Sort by Title</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredAndSortedGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <i
                    className={`fas ${
                      emergencyGuides.find((g) => g.category === guide.category)
                        ?.icon || "fa-book"
                    } text-2xl text-blue-600`}
                  />
                  <div>
                    <h3 className="text-xl font-inter font-bold text-gray-900 dark:text-white">
                      {guide.title}
                    </h3>
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                      {guide.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedGuide(guide)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <i className="fas fa-eye" />
                  </button>
                  <button
                    onClick={() => handleEdit(guide)}
                    className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                  >
                    <i className="fas fa-edit" />
                  </button>
                  <button
                    onClick={() => handleDelete(guide.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                {guide.content}
              </p>
            </div>
          ))}
        </div>

        {selectedGuide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <i
                    className={`fas ${
                      emergencyGuides.find(
                        (g) => g.category === selectedGuide.category
                      )?.icon || "fa-book"
                    } text-2xl text-blue-600`}
                  />
                  <h2 className="text-2xl font-inter font-bold text-gray-900 dark:text-white">
                    {selectedGuide.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
              <div className="space-y-6">
                {selectedGuide.steps &&
                  selectedGuide.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6"
                    >
                      {step.imageUrl && (
                        <div className="w-full md:w-1/2">
                          <img
                            src={step.imageUrl}
                            alt={`Medical illustration for step ${index + 1}`}
                            className="w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>
                      )}
                      <div className="w-full md:w-1/2">
                        <h3 className="font-inter font-bold text-gray-900 dark:text-white mb-2">
                          Step {index + 1}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                {(!selectedGuide.steps || selectedGuide.steps.length === 0) && (
                  <div className="text-gray-600 dark:text-gray-300">
                    {selectedGuide.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;