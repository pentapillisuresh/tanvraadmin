import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../services/api';
import { 
  FiFolder, 
  FiBriefcase, 
  FiUsers, 
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiMapPin,
  FiCalendar
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    overview: {
      totalCategories: 0,
      totalJobs: 0,
      activeJobs: 0,
      closedJobs: 0,
      draftJobs: 0
    },
    jobsByType: [],
    customCategoryStats: {
      total: 0,
      categories: []
    },
    recentJobs: [],
    totalApplications: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [jobsStatsRes, categoriesRes, applicationsRes] = await Promise.all([
        api.get('/jobs/stats'),
        api.get('/categories'),
        api.get('/applications'),
      ]);

      // Calculate pending applications
      const pendingApps = applicationsRes.data.filter(app => app.status === 'pending').length;

      setStats({
        overview: {
          totalCategories: categoriesRes.data.length,
          totalJobs: jobsStatsRes.data.overview?.totalJobs || 0,
          activeJobs: jobsStatsRes.data.overview?.activeJobs || 0,
          closedJobs: jobsStatsRes.data.overview?.closedJobs || 0,
          draftJobs: jobsStatsRes.data.overview?.draftJobs || 0
        },
        jobsByType: jobsStatsRes.data.jobsByType || [],
        customCategoryStats: jobsStatsRes.data.customCategoryStats || { total: 0, categories: [] },
        recentJobs: jobsStatsRes.data.recentJobs || [],
        totalApplications: applicationsRes.data.length,
        pendingApplications: pendingApps
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values in case of error
      setStats({
        overview: {
          totalCategories: 0,
          totalJobs: 0,
          activeJobs: 0,
          closedJobs: 0,
          draftJobs: 0
        },
        jobsByType: [],
        customCategoryStats: { total: 0, categories: [] },
        recentJobs: [],
        totalApplications: 0,
        pendingApplications: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const mainCards = [
    {
      title: 'Total Categories',
      value: stats.overview.totalCategories,
      icon: FiFolder,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      onClick: () => navigate('/categories')
    },
    {
      title: 'Total Jobs',
      value: stats.overview.totalJobs,
      icon: FiBriefcase,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      onClick: () => navigate('/jobs')
    },
    {
      title: 'Active Jobs',
      value: stats.overview.activeJobs,
      icon: FiCheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      onClick: () => navigate('/jobs?status=active')
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FiUsers,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      onClick: () => navigate('/applications')
    }
  ];

  const statusCards = [
    {
      title: 'Closed Jobs',
      value: stats.overview.closedJobs,
      icon: FiXCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      onClick: () => navigate('/jobs?status=closed')
    },
    {
      title: 'Draft Jobs',
      value: stats.overview.draftJobs,
      icon: FiClock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      onClick: () => navigate('/jobs?status=draft')
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: FiTrendingUp,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      onClick: () => navigate('/applications?status=pending')
    },
    {
      title: 'Custom Categories',
      value: stats.customCategoryStats.total,
      icon: FiMapPin,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      onClick: () => navigate('/jobs?category=Others')
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the Careers Management System. Here's what's happening with your job postings.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => navigate('/categories/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FiFolder size={20} />
            <span>Add New Category</span>
          </button>
          <button 
            onClick={() => navigate('/jobs/new')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <FiBriefcase size={20} />
            <span>Post New Job</span>
          </button>
          <button 
            onClick={() => navigate('/applications')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <FiUsers size={20} />
            <span>View Applications</span>
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainCards.map((card) => (
          <div 
            key={card.title}
            onClick={card.onClick}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={card.textColor} size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{card.value}</span>
            </div>
            <h3 className="text-gray-600 font-medium">{card.title}</h3>
          </div>
        ))}
      </div>

      {/* Status Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card) => (
          <div 
            key={card.title}
            onClick={card.onClick}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
                <span className="text-2xl font-bold text-gray-900">{card.value}</span>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={card.textColor} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Jobs by Type */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Jobs by Type</h2>
          {stats.jobsByType.length > 0 ? (
            <div className="space-y-3">
              {stats.jobsByType.map((type) => (
                <div key={type._id} className="flex items-center justify-between">
                  <span className="text-gray-600">{type._id || 'Not Specified'}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(type.count / stats.overview.activeJobs) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No job type data available</p>
          )}
        </div>

        {/* Custom Categories */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Custom Categories (Others)
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({stats.customCategoryStats.total} total)
            </span>
          </h2>
          {stats.customCategoryStats.categories.length > 0 ? (
            <div className="space-y-3">
              {stats.customCategoryStats.categories.slice(0, 5).map((cat) => (
                <div key={cat._id} className="flex items-center justify-between">
                  <span className="text-gray-600 truncate max-w-[150px]">{cat._id}</span>
                  <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm">
                    {cat.count} {cat.count === 1 ? 'job' : 'jobs'}
                  </span>
                </div>
              ))}
              {stats.customCategoryStats.categories.length > 5 && (
                <button 
                  onClick={() => navigate('/jobs?category=Others')}
                  className="text-blue-600 text-sm hover:underline mt-2"
                >
                  View all {stats.customCategoryStats.categories.length} categories
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No custom categories found</p>
          )}
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Categories</span>
              <span className="font-bold text-gray-900">{stats.overview.totalCategories}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Jobs</span>
              <span className="font-bold text-gray-900">{stats.overview.totalJobs}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Active Jobs</span>
              <span className="font-bold text-green-600">{stats.overview.activeJobs}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Applications</span>
              <span className="font-bold text-gray-900">{stats.totalApplications}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Pending Applications</span>
              <span className="font-bold text-yellow-600">{stats.pendingApplications}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      {stats.recentJobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Job Postings</h2>
            <button 
              onClick={() => navigate('/jobs')}
              className="text-blue-600 hover:underline text-sm"
            >
              View All Jobs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Job Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Posted Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentJobs.map((job) => (
                  <tr key={job._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">{job.title}</td>
                    <td className="py-3 px-4 text-gray-600">{job.companyName}</td>
                    <td className="py-3 px-4 text-gray-600">{job.location}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <FiCalendar size={14} />
                        <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;