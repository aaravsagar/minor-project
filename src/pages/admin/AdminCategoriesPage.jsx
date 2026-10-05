import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { categoryService } from '../../services/categoryService';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/FormControls';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { Tag, PlusCircle, Edit, CheckCircle, XCircle } from 'lucide-react';

export const AdminCategoriesPage = () => {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const list = await categoryService.getCategories(true); // true = include inactive
      setCategories(list);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    try {
      setSaving(true);
      if (editingCat) {
        await categoryService.updateCategory(editingCat.id, {
          name: name.trim(),
          description: description.trim()
        });
        toast.success(`Category "${name}" updated successfully.`);
      } else {
        await categoryService.addCategory(name.trim(), description.trim());
        toast.success(`Category "${name}" added to Firestore.`);
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const newStatus = await categoryService.toggleCategoryStatus(cat.id, cat.isActive !== false);
      toast.success(`Category ${newStatus ? 'enabled' : 'disabled'}.`);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isActive: newStatus } : c));
    } catch (err) {
      toast.error('Failed to update category status.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading category directory from Firestore..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-description">
            Add and manage marketplace categories stored dynamically in Firebase Firestore.
          </p>
        </div>
        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={handleOpenCreate}
        >
          Add New Category
        </Button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Document ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const isActive = cat.isActive !== false;

                return (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1F2933', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Tag size={15} color="#2457A6" />
                        {cat.name}
                      </div>
                    </td>
                    <td style={{ color: '#4B5563' }}>{cat.description || '—'}</td>
                    <td>
                      <code style={{ fontSize: '11.5px', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>
                        {cat.id}
                      </code>
                    </td>
                    <td>
                      <Badge variant={isActive ? 'active' : 'danger'}>
                        {isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleOpenEdit(cat)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={isActive ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => handleToggleStatus(cat)}
                        >
                          {isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCat ? `Edit Category: ${editingCat.name}` : 'Create New Category'}
          maxWidth="460px"
        >
          <form onSubmit={handleSaveCategory}>
            <Input
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bicycles & Accessories"
              required
            />

            <Textarea
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of items in this category..."
              rows={3}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                {editingCat ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
