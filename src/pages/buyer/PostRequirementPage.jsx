import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { categoryService } from '../../services/categoryService';
import { requirementService } from '../../services/requirementService';
import { Input, Textarea, Select } from '../../components/common/FormControls';
import { Button } from '../../components/common/Button';
import { PlusCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { getCategoryLimits } from '../../config/categoryPriceLimits';

export const PostRequirementPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
    budget: '',
    location: userProfile?.location || 'Ahmedabad',
    urgency: 'Within 1 week',
    imageUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);

  const urgencyOptions = [
    { value: 'Immediate', label: 'Immediate (1-2 days)' },
    { value: 'Within 1 week', label: 'Within 1 week' },
    { value: 'Within 2 weeks', label: 'Within 2 weeks' },
    { value: 'This month', label: 'This month' }
  ];

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const list = await categoryService.getCategories();
        setCategories(list);
        if (list.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: list[0].id }));
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        toast.error('Failed to load categories.');
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Requirement title is required';
    if (!formData.categoryId) newErrors.categoryId = 'Please select a category';
    if (!formData.description.trim()) newErrors.description = 'Please provide specifications / details';
    
    const budgetNum = Number(formData.budget);
    if (!formData.budget || isNaN(budgetNum) || !Number.isFinite(budgetNum) || budgetNum <= 0) {
      newErrors.budget = 'Please enter a valid positive budget amount';
    } else if (formData.categoryId) {
      const limits = getCategoryLimits(formData.categoryId);
      if (budgetNum < limits.min) {
        newErrors.budget = `Budget is below the permitted minimum for ${limits.name} (minimum: ₹${limits.min.toLocaleString('en-IN')})`;
      } else if (budgetNum > limits.max) {
        newErrors.budget = `Budget exceeds the permitted maximum for ${limits.name} (maximum: ₹${limits.max.toLocaleString('en-IN')})`;
      }
    }

    if (!formData.location.trim()) newErrors.location = 'Location / city is required';
    if (!formData.urgency) newErrors.urgency = 'Please select your urgency timeline';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    const selectedCategory = categories.find(c => c.id === formData.categoryId);

    try {
      setLoading(true);
      await requirementService.createRequirement({
        buyerId: currentUser.uid,
        buyerName: userProfile?.name || currentUser.displayName || 'Buyer',
        buyerEmail: currentUser.email || '',
        title: formData.title,
        categoryId: formData.categoryId,
        categoryName: selectedCategory?.name || 'General',
        description: formData.description,
        budget: formData.budget,
        location: formData.location,
        urgency: formData.urgency,
        imageUrl: formData.imageUrl
      });

      toast.success('Your requirement has been posted! Sellers can now send you offers.');
      navigate('/buyer/requirements');
    } catch (err) {
      console.error('Error posting requirement:', err);
      toast.error('Unable to post requirement: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Post a Requirement</h1>
          <p className="page-description">
            Describe what product or service you are looking to purchase, and let local sellers pitch their best offers.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/buyer')}
        >
          Cancel
        </Button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <Input
            label="Requirement Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Looking for used iPhone 14 128GB"
            required
            error={errors.title}
            hint="Be specific about the model, brand, or type of item you need."
          />

          <div className="grid-2">
            <Select
              label="Category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              required
              disabled={loadingCats}
              error={errors.categoryId}
              placeholder="Select Category"
            />

            <Input
              label="Maximum Budget (in INR)"
              name="budget"
              type="number"
              prefix="₹"
              value={formData.budget}
              onChange={handleChange}
              placeholder="35000"
              required
              min="1"
              error={errors.budget}
              hint="The maximum amount you are willing to spend."
            />
          </div>

          <Textarea
            label="Specifications & Detailed Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe condition preferences, warranty needs, color preference, technical specifications, or packaging requirements..."
            required
            rows={4}
            error={errors.description}
          />

          <div className="grid-2">
            <Input
              label="Location / City"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Ahmedabad, Navrangpura"
              required
              error={errors.location}
            />

            <Select
              label="Urgency / Timeline"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              options={urgencyOptions}
              required
              error={errors.urgency}
            />
          </div>

          <Input
            label="Reference Image URL (Optional)"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/item-image.jpg"
            hint="Paste a direct image URL of the desired product if you have a reference picture."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid #E2E5E9', paddingTop: '16px' }}>
            <Button
              variant="secondary"
              onClick={() => navigate('/buyer')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={PlusCircle}
              loading={loading}
            >
              Publish Requirement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
