"use client";
import React from "react";

function MainComponent() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    description: "",
    available_hours: "",
    is_available: true,
    contact_type: "general",
  });
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/get-emergency-contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: filterType === "all" ? null : filterType,
          available: showAvailableOnly ? true : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received contacts data:", data);

      const contactsArray = Array.isArray(data)
        ? data
        : data && Array.isArray(data.json)
        ? data.json
        : [];

      setContacts(contactsArray);
      setError(null);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Could not load contacts. Please try again later.");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, showAvailableOnly]);
  const { data: user, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/account/signin?callbackUrl=/admin/contacts";
    }
  }, [user, userLoading]);

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 60000);
    return () => clearInterval(interval);
  }, [fetchContacts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/create-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      });

      if (!response.ok) {
        throw new Error("Failed to create contact");
      }

      setShowForm(false);
      setNewContact({
        name: "",
        role: "",
        email: "",
        phone: "",
        description: "",
        available_hours: "",
        is_available: true,
        contact_type: "general",
      });
      fetchContacts();
    } catch (err) {
      console.error(err);
      setError("Failed to create contact");
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/update-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingContact),
      });

      if (!response.ok) {
        throw new Error("Failed to update contact");
      }

      setEditingContact(null);
      fetchContacts();
    } catch (err) {
      console.error(err);
      setError("Failed to update contact");
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch("/api/delete-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      fetchContacts();
    } catch (err) {
      console.error(err);
      setError("Failed to delete contact");
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-[#E54D4D]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#845EC2] to-[#D65DB1] bg-clip-text text-transparent">
              Emergency Contacts Management
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-[#845EC2] to-[#D65DB1] rounded-full mt-2 opacity-50" />
            <p className="text-gray-400 mt-2">
              Add and manage emergency contact information
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#845EC2] to-[#D65DB1] rounded-full font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <i className="fas fa-plus" />
            Add New Contact
          </button>
        </div>
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-md bg-gray-800 border-gray-700 text-white"
          >
            <option value="all">All Types</option>
            <option value="emergency">Emergency</option>
            <option value="counseling">Counseling</option>
            <option value="medical">Medical</option>
            <option value="general">General</option>
            <option value="crisis">Crisis</option>
          </select>

          <label className="flex items-center text-gray-400">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="mr-2 rounded bg-gray-800 border-gray-700 text-[#845EC2]"
            />
            <span>Show Available Only</span>
          </label>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            {error}
            <button onClick={fetchContacts} className="ml-2 text-sm underline">
              Retry
            </button>
          </div>
        )}

        {showForm && (
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-inter font-bold text-gray-900 dark:text-white">
                Add New Contact
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Name"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <input
                  name="role"
                  type="text"
                  placeholder="Role"
                  value={newContact.role}
                  onChange={(e) =>
                    setNewContact({ ...newContact, role: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <select
                  name="contact_type"
                  value={newContact.contact_type}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      contact_type: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="emergency">Emergency</option>
                  <option value="counseling">Counseling</option>
                  <option value="medical">Medical</option>
                  <option value="crisis">Crisis</option>
                </select>
                <input
                  name="available_hours"
                  type="text"
                  placeholder="Available Hours"
                  value={newContact.available_hours}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      available_hours: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <textarea
                name="description"
                placeholder="Description"
                value={newContact.description}
                onChange={(e) =>
                  setNewContact({ ...newContact, description: e.target.value })
                }
                className="mt-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="3"
              />
              <div className="mt-4 flex items-center">
                <input
                  name="is_available"
                  type="checkbox"
                  checked={newContact.is_available}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      is_available: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Currently Available
                </span>
              </div>
              <button
                type="submit"
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Contact
              </button>
            </form>
          </div>
        )}

        {editingContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#0A0B14] rounded-xl p-6 border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Edit Contact</h2>
                <button
                  onClick={() => setEditingContact(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    value={editingContact.name}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        name: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    name="role"
                    type="text"
                    placeholder="Role"
                    value={editingContact.role}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        role: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={editingContact.email}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        email: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone"
                    value={editingContact.phone}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        phone: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <select
                    name="contact_type"
                    value={editingContact.contact_type}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        contact_type: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="general">General</option>
                    <option value="emergency">Emergency</option>
                    <option value="counseling">Counseling</option>
                    <option value="medical">Medical</option>
                    <option value="crisis">Crisis</option>
                  </select>
                  <input
                    name="available_hours"
                    type="text"
                    placeholder="Available Hours"
                    value={editingContact.available_hours}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        available_hours: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={editingContact.description}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                />
                <div className="flex items-center">
                  <input
                    name="is_available"
                    type="checkbox"
                    checked={editingContact.is_available}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        is_available: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-300">Currently Available</span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Contact
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <i className="fas fa-spinner fa-spin text-4xl text-[#845EC2]" />
            </div>
          ) : contacts && contacts.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              No contacts found
            </div>
          ) : (
            Array.isArray(contacts) &&
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-[#845EC2] transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{contact.name}</h3>
                    <p className="text-gray-400">{contact.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingContact(contact)}
                      className="p-2 text-[#845EC2] hover:bg-[#845EC2]/10 rounded-full transition-colors"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <i className="fas fa-phone text-[#845EC2]" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:text-[#845EC2]"
                    >
                      {contact.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <i className="fas fa-envelope text-[#845EC2]" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-[#845EC2]"
                    >
                      {contact.email}
                    </a>
                  </p>
                  {contact.description && (
                    <p className="flex items-start gap-2 mt-2">
                      <i className="fas fa-info-circle text-[#845EC2] mt-1" />
                      <span className="text-gray-400">
                        {contact.description}
                      </span>
                    </p>
                  )}
                  {contact.available_hours && (
                    <p className="flex items-start gap-2">
                      <i className="fas fa-clock text-[#845EC2] mt-1" />
                      <span className="text-gray-400">
                        {contact.available_hours}
                      </span>
                    </p>
                  )}
                  <div className="mt-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        contact.contact_type === "emergency"
                          ? "bg-red-500/20 text-red-400"
                          : contact.contact_type === "counseling"
                          ? "bg-blue-500/20 text-blue-400"
                          : contact.contact_type === "medical"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {contact.contact_type.charAt(0).toUpperCase() +
                        contact.contact_type.slice(1)}
                    </span>
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