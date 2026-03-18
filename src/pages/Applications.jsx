import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiDownload, FiTrash2, FiEye } from 'react-icons/fi';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    jobId: 'all',
    category: 'all',
  });

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchFilters = async () => {
    try {
      const [jobsRes, categoriesRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/categories'),
      ]);
      setJobs(jobsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.jobId !== 'all') params.append('jobId', filters.jobId);
      if (filters.category !== 'all') params.append('category', filters.category);
      
      const response = await api.get(`/applications?${params.toString()}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = (resumePath) => {
    const url = `http://localhost:5000/${resumePath}`;
    window.open(url, '_blank');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/applications/${id}`);
        toast.success('Application deleted successfully');
        fetchApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/applications/${id}`, { status: newStatus });
      toast.success('Application status updated');
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-2">Manage candidate applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Job
            </label>
            <select
              value={filters.jobId}
              onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}
              className="input-field"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">JOB TITLE</th>
              <th className="table-header">CANDIDATE NAME</th>
              <th className="table-header">EMAIL</th>
              <th className="table-header">RESUME</th>
              <th className="table-header">APPLICATION DATE</th>
              <th className="table-header">STATUS</th>
              <th className="table-header">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id}>
                  <td className="table-cell font-medium">{app.jobId?.title}</td>
                  <td className="table-cell">{app.candidateName}</td>
                  <td className="table-cell">{app.email}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleDownloadResume(app.resume)}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FiDownload className="mr-1" size={16} />
                      {app.resume.split('/').pop()}
                    </button>
                  </td>
                  <td className="table-cell">{formatDate(app.applicationDate)}</td>
                  <td className="table-cell">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleDelete(app._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Applications;