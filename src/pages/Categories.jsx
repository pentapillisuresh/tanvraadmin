import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id, name) => {
    if (name === 'Others') {
      toast.error('Cannot delete the "Others" category');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      status: category.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      status: 'active',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  return (
    <Layout>
      {/* <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          Add Category
        </button>
      </div> */}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">NAME</th>
              <th className="table-header">SLUG</th>
              <th className="table-header">STATUS</th>
              <th className="table-header">CREATED DATE</th>
              <th className="table-header">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id}>
                  <td className="table-cell font-medium">{category.name}</td>
                  <td className="table-cell">{category.slug}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      category.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.status}
                    </span>
                  </td>
                  <td className="table-cell">{formatDate(category.createdDate)}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    {category.name !== 'Others' && (
                      <button
                        onClick={() => handleDelete(category._id, category.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Artificial Intelligence"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Categories;