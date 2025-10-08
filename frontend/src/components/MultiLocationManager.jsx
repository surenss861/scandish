import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Plus,
  Edit3,
  Copy,
  Users,
  BarChart3,
  Settings,
  Crown,
  Globe,
  Smartphone,
  Eye,
  Trash2,
  Power,
  TrendingUp,
  Calendar,
  DollarSign,
  Menu
} from "lucide-react";
import { usePlan } from "../context/PlanContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function MultiLocationManager() {
  const { user } = useAuth();
  const { isPro, upgradeTo } = usePlan();

  const [organization, setOrganization] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [toast, setToast] = useState("");
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    manager: '',
    email: '',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedAnalyticsLocation, setSelectedAnalyticsLocation] = useState(null);
  const [showMenusModal, setShowMenusModal] = useState(false);
  const [selectedMenusLocation, setSelectedMenusLocation] = useState(null);

  // Soft wall removed: feature always accessible

  useEffect(() => {
    loadOrganizationData();
  }, [user]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCreateLocation && event.target.classList.contains('fixed')) {
        resetForm();
      }
    };

    if (showCreateLocation) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCreateLocation]);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);

      if (user?.id) {
        // Get the current session to get the access token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error('No active session found');
        }

        const response = await fetch(`/api/locations/mine`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const realData = await response.json();
          if (realData.organization) {
            setOrganization(realData.organization);
            setLocations(realData.locations || []);
            return;
          }
        }
      }

      // No organization found - leave as null to show setup prompt
      setOrganization(null);
      setLocations([]);
    } catch (error) {
      console.error("Failed to load organization data:", error);
      setOrganization(null);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const ping = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(""), 3000);
  };

  const handleCreateOrganization = async () => {
    try {
      console.log('Creating organization...');
      console.log('User:', user);

      // Get the current session to get the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No active session found');
      }

      console.log('Session:', session);
      console.log('Access token:', session.access_token);

      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: 'My Restaurant',
          description: 'My restaurant organization'
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to create organization');
      }

      const result = await response.json();
      console.log('Success response:', result);

      if (result.success) {
        ping('Organization created successfully!');
        // Reload organization data
        await loadOrganizationData();
      }

    } catch (error) {
      console.error("Failed to create organization:", error);
      ping(error.message || "Failed to create organization. Please try again.", "error");
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();

    if (!newLocation.name.trim() || !newLocation.address.trim()) {
      ping("Please fill in required fields (Name and Address)", "error");
      return;
    }

    try {
      setIsCreating(true);

      // Get the current session to get the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No active session found');
      }

      // Make API call to create location
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: newLocation.name,
          address: newLocation.address,
          city: newLocation.city,
          state: newLocation.state,
          zipCode: newLocation.zipCode,
          phone: newLocation.phone,
          manager: newLocation.manager,
          email: newLocation.email,
          description: newLocation.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create location');
      }

      const result = await response.json();

      if (result.success && result.location) {
        // Add new location to the list
        const updatedLocations = [...locations, result.location];
        setLocations(updatedLocations);

        // Update organization stats
        setOrganization(prev => ({
          ...prev,
          totalLocations: prev.totalLocations + 1
        }));

        // Reset form and close modal
        setNewLocation({
          name: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          manager: '',
          email: '',
          description: ''
        });
        setShowCreateLocation(false);

        ping(`Location "${newLocation.name}" created successfully!`);
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      console.error("Failed to create location:", error);
      ping(error.message || "Failed to create location. Please try again.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditLocation = async (e) => {
    e.preventDefault();

    if (!editingLocation.name.trim() || !editingLocation.address.trim()) {
      ping("Please fill in required fields (Name and Address)", "error");
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No active session found');
      }

      const response = await fetch(`/api/locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: editingLocation.name,
          address: editingLocation.address,
          city: editingLocation.city,
          state: editingLocation.state,
          zipCode: editingLocation.zipCode,
          phone: editingLocation.phone,
          manager: editingLocation.manager,
          email: editingLocation.email,
          description: editingLocation.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update location');
      }

      const result = await response.json();

      if (result.success && result.location) {
        setLocations(prev => prev.map(loc =>
          loc.id === result.location.id ? result.location : loc
        ));
        setShowEditModal(false);
        setEditingLocation(null);
        ping(`Location "${editingLocation.name}" updated successfully!`);
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      console.error("Failed to update location:", error);
      ping(error.message || "Failed to update location. Please try again.", "error");
    }
  };

  const handleDeleteLocation = async () => {
    if (!locationToDelete) return;

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No active session found');
      }

      const response = await fetch(`/api/locations/${locationToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete location');
      }

      setLocations(prev => prev.filter(loc => loc.id !== locationToDelete.id));
      setOrganization(prev => ({
        ...prev,
        totalLocations: prev.totalLocations - 1
      }));
      setShowDeleteModal(false);
      setLocationToDelete(null);
      ping(`Location "${locationToDelete.name}" deleted successfully!`);

    } catch (error) {
      console.error("Failed to delete location:", error);
      ping(error.message || "Failed to delete location. Please try again.", "error");
    }
  };

  const handleToggleLocationStatus = async (location) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No active session found');
      }

      const newStatus = location.status === 'active' ? 'inactive' : 'active';

      const response = await fetch(`/api/locations/${location.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...location,
          status: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update location status');
      }

      const result = await response.json();

      if (result.success && result.location) {
        setLocations(prev => prev.map(loc =>
          loc.id === result.location.id ? result.location : loc
        ));
        ping(`Location ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      }

    } catch (error) {
      console.error("Failed to toggle location status:", error);
      ping(error.message || "Failed to update location status. Please try again.", "error");
    }
  };

  const handleDuplicateLocation = async (location) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No active session found');
      }

      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: `${location.name} (Copy)`,
          address: location.address,
          city: location.city,
          state: location.state,
          zipCode: location.zipCode,
          phone: location.phone,
          manager: location.manager,
          email: location.email,
          description: location.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to duplicate location');
      }

      const result = await response.json();

      if (result.success && result.location) {
        setLocations(prev => [...prev, result.location]);
        setOrganization(prev => ({ ...prev, totalLocations: prev.totalLocations + 1 }));
        ping(`Location duplicated successfully!`);
      }

    } catch (error) {
      console.error("Failed to duplicate location:", error);
      ping(error.message || "Failed to duplicate location. Please try again.", "error");
    }
  };

  const openEditModal = (location) => {
    setEditingLocation({ ...location });
    setShowEditModal(true);
  };

  const openDeleteModal = (location) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  };

  const openAnalyticsModal = (location) => {
    setSelectedAnalyticsLocation(location);
    setShowAnalyticsModal(true);
  };

  const openMenusModal = (location) => {
    setSelectedMenusLocation(location);
    setShowMenusModal(true);
  };

  const resetForm = () => {
    setNewLocation({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      manager: '',
      email: '',
      description: ''
    });
    setShowCreateLocation(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Building2
            size={32}
            className="mx-auto text-[#F3C77E] mb-4 animate-pulse"
          />
          <p className="text-[#a7a7a7]">Loading organization data...</p>
        </div>
      </div>
    );
  }

  // Show organization setup prompt if no organization exists
  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0e0c] border border-[#40434E]/40 rounded-2xl p-8 max-w-md"
        >
          <Building2 size={48} className="mx-auto text-[#F3C77E] mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Set Up Your Restaurant Organization
          </h2>
          <p className="text-[#a7a7a7] mb-6">
            Create an organization to manage multiple locations, menus, and analytics all in one place.
          </p>
          <button
            onClick={handleCreateOrganization}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black font-semibold rounded-lg hover:scale-105 transition-all duration-200"
          >
            Create Organization
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Building2 className="text-[#F3C77E]" size={28} />
            {organization.name}
          </h2>
          <p className="text-[#a7a7a7] text-sm">
            {organization.totalLocations} locations • {organization.totalMenus}{" "}
            menus • {organization.totalScans.toLocaleString()} total scans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 bg-[#0f0e0c] border border-[#40434E]/40 rounded-lg text-white text-sm"
          >
            <option value="all">All Locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCreateLocation(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-transform bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black hover:scale-105"
          >
            <Plus size={18} />
            Add Location
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          {
            icon: Building2,
            label: "Locations",
            value: organization.totalLocations,
            color: "text-[#F3C77E]"
          },
          {
            icon: Globe,
            label: "Active Menus",
            value: organization.totalMenus,
            color: "text-blue-400"
          },
          {
            icon: Eye,
            label: "Total Scans",
            value: organization.totalScans.toLocaleString(),
            color: "text-green-400"
          },
          {
            icon: Crown,
            label: "Monthly Revenue",
            value: `$${organization.monthlyRevenue}`,
            color: "text-purple-400"
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className={stat.color} size={24} />
              <h3 className="font-semibold text-white">{stat.label}</h3>
            </div>
            <div className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Locations Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <MapPin size={20} className="text-[#F3C77E]" />
          Restaurant Locations
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              className="group relative bg-[#40434E]/10 border border-[#40434E]/40 rounded-xl p-6 hover:border-[#F3C77E]/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">
                    {location.name}
                  </h4>
                  <p className="text-sm text-[#a7a7a7]">{location.address}</p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${location.status === "active" ? "bg-green-400" : "bg-red-400"
                    }`}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-[#F3C77E]">
                    {location.menus.length}
                  </div>
                  <div className="text-xs text-[#a7a7a7]">Menus</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {location.scans.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#a7a7a7]">Scans</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-[#d6d6d6] mb-4">
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>Manager: {location.manager}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone size={14} />
                  <span>{location.phone}</span>
                </div>
              </div>

              {/* Menus */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-[#F3C77E] mb-2">
                  Active Menus
                </h5>
                <div className="space-y-1">
                  {location.menus.map((menu, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-[#d6d6d6] flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-[#F3C77E] rounded-full"></span>
                      {menu}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(location)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#40434E]/20 hover:bg-[#F3C77E]/20 text-white hover:text-[#F3C77E] rounded-lg text-sm transition-colors"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => openMenusModal(location)}
                    className="flex items-center justify-center p-2 bg-[#40434E]/20 hover:bg-green-500/20 text-white hover:text-green-400 rounded-lg transition-colors"
                    title="View menus"
                  >
                    <Menu size={14} />
                  </button>
                  <button
                    onClick={() => openAnalyticsModal(location)}
                    className="flex items-center justify-center p-2 bg-[#40434E]/20 hover:bg-blue-500/20 text-white hover:text-blue-400 rounded-lg transition-colors"
                    title="View analytics"
                  >
                    <BarChart3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDuplicateLocation(location)}
                    className="flex items-center justify-center p-2 bg-[#40434E]/20 hover:bg-purple-500/20 text-white hover:text-purple-400 rounded-lg transition-colors"
                    title="Duplicate location"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleToggleLocationStatus(location)}
                    className={`flex items-center justify-center p-2 bg-[#40434E]/20 ${location.status === 'active' ? 'hover:bg-red-500/20 hover:text-red-400' : 'hover:bg-green-500/20 hover:text-green-400'} text-white rounded-lg transition-colors`}
                    title={location.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={14} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(location)}
                    className="flex items-center justify-center p-2 bg-[#40434E]/20 hover:bg-red-500/20 text-white hover:text-red-400 rounded-lg transition-colors"
                    title="Delete location"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Create Location Modal */}
      {showCreateLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0e0c] border border-[#40434E]/40 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="text-[#F3C77E]" size={24} />
                Add New Location
              </h3>
              <button
                onClick={resetForm}
                className="text-[#a7a7a7] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-6">
              {/* Location Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Downtown Branch, Airport Location"
                  className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={newLocation.state}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={newLocation.zipCode}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="12345"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newLocation.phone}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Manager Email
                  </label>
                  <input
                    type="email"
                    value={newLocation.email}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="manager@restaurant.com"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Manager Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Manager Name
                </label>
                <input
                  type="text"
                  value={newLocation.manager}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, manager: e.target.value }))}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={newLocation.description}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of this location..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-[#40434E]/50 text-[#d6d6d6] rounded-xl hover:border-[#F3C77E]/50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Location
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Location Modal */}
      {showEditModal && editingLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0e0c] border border-[#40434E]/40 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="text-[#F3C77E]" size={24} />
                Edit Location
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingLocation(null); }}
                className="text-[#a7a7a7] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditLocation} className="space-y-6">
              {/* Location Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Downtown Branch, Airport Location"
                  className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={editingLocation.address}
                  onChange={(e) => setEditingLocation(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingLocation.city}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={editingLocation.state}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={editingLocation.zipCode}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="ZIP"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone, Manager, Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingLocation.phone}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Manager
                  </label>
                  <input
                    type="text"
                    value={editingLocation.manager}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, manager: e.target.value }))}
                    placeholder="Manager Name"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingLocation.email}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={editingLocation.description}
                  onChange={(e) => setEditingLocation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of this location..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#40434E]/20 border border-[#40434E]/40 rounded-xl text-white placeholder-[#a7a7a7] focus:border-[#F3C77E]/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingLocation(null); }}
                  className="flex-1 px-6 py-3 border border-[#40434E]/50 text-[#d6d6d6] rounded-xl hover:border-[#F3C77E]/50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-all duration-200"
                >
                  <Edit3 size={18} />
                  Update Location
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && locationToDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0e0c] border border-[#40434E]/40 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Location</h3>
                <p className="text-sm text-[#a7a7a7]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-[#d6d6d6] mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{locationToDelete.name}</span>? All data associated with this location will be permanently removed.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setLocationToDelete(null); }}
                className="flex-1 px-6 py-3 border border-[#40434E]/50 text-[#d6d6d6] rounded-xl hover:border-[#F3C77E]/50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLocation}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedAnalyticsLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0e0c] border border-[#40434E]/40 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="text-[#F3C77E]" size={24} />
                  Analytics - {selectedAnalyticsLocation.name}
                </h3>
                <p className="text-sm text-[#a7a7a7] mt-1">{selectedAnalyticsLocation.address}</p>
              </div>
              <button
                onClick={() => { setShowAnalyticsModal(false); setSelectedAnalyticsLocation(null); }}
                className="text-[#a7a7a7] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#40434E]/10 border border-[#40434E]/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="text-blue-400" size={18} />
                  <span className="text-xs text-[#a7a7a7]">Total Scans</span>
                </div>
                <div className="text-2xl font-bold text-white">{selectedAnalyticsLocation.scans.toLocaleString()}</div>
              </div>
              <div className="bg-[#40434E]/10 border border-[#40434E]/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="text-[#F3C77E]" size={18} />
                  <span className="text-xs text-[#a7a7a7]">Active Menus</span>
                </div>
                <div className="text-2xl font-bold text-white">{selectedAnalyticsLocation.menus.length}</div>
              </div>
            </div>

            {/* Active Menus */}
            <div className="bg-[#40434E]/10 border border-[#40434E]/40 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-[#F3C77E] mb-3">Active Menus</h4>
              <div className="space-y-2">
                {selectedAnalyticsLocation.menus && selectedAnalyticsLocation.menus.length > 0 ? (
                  selectedAnalyticsLocation.menus.map((menu, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#0f0e0c] rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#F3C77E] rounded-full"></span>
                        <span className="text-white">{menu}</span>
                      </div>
                      <span className="text-xs text-[#a7a7a7]">Active</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Globe className="mx-auto text-[#a7a7a7] mb-2" size={24} />
                    <p className="text-[#a7a7a7] text-sm">No active menus found</p>
                    <p className="text-[#666] text-xs mt-1">Create menus for this location to see them here</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => { setShowAnalyticsModal(false); setSelectedAnalyticsLocation(null); }}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-all duration-200"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Menus Modal */}
      {showMenusModal && selectedMenusLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0e0c] border border-[#40434E]/40 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Menu className="text-[#F3C77E]" size={24} />
                  Menus - {selectedMenusLocation.name}
                </h3>
                <p className="text-sm text-[#a7a7a7] mt-1">{selectedMenusLocation.address}</p>
              </div>
              <button
                onClick={() => { setShowMenusModal(false); setSelectedMenusLocation(null); }}
                className="text-[#a7a7a7] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Menu Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#40434E]/10 border border-[#40434E]/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="text-[#F3C77E]" size={18} />
                  <span className="text-xs text-[#a7a7a7]">Total Menus</span>
                </div>
                <div className="text-2xl font-bold text-white">{selectedMenusLocation.menus.length}</div>
              </div>
              <div className="bg-[#40434E]/10 border border-[#40434E]/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="text-blue-400" size={18} />
                  <span className="text-xs text-[#a7a7a7]">Total Scans</span>
                </div>
                <div className="text-2xl font-bold text-white">{selectedMenusLocation.scans.toLocaleString()}</div>
              </div>
            </div>

            {/* Menu List */}
            <div className="bg-[#40434E]/10 border border-[#40434E]/40 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-[#F3C77E] mb-3">All Menus</h4>
              <div className="space-y-2">
                {selectedMenusLocation.menus && selectedMenusLocation.menus.length > 0 ? (
                  selectedMenusLocation.menus.map((menu, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#0f0e0c] rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-[#F3C77E] rounded-full"></span>
                        <div>
                          <span className="text-white font-medium">{menu}</span>
                          <div className="text-xs text-[#a7a7a7]">Created from Custom Branding</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Active</span>
                        <button className="text-[#a7a7a7] hover:text-[#F3C77E] transition-colors" title="View menu">
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Menu className="mx-auto text-[#a7a7a7] mb-2" size={32} />
                    <p className="text-[#a7a7a7] text-sm">No menus found for this location</p>
                    <p className="text-xs text-[#666] mt-1">Create a menu using Custom Branding to see it here</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowMenusModal(false); setSelectedMenusLocation(null); }}
                className="flex-1 px-6 py-3 bg-[#40434E]/20 text-white rounded-xl font-medium hover:bg-[#40434E]/40 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowMenusModal(false);
                  setSelectedMenusLocation(null);
                  // Navigate to custom branding
                  window.location.href = '/branding/logo';
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-all duration-200"
              >
                Create New Menu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl backdrop-blur-xl border text-white shadow-2xl ${toast.type === "error"
            ? "bg-red-500/90 border-red-400/40"
            : "bg-[#0f0e0c]/90 border-[#40434E]/40"
            }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={
                toast.type === "error" ? "text-red-200" : "text-[#F3C77E]"
              }
            >
              {toast.type === "error" ? "⚠️" : "✓"}
            </span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
