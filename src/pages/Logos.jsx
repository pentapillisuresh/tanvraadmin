import React, { useState, useEffect } from 'react';
import { FiUpload, FiTrash2, FiImage, FiX, FiEdit2 } from 'react-icons/fi';
import Layout from '../components/Layout/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';

const Logos = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [logoName, setLogoName] = useState('');
  const [editingLogo, setEditingLogo] = useState(null);

  useEffect(() => {
    fetchLogos();
  }, []);

  // ✅ FETCH LOGOS FROM BACKEND
  const fetchLogos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/logos');
      setLogos(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch logos');
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMAGE SELECT
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max 5MB allowed');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Only images allowed');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setLogoName(file.name.split('.')[0]);
  };

  // ✅ UPLOAD LOGO
  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('logo', selectedImage);
      formData.append('name', logoName);

      await api.post('/logos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Logo uploaded');
      fetchLogos();
      closePopup();
    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
    }
  };

  // ✅ UPDATE LOGO
  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      if (selectedImage) {
        formData.append('logo', selectedImage);
      }
      formData.append('name', logoName);

      await api.put(`/logos/${editingLogo._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Logo updated');
      fetchLogos();
      closePopup();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this logo?')) return;

    try {
      await api.delete(`/logos/${id}`);
      toast.success('Deleted');
      fetchLogos();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleEdit = (logo) => {
    setEditingLogo(logo);
    setLogoName(logo.name);
    setPreviewUrl(logo.url);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedImage(null);
    setPreviewUrl('');
    setLogoName('');
    setEditingLogo(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading logos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Logos Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your company logos and brand assets. Upload, update, and organize your logos.
            </p>
          </div>
          <button
            onClick={() => setIsPopupOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <FiUpload className="mr-2" size={20} />
            Upload New Logo
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Logos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{logos.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FiImage className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Last Upload</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                {logos.length > 0 ? new Date(logos[0].createdAt).toLocaleDateString() : 'No uploads'}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <FiUpload className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Size</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                {logos.reduce((acc, logo) => acc + (logo.size || 0), 0) < 1024 
                  ? `${logos.reduce((acc, logo) => acc + (logo.size || 0), 0)} KB` 
                  : `${(logos.reduce((acc, logo) => acc + (logo.size || 0), 0) / 1024).toFixed(2)} MB`}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <FiImage className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Logos Grid */}
      {logos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {logos.map((logo) => (
            <div key={logo._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="h-48 bg-gray-100 flex items-center justify-center p-4 relative group">
                <img 
                  src={logo.url} 
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(logo)}
                    className="p-2 bg-white rounded-full mr-2 hover:bg-blue-50 transition-colors"
                  >
                    <FiEdit2 className="text-blue-600" size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(logo._id)}
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 className="text-red-600" size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{logo.name}</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    Uploaded: {new Date(logo.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-gray-400">
                    {logo.size < 1024 
                      ? `${logo.size} KB` 
                      : `${(logo.size / 1024).toFixed(2)} MB`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FiImage className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Logos Yet</h3>
          <p className="text-gray-600 mb-6">Get started by uploading your first logo</p>
          <button
            onClick={() => setIsPopupOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiUpload className="mr-2" />
            Upload Logo
          </button>
        </div>
      )}

      {/* Upload/Edit Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingLogo ? 'Edit Logo' : 'Upload New Logo'}
              </h2>
              <button
                onClick={closePopup}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Preview */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-48 mx-auto object-contain"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl('');
                      }}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer">
                    <FiImage className="text-gray-400 mb-2" size={40} />
                    <span className="text-sm text-gray-500">Click to select image</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
              </div>

              {/* Logo Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo Name <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={logoName}
                  onChange={(e) => setLogoName(e.target.value)}
                  placeholder="Enter logo name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Upload/Update Button */}
              <button
                onClick={editingLogo ? handleUpdate : handleUpload}
                disabled={!selectedImage && !editingLogo}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                  selectedImage || editingLogo
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {editingLogo ? 'Update Logo' : 'Upload Logo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Logos;