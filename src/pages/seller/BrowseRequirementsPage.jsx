import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requirementService } from '../../services/requirementService';
import { categoryService } from '../../services/categoryService';
import { pitchService } from '../../services/pitchService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea, Select } from '../../components/common/FormControls';
import { ReportModal } from '../../components/common/ReportModal';
import { 
  Search, 
  Filter, 
  Send, 
  Clock, 
  MapPin, 
  Tag, 
  Sparkles, 
  Flag,
  DollarSign,
  CheckCircle2
} from 'lucide-react';

export const BrowseRequirementsPage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedReqId = searchParams.get('req');

  const { currentUser, userProfile } = useAuth();
  const toast = useToast();

  const [requirements, setRequirements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myPitches, setMyPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Submit Offer Modal
  const [submittingReq, setSubmittingReq] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [condition, setCondition] = useState('Good');
  const [description, setDescription] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('2 days');
  const [sellerNote, setSellerNote] = useState('');
  const [pitchLoading, setPitchLoading] = useState(false);

  // Report Modal
  const [reportingReq, setReportingReq] = useState(null);

  const conditionOptions = [
    { value: 'Brand New', label: 'Brand New (Sealed / Unused)' },
    { value: 'Like New', label: 'Like New (Minimal use, pristine)' },
    { value: 'Good', label: 'Good (Working, light cosmetics)' },
    { value: 'Refurbished', label: 'Refurbished / Certified Grade A' },
    { value: 'Fair', label: 'Fair / Functional with signs of wear' }
  ];

  const deliveryOptions = [
    { value: 'Immediate / Same day', label: 'Immediate / Same day pickup' },
    { value: '1 day', label: '1 day delivery' },
    { value: '2 days', label: '2 days' },
    { value: '3-5 days', label: '3-5 days' },
    { value: 'Within 1 week', label: 'Within 1 week' }
  ];

  const loadAll = async (overrideFilters = null) => {
    try {
      setLoading(true);
      const categoryToQuery = overrideFilters?.categoryId !== undefined ? overrideFilters.categoryId : selectedCat;
      const searchToQuery = overrideFilters?.search !== undefined ? overrideFilters.search : search;
      const locationToQuery = overrideFilters?.location !== undefined ? overrideFilters.location : locationFilter;
      const maxBudgetToQuery = overrideFilters?.maxBudget !== undefined ? overrideFilters.maxBudget : maxBudget;
      const sortByToQuery = overrideFilters?.sortBy !== undefined ? overrideFilters.sortBy : sortBy;

      const [reqList, catList, pitches] = await Promise.all([
        requirementService.getActiveRequirements({
          categoryId: categoryToQuery,
          search: searchToQuery,
          location: locationToQuery,
          maxBudget: maxBudgetToQuery,
          sortBy: sortByToQuery
        }),
        categoryService.getCategories(),
        currentUser?.uid ? pitchService.getSellerPitches(currentUser.uid) : []
      ]);

      setRequirements(reqList);
      setCategories(catList);
      setMyPitches(pitches);

      if (preSelectedReqId && reqList.length > 0) {
        const found = reqList.find(r => r.id === preSelectedReqId);
        if (found) setSubmittingReq(found);
      }
    } catch (err) {
      console.error('Error browsing requirements:', err);
      toast.error('Failed to load active requirements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [selectedCat, sortBy]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    loadAll();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCat('all');
    setLocationFilter('');
    setMaxBudget('');
    setSortBy('newest');
    loadAll({
      categoryId: 'all',
      search: '',
      location: '',
      maxBudget: '',
      sortBy: 'newest'
    });
  };

  const handleOpenPitchModal = (req) => {
    // Check if seller already pitched
    const alreadyPitched = myPitches.some(p => p.requirementId === req.id);
    if (alreadyPitched) {
      toast.warning('You have already submitted an offer for this requirement.');
      return;
    }

    setSubmittingReq(req);
    // Suggest slightly competitive price
    setOfferPrice(Math.round(Number(req.budget) * 0.95).toString());
    setDescription('');
    setSellerNote('');
    setCondition('Good');
    setDeliveryTime('2 days');
  };

  const handleSubmitPitch = async (e) => {
    e.preventDefault();
    if (!submittingReq) return;

    if (!offerPrice || Number(offerPrice) <= 0) {
      toast.error('Please enter a valid offer price.');
      return;
    }

    if (!description.trim()) {
      toast.error('Please describe your product/service offering.');
      return;
    }

    try {
      setPitchLoading(true);
      const newPitch = await pitchService.submitPitch({
        requirementId: submittingReq.id,
        buyerId: submittingReq.buyerId,
        sellerId: currentUser.uid,
        sellerName: userProfile?.name || currentUser.displayName || 'Seller',
        sellerEmail: currentUser.email || '',
        sellerPhone: userProfile?.phone || '',
        sellerLocation: userProfile?.location || 'Ahmedabad',
        offerPrice,
        description,
        condition,
        deliveryTime,
        sellerNote
      });

      toast.success('Your offer has been submitted! The buyer will compare it against other pitches.');
      setMyPitches(prev => [...prev, newPitch]);
      setSubmittingReq(null);
    } catch (err) {
      console.error('Error submitting pitch:', err);
      toast.error(err.message || 'Failed to submit offer.');
    } finally {
      setPitchLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Buyer Demands</h1>
          <p className="page-description">
            Discover real-time buyer needs in Ahmedabad and submit your competitive pitch.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleApplyFilter}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <Input
              placeholder="Search keyword (e.g. iPhone, laptop)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search size={15} />}
            />

            <Select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              options={[{ value: 'all', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
              placeholder=""
            />

            <Input
              placeholder="Location (e.g. Ahmedabad)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />

            <Input
              placeholder="Max Budget limit (₹)"
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'newest', label: 'Sort: Newest First' },
                { value: 'budget-high', label: 'Sort: Highest Budget' },
                { value: 'budget-low', label: 'Sort: Lowest Budget' },
                { value: 'urgency', label: 'Sort: Most Urgent' }
              ]}
              placeholder=""
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Filter}>
              Apply Filters
            </Button>
          </div>
        </form>
      </div>

      {/* Requirements List */}
      {loading ? (
        <LoadingSpinner text="Searching active requirements..." />
      ) : requirements.length === 0 ? (
        <EmptyState
          title="No matching buyer requirements found"
          description="Try broadening your search keywords or clearing the category/budget filters."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requirements.map((req) => {
            const hasPitched = myPitches.some(p => p.requirementId === req.id);
            // Seller category matching check
            const sellerCategories = userProfile?.categories || [];
            const isCategoryMatch = sellerCategories.includes(req.categoryId) || sellerCategories.length === 0;

            return (
              <div
                key={req.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E5E9',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Badge variant="active">Active Demand</Badge>
                      {isCategoryMatch && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 8px',
                          backgroundColor: '#EBF2FC',
                          color: '#2457A6',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          border: '1px solid #BCD0EE'
                        }}>
                          <Sparkles size={12} /> Good Match
                        </span>
                      )}
                      <span style={{ fontSize: '12.5px', color: '#667085' }}>
                        {req.categoryName}
                      </span>
                      <span style={{ fontSize: '12.5px', color: '#667085' }}>•</span>
                      <span style={{ fontSize: '12.5px', color: '#667085' }}>
                        Posted {formatDate(req.createdAt)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#1F2933', margin: 0 }}>
                      {req.title}
                    </h3>
                    <div style={{ fontSize: '12.5px', color: '#667085', marginTop: '2px' }}>
                      Posted by <strong>{req.buyerName}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', backgroundColor: '#F8FAFC', padding: '10px 16px', borderRadius: '6px', border: '1px solid #E2E5E9' }}>
                    <div style={{ fontSize: '11.5px', color: '#667085' }}>Buyer Max Budget</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#2457A6' }}>
                      {formatCurrency(req.budget)}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '13.5px', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
                  {req.description}
                </p>

                {req.imageUrl && (
                  <div style={{ marginTop: '4px' }}>
                    <img
                      src={req.imageUrl}
                      alt="Buyer requirement reference"
                      style={{ maxWidth: '160px', maxHeight: '110px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #E2E5E9' }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #F1F3F5',
                    paddingTop: '12px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: '#667085' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {req.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> Urgency: {req.urgency}
                    </span>
                    <span>
                      {req.offerCount || 0} competitors pitched
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Flag}
                      onClick={() => setReportingReq(req)}
                      title="Report inappropriate requirement"
                    >
                      Report
                    </Button>

                    {hasPitched ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#287D3C', fontWeight: 600, padding: '6px 10px' }}>
                        <CheckCircle2 size={16} /> Pitch Submitted
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Send}
                        onClick={() => handleOpenPitchModal(req)}
                      >
                        Submit Offer / Pitch
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Pitch Modal */}
      {submittingReq && (
        <Modal
          isOpen={!!submittingReq}
          onClose={() => setSubmittingReq(null)}
          title={`Submit Offer for: ${submittingReq.title}`}
          maxWidth="560px"
        >
          <form onSubmit={handleSubmitPitch}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', border: '1px solid #E2E5E9' }}>
              <div>Buyer Budget: <strong style={{ color: '#2457A6' }}>{formatCurrency(submittingReq.budget)}</strong></div>
              <div>Urgency: <strong>{submittingReq.urgency}</strong> • Location: <strong>{submittingReq.location}</strong></div>
            </div>

            <div className="grid-2">
              <Input
                label="Your Competitive Offer Price (in INR)"
                type="number"
                prefix="₹"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="32500"
                required
                min="1"
                hint={`Buyer budget is ${formatCurrency(submittingReq.budget)}`}
              />

              <Select
                label="Product / Item Condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                options={conditionOptions}
                required
              />
            </div>

            <Select
              label="Estimated Delivery / Handover Timeline"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              options={deliveryOptions}
              required
            />

            <Textarea
              label="Product Specifications & Condition Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. iPhone 14 128GB Starlight, 89% battery health, original box, charging cable and bill available..."
              required
              rows={3}
            />

            <Input
              label="Seller Guarantee / Shop Warranty Note (Optional)"
              value={sellerNote}
              onChange={(e) => setSellerNote(e.target.value)}
              placeholder="e.g. Includes 15 days shop testing warranty and free doorstep pickup."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Button variant="secondary" onClick={() => setSubmittingReq(null)} disabled={pitchLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Send} loading={pitchLoading}>
                Send Pitch to Buyer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Report Requirement Modal */}
      {reportingReq && (
        <ReportModal
          isOpen={!!reportingReq}
          onClose={() => setReportingReq(null)}
          targetId={reportingReq.id}
          targetType="requirement"
          targetTitleOrName={reportingReq.title}
        />
      )}
    </div>
  );
};
