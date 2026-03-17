import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiFilter, FiRefreshCw, FiChevronDown, FiChevronUp, FiEye, FiCopy, FiLink } from 'react-icons/fi';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    customCategory: ''
  });

  // Form states
  const [customCategory, setCustomCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    category: '',
    location: '',
    experience: '',
    salary: '',
    keySkills: '',
    description: '',
    qualifications: '',
    responsibilities: '',
    role: '',
    industryType: '',
    department: '',
    employmentType: 'Full Time',
    applicationEmail: '',
    vacancies: 1,
    status: 'active',
    featured: false,
    urgent: false
  });

  // Fixed categories reference
  const fixedCategories = [
    'Quantum Computing',
    'AI & Machine Learning',
    'Blockchain',
    'InsurTech',
    'Cybersecurity',
    'Others'
  ];

  // Employment types
  const employmentTypes = [
    'Full Time',
    'Part Time',
    'Contract',
    'Internship',
    'Temporary'
  ];

  // Get base URL for job links
  const getBaseUrl = () => {
    return window.location.origin;
  };

  // Copy job link to clipboard
  const copyJobLink = (jobId) => {
    const jobUrl = `${getBaseUrl()}/job/${jobId}`;
    navigator.clipboard.writeText(jobUrl).then(() => {
      setCopiedId(jobId);
      toast.success('Job link copied to clipboard!', {
        icon: '🔗',
        duration: 2000
      });
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  useEffect(() => {
    fetchCategories();
    fetchCustomCategories();
  }, []);

  // Fetch jobs whenever filters change
  useEffect(() => {
    fetchFilteredJobs();
  }, [filters]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await api.get('/categories');
      console.log('Categories fetched:', response.data);
      
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      } else {
        console.log('No categories found');
        toast.error('No categories found in database');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCustomCategories = async () => {
    try {
      const response = await api.get('/jobs/custom-categories/list');
      setCustomCategories(response.data);
    } catch (error) {
      console.error('Error fetching custom categories:', error);
    }
  };

  const fetchFilteredJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (filters.category) {
        params.category = filters.category;
      }
      
      if (filters.customCategory) {
        params.customCategory = filters.customCategory;
      }

      console.log('Fetching jobs with params:', params);
      const response = await api.get('/jobs', { params });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Form related functions
  const selectedCategory = categories.find(
    (c) => c._id === formData.category
  );

  const isOthersSelected = selectedCategory?.name === 'Others';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.applicationEmail) {
      toast.error('Please enter application email');
      return;
    }

    try {
      const payload = { ...formData };

      if (isOthersSelected) {
        if (!customCategory.trim()) {
          toast.error('Please enter a custom category');
          return;
        }
        payload.customCategory = customCategory.trim();
      } else {
        payload.customCategory = null;
      }

      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, payload);
        toast.success('Job updated successfully');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job created successfully');
      }

      fetchFilteredJobs();
      fetchCustomCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(error.response?.data?.message || 'Error saving job');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.delete(`/jobs/${id}`);
        toast.success('Job deleted successfully');
        fetchFilteredJobs();
        fetchCustomCategories();
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Error deleting job');
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      companyName: job.companyName || '',
      category: job.category?._id || '',
      location: job.location || '',
      experience: job.experience || '',
      salary: job.salary || '',
      keySkills: job.keySkills || '',
      description: job.description || '',
      qualifications: job.qualifications || '',
      responsibilities: job.responsibilities || '',
      role: job.role || '',
      industryType: job.industryType || '',
      department: job.department || '',
      employmentType: job.employmentType || 'Full Time',
      applicationEmail: job.applicationEmail || '',
      vacancies: job.vacancies || 1,
      status: job.status || 'active',
      featured: job.featured || false,
      urgent: job.urgent || false
    });
    setCustomCategory(job.customCategory || '');
    setShowModal(true);
  };

  const handleViewDetails = (job) => {
    setSelectedJobForDetails(job);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingJob(null);
    setCustomCategory('');
    setFormData({
      title: '',
      companyName: '',
      category: '',
      location: '',
      experience: '',
      salary: '',
      keySkills: '',
      description: '',
      qualifications: '',
      responsibilities: '',
      role: '',
      industryType: '',
      department: '',
      employmentType: 'Full Time',
      applicationEmail: '',
      vacancies: 1,
      status: 'active',
      featured: false,
      urgent: false
    });
  };

  // FILTER FUNCTIONS
  const handleFilterChange = (name, value) => {
    if (name === 'category') {
      setFilters({
        category: value,
        customCategory: ''
      });
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (filters.category === categoryId) {
      setFilters({
        category: '',
        customCategory: ''
      });
    } else {
      setFilters({
        category: categoryId,
        customCategory: ''
      });
    }
  };

  const getOthersCategoryId = () => {
    const others = categories.find(c => c.name === 'Others');
    return others?._id || '';
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      customCategory: ''
    });
  };

  const refreshData = () => {
    fetchCategories();
    fetchCustomCategories();
    fetchFilteredJobs();
    toast.success('Data refreshed');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDisplayCategory = (job) => {
    if (job.category?.name === 'Others' && job.customCategory) {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-purple-700">{job.category.name}</span>
          <span className="text-xs text-gray-500">
            {job.customCategory}
          </span>
        </div>
      );
    }
    return (
      <span className="text-blue-700">{job.category?.name || 'N/A'}</span>
    );
  };

  const getCategoryNameById = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || 'Unknown';
  };

  const isFilteringOthers = filters.category === getOthersCategoryId();

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={refreshData}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex-1 sm:flex-none"
            title="Refresh data"
          >
            <FiRefreshCw className="mr-2" />
            <span className="sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => {
              if (categories.length === 0) {
                toast.error('Please wait for categories to load');
                return;
              }
              setShowModal(true);
            }}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 sm:flex-none"
          >
            <FiPlus className="mr-2" />
            <span className="sm:inline">Post New Job</span>
          </button>
        </div>
      </div>

      {/* Categories Status Banner */}
      {categories.length === 0 && !categoriesLoading && (
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
          <p className="font-bold">⚠️ No Categories Found</p>
          <p className="text-sm">
            The database doesn't have any categories. Please run the seed script or contact administrator.
          </p>
        </div>
      )}

      {/* Categories Summary - Click to Filter */}
      {categories.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiChevronDown className="mr-1" />
            Click on any category to filter jobs
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat._id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                  filters.category === cat._id
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2'
                    : cat.name === 'Others'
                    ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
                title={`Click to ${filters.category === cat._id ? 'remove' : 'apply'} filter`}
              >
                {cat.name}
                {cat.name === 'Others' && ' 📦'}
                {filters.category === cat._id && ' ✓'}
              </button>
            ))}
            {filters.category && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                title="Clear all filters"
              >
                Clear Filter ✕
              </button>
            )}
          </div>
          {isFilteringOthers && customCategories.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Filter by custom category under "Others":</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('customCategory', '')}
                  className={`px-2 py-1 rounded-md text-xs ${
                    !filters.customCategory
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {customCategories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterChange('customCategory', cat)}
                    className={`px-2 py-1 rounded-md text-xs ${
                      filters.customCategory === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-6 bg-white rounded-lg shadow">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between p-4 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <FiFilter className="mr-2" />
            Advanced Filters
            {(filters.category || filters.customCategory) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                Active
              </span>
            )}
          </div>
          {showFilters ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {showFilters && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={categories.length === 0}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                      {category.name === 'Others' && ' (with custom categories)'}
                    </option>
                  ))}
                </select>
              </div>

              {isFilteringOthers && customCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Custom Category
                  </label>
                  <select
                    value={filters.customCategory}
                    onChange={(e) => handleFilterChange('customCategory', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Custom Categories</option>
                    {customCategories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {(filters.category || filters.customCategory) && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-600 flex items-center flex-wrap gap-2">
                  <span className="font-medium">Active filters:</span>
                  {filters.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Category: {getCategoryNameById(filters.category)}
                    </span>
                  )}
                  {filters.customCategory && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      Custom: {filters.customCategory}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Jobs Table - with horizontal scroll */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Sr. No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Job ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading jobs...</span>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8">
                    <p className="text-gray-500 mb-2">No jobs found</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Post your first job
                    </button>
                  </td>
                </tr>
              ) : (
                jobs.map((job, index) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {job._id.slice(-8).toUpperCase()}
                        </span>
                        <button
                          onClick={() => copyJobLink(job._id)}
                          className={`p-1.5 rounded transition-colors ${
                            copiedId === job._id
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                          }`}
                          title="Copy job link"
                        >
                          <FiCopy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(job)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-left flex items-center gap-1"
                      >
                        {job.title.length > 30 ? job.title.substring(0, 30) + '...' : job.title}
                        <FiEye className="ml-1 text-gray-400" size={14} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{job.companyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleCategoryClick(job.category?._id)}
                        className={`px-2 py-1 rounded-md text-sm transition-colors ${
                          job.category?.name === 'Others'
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {job.category?.name === 'Others' ? (
                          <>
                            {job.category.name}
                            {job.customCategory && (
                              <span className="ml-1 text-xs font-normal">
                                ({job.customCategory.length > 10 ? job.customCategory.substring(0, 10) + '...' : job.customCategory})
                              </span>
                            )}
                          </>
                        ) : (
                          job.category?.name
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{job.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                        {job.employmentType || 'Full Time'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          job.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'closed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyJobLink(job._id)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="Copy job link"
                        >
                          <FiLink size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(job)}
                          className="p-2 bg-gray-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                          title="Edit job"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-2 bg-gray-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete job"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJobForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
              <button
                onClick={() => setSelectedJobForDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {/* Job ID and Link Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Job ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 break-all">{selectedJobForDetails._id}</p>
                </div>
                <button
                  onClick={() => copyJobLink(selectedJobForDetails._id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors whitespace-nowrap"
                >
                  <FiCopy className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Copy Job Link</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 break-all">
                Link: {getBaseUrl()}/job/{selectedJobForDetails._id}
              </p>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Job Title</label>
                  <p className="text-gray-900 font-semibold">{selectedJobForDetails.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-gray-900">{selectedJobForDetails.companyName}</p>
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-900">
                    {selectedJobForDetails.category?.name === 'Others' ? (
                      <>
                        {selectedJobForDetails.category.name}
                        {selectedJobForDetails.customCategory && (
                          <span className="ml-1 text-gray-600">
                            ({selectedJobForDetails.customCategory})
                          </span>
                        )}
                      </>
                    ) : (
                      selectedJobForDetails.category?.name
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">{selectedJobForDetails.location}</p>
                </div>
              </div>

              {/* Experience & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience</label>
                  <p className="text-gray-900">{selectedJobForDetails.experience}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Salary</label>
                  <p className="text-gray-900">{selectedJobForDetails.salary}</p>
                </div>
              </div>

              {/* Role & Industry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-gray-900">{selectedJobForDetails.role || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Industry</label>
                  <p className="text-gray-900">{selectedJobForDetails.industryType || 'N/A'}</p>
                </div>
              </div>

              {/* Department & Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{selectedJobForDetails.department || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employment Type</label>
                  <p className="text-gray-900">{selectedJobForDetails.employmentType || 'Full Time'}</p>
                </div>
              </div>

              {/* Application Email & Vacancies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Application Email</label>
                  <p className="text-gray-900 break-all">{selectedJobForDetails.applicationEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vacancies</label>
                  <p className="text-gray-900">{selectedJobForDetails.vacancies || 1}</p>
                </div>
              </div>

              {/* Key Skills */}
              <div>
                <label className="text-sm font-medium text-gray-500">Key Skills</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedJobForDetails.keySkills?.split(',').map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Qualifications */}
              {selectedJobForDetails.qualifications && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Qualifications</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                    {selectedJobForDetails.qualifications}
                  </p>
                </div>
              )}

              {/* Responsibilities */}
              {selectedJobForDetails.responsibilities && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Responsibilities</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                    {selectedJobForDetails.responsibilities}
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                  {selectedJobForDetails.description}
                </p>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedJobForDetails.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : selectedJobForDetails.status === 'closed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedJobForDetails.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Posted Date</label>
                  <p className="text-gray-900">{formatDate(selectedJobForDetails.postedDate)}</p>
                </div>
              </div>

              {/* Featured & Urgent */}
              <div className="flex flex-wrap gap-4">
                {selectedJobForDetails.featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    ⭐ Featured
                  </span>
                )}
                {selectedJobForDetails.urgent && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                    🔥 Urgent
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedJobForDetails(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingJob ? 'Edit Job' : 'Post New Job'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">No categories available. Please seed the database first.</p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Tech Corp"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">
                        {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                      </option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                          {category.name === 'Others' && ' (Enter custom name below)'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Fixed categories: {fixedCategories.join(', ')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mumbai, India"
                    />
                  </div>
                </div>

                {/* Custom Category Field for "Others" */}
                {isOthersSelected && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter custom category name"
                    />
                  </div>
                )}

                {/* Experience & Salary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 3-5 years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., ₹25,00,000 - ₹35,00,000"
                    />
                  </div>
                </div>

                {/* Role & Industry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Service Delivery Manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry Type
                    </label>
                    <input
                      type="text"
                      value={formData.industryType}
                      onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., IT Services & Consulting"
                    />
                  </div>
                </div>

                {/* Department & Employment Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Customer Success"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {employmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Application Email & Vacancies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.applicationEmail}
                      onChange={(e) => setFormData({ ...formData, applicationEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., careers@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vacancies
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.vacancies}
                      onChange={(e) => setFormData({ ...formData, vacancies: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Key Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Skills <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.keySkills}
                    onChange={(e) => setFormData({ ...formData, keySkills: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React, Node.js, MongoDB (comma separated)"
                  />
                </div>

                {/* Qualifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Educational and professional qualifications..."
                  />
                </div>

                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Key responsibilities of the role..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed job description..."
                  />
                </div>

                {/* Status & Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                      Featured Job
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="urgent"
                      checked={formData.urgent}
                      onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="urgent" className="text-sm font-medium text-gray-700">
                      Urgent Hiring
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    disabled={categories.length === 0}
                  >
                    {editingJob ? 'Update Job' : 'Post Job'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Jobs;