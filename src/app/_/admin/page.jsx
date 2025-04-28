"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading } = useUser();
  const [stats, setStats] = useState({
    activeSosCount: 0,
    pendingAssistanceCount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/account/signin?callbackUrl=/admin";
    }
  }, [user, loading]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/get-admin-dashboard-stats", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Error fetching stats: ${response.status}`);
      }
      const data = await response.json();
      if (data) {
        setStats({
          activeSosCount: data.activeSosCount || 0,
          pendingAssistanceCount: data.pendingAssistanceCount || 0,
        });
      }
      setIsLoadingStats(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(error.message);
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-[#E54D4D]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center text-red-500">
        Error loading dashboard stats
      </div>
    );
  }

  const adminCards = [
    {
      title: "SOS Alerts Management",
      icon: "fa-exclamation-triangle",
      link: "/admin/sos",
      description: "Monitor and respond to SOS alerts",
      gradient: "from-[#E54D4D] to-[#FF3366]",
      iconColor: "#E54D4D",
      bgGradient: "from-[#E54D4D]/10 to-[#FF3366]/10",
    },
    {
      title: "Assistance Requests",
      icon: "fa-hands-helping",
      link: "/admin/assistance",
      description: "Monitor and respond to assistance requests",
      gradient: "from-[#FFA500] to-[#FF8C42]",
      iconColor: "#FFA500",
      bgGradient: "from-[#FFA500]/10 to-[#FF8C42]/10",
    },
    {
      title: "Emergency Alerts Management",
      icon: "fa-bell",
      link: "/admin/alerts",
      description: "Manage and send emergency alerts to users",
      gradient: "from-[#FF4D4D] to-[#FF8C42]",
      iconColor: "#FF4D4D",
      bgGradient: "from-[#FF4D4D]/10 to-[#FF8C42]/10",
    },
    {
      title: "Emergency Contacts Management",
      icon: "fa-phone-alt",
      link: "/admin/contacts",
      description: "Update emergency contact information",
      gradient: "from-[#845EC2] to-[#D65DB1]",
      iconColor: "#845EC2",
      bgGradient: "from-[#845EC2]/10 to-[#D65DB1]/10",
    },
    {
      title: "First Aid Guides Management",
      icon: "fa-book-medical",
      link: "/admin/guides",
      description: "Edit and organize first aid guides",
      gradient: "from-[#2EC4B6] to-[#3BBA9C]",
      iconColor: "#2EC4B6",
      bgGradient: "from-[#2EC4B6]/10 to-[#3BBA9C]/10",
    },
    {
      title: "Wellbeing Tips Management",
      icon: "fa-heart",
      link: "/admin/tips",
      description: "Manage daily wellbeing tips",
      gradient: "from-[#4D8BFF] to-[#6C63FF]",
      iconColor: "#4D8BFF",
      bgGradient: "from-[#4D8BFF]/10 to-[#6C63FF]/10",
    },
    {
      title: "Assistance Request Options",
      icon: "fa-list",
      link: "/admin/assistance-options",
      description: "Configure available assistance request options",
      gradient: "from-[#4A90E2] to-[#357ABD]",
      iconColor: "#4A90E2",
      bgGradient: "from-[#4A90E2]/10 to-[#357ABD]/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
          <div className="relative">
            <h1 className="text-4xl font-inter font-bold bg-gradient-to-r from-[#FF4D4D] via-[#845EC2] to-[#4D8BFF] bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-[#FF4D4D] via-[#845EC2] to-[#4D8BFF] rounded-full mt-2 opacity-50" />
            <p className="text-gray-400 mt-2">
              Manage your school well-being services
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-900/50 py-2 px-4 rounded-full border border-gray-800">
            <span className="text-gray-400 text-sm">{user.email}</span>
            <div className="h-4 w-[1px] bg-gray-700 mx-2" />
            <a
              href="/account/logout"
              className="text-sm bg-gradient-to-r from-[#FF4D4D] to-[#FF8C42] bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center gap-1"
            >
              Logout
              <i className="fas fa-sign-out-alt ml-1" />
            </a>
          </div>
        </div>
        <div className="text-sm text-gray-400 mb-4 flex items-center justify-end gap-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
          <button
            onClick={fetchStats}
            className="hover:text-blue-400 transition-colors"
            title="Refresh data"
          >
            <i className="fas fa-sync-alt" />
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-xl border ${
              stats?.activeSosCount > 0
                ? "border-red-500 bg-red-500/10 animate-pulse"
                : "border-gray-800 bg-gray-900/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Active SOS Alerts</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      stats?.activeSosCount > 0
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {isLoadingStats ? (
                      <i className="fas fa-spinner fa-spin" />
                    ) : (
                      stats?.activeSosCount
                    )}
                  </span>
                  {stats?.activeSosCount > 0 && (
                    <a
                      href="/admin/sos"
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      View All <i className="fas fa-arrow-right ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`p-4 rounded-xl border ${
              stats?.pendingAssistanceCount > 0
                ? "border-orange-500 bg-orange-500/10"
                : "border-gray-800 bg-gray-900/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <i className="fas fa-hands-helping text-orange-500 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Pending Assistance</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      stats?.pendingAssistanceCount > 0
                        ? "text-orange-500"
                        : "text-gray-400"
                    }`}
                  >
                    {isLoadingStats ? (
                      <i className="fas fa-spinner fa-spin" />
                    ) : (
                      stats?.pendingAssistanceCount
                    )}
                  </span>
                  {stats?.pendingAssistanceCount > 0 && (
                    <a
                      href="/admin/assistance"
                      className="text-orange-500 hover:text-orange-400 text-sm"
                    >
                      View All <i className="fas fa-arrow-right ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminCards.map((card) => (
            <a key={card.title} href={card.link} className="relative group">
              <div
                className={`
                absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-xl
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
              `}
              />
              <div
                className={`
                relative bg-gray-900/50 hover:bg-gray-900/70 rounded-xl p-8
                transition-all duration-300 border border-gray-800 
                hover:border-[${card.iconColor}] hover:shadow-[0_0_15px_${card.iconColor}]
                flex flex-col gap-6
              `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div
                      className={`
      w-16 h-16 rounded-full bg-gradient-to-br ${card.bgGradient}
      flex items-center justify-center
      group-hover:scale-110 transition-transform duration-300
    `}
                    >
                      <i
                        className={`fas ${card.icon} text-2xl`}
                        style={{ color: card.iconColor }}
                      />
                    </div>
                    <h3 className="font-inter font-bold text-2xl text-white">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{card.description}</p>
                  </div>
                  <div
                    className={`
    text-gray-600
    transform group-hover:translate-x-2
    transition-all duration-300
  `}
                    style={{ color: card.iconColor }}
                  >
                    <i className="fas fa-arrow-right text-xl" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;