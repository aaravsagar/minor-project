import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { categoryService } from '../../services/categoryService';
import { reviewService } from '../../services/reviewService';
import { formatDate } from '../../utils/formatters';
import { Input } from '../../components/common/FormControls';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { RatingStars } from '../../components/common/RatingStars';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Store, 
  Save, 
  ArrowRightLeft, 
  Star, 
  CheckSquare, 
  Square,
  MessageSquareQuote
} from 'lucide-react';

export const SellerProfilePage = () => {
  const { currentUser, userProfile, refreshProfile, switchRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [location, setLocation] = useState(userProfile?.location || 'Ahmedabad');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [selectedCats, setSelectedCats] = useState(userProfile?.categories || []);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trustStats, setTrustStats] = useState({ trustScore: 5.0, averageRating: 5.0, reviewCount: 0 });
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [cats, revs, stats] = await Promise.all([
          categoryService.getCategories(),
          currentUser?.uid ? reviewService.getSellerReviews(currentUser.uid) : [],
          currentUser?.uid ? reviewService.getSellerTrustScore(currentUser.uid) : { trustScore: 5.0, reviewCount: 0 }
        ]);
        setAvailableCategories(cats);
        setReviews(revs);
        setTrustStats(stats);
      } catch (err) {
        console.error('Error loading seller data:', err);
      }
    };
    loadProfileData();
  }, [currentUser]);

  const toggleCategory = (catId) => {
    setSelectedCats(prev => 
      prev.includes(catId) 
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      await userService.updateProfile(currentUser.uid, {
        name: name.trim(),
        location: location.trim(),
        phone: phone.trim(),
        categories: selectedCats
      });
      await refreshProfile();
      toast.success('Seller profile & business categories updated successfully.');
    } catch (err) {
      console.error('Error updating seller profile:', err);
      toast.error('Failed to update seller profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToBuyer = async () => {
    try {
      setSwitching(true);
      await switchRole('buyer');
      toast.success('Switched to Buyer Workspace!');
      navigate('/buyer');
    } catch (err) {
      toast.error('Could not switch role.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Seller Profile & Reputation</h1>
          <p className="page-description">
            Your public seller profile, business categories, and customer rating metrics computed directly from Firestore reviews.
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #E2E5E9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #E2E5E9' }}
              />
            ) : (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#EBF6EE',
                  color: '#287D3C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700
                }}
              >
                {(userProfile?.name || 'S')[0]}
              </div>
            )}

            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2933', margin: 0 }}>
                {userProfile?.name || currentUser?.displayName || 'Seller'}
              </h2>
              <div style={{ fontSize: '13px', color: '#667085', marginTop: '2px' }}>
                {currentUser?.email}
              </div>
              <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
                <Badge variant="seller">Verified Seller</Badge>
              </div>
            </div>
          </div>

          {/* Dynamic Trust Score Badge */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px 18px', borderRadius: '6px', border: '1px solid #E2E5E9', textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', fontWeight: 600 }}>
              Calculated Trust Score
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
              <RatingStars rating={trustStats.trustScore || 5} size={16} />
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1F2933' }}>
                {trustStats.trustScore ? Number(trustStats.trustScore).toFixed(1) : '5.0'} / 5.0
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#667085', marginTop: '2px' }}>
              Based on {trustStats.reviewCount || 0} customer reviews
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdate} style={{ marginTop: '20px' }}>
          <Input
            label="Seller / Business Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            hint="This name will appear on all your submitted pitches to buyers."
          />

          <div className="grid-2">
            <Input
              label="Location / Area in Ahmedabad"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98980 00000"
            />
          </div>

          {/* Category Specialization Checkboxes */}
          <div className="form-group">
            <label className="form-label">
              Specialized Product & Service Categories
            </label>
            <div className="form-hint" style={{ marginBottom: '10px' }}>
              Select the categories you supply. Demands matching these categories will be highlighted as "Good Match".
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {availableCategories.map((cat) => {
                const isChecked = selectedCats.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isChecked ? '#2457A6' : '#E2E5E9'}`,
                      backgroundColor: isChecked ? '#EBF2FC' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: isChecked ? '#2457A6' : '#4B5563',
                      fontWeight: isChecked ? 600 : 400
                    }}
                  >
                    {isChecked ? <CheckSquare size={16} color="#2457A6" /> : <Square size={16} color="#9AA5B1" />}
                    <span>{cat.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button type="submit" variant="primary" icon={Save} loading={loading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Customer Reviews Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Customer Reviews & Ratings</h3>
            <p className="card-subtitle">Verified feedback submitted by buyers after deal completion</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No buyer reviews yet"
            description="When buyers complete deals and submit ratings for your delivered goods, reviews will appear here."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E5E9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RatingStars rating={rev.rating} size={14} />
                    <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#1F2933' }}>
                      {rev.buyerName}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#667085' }}>
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workspace Switcher */}
      <div className="card" style={{ backgroundColor: '#F8FAFC' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: '#1F2933', margin: 0 }}>
              Switch Workspace
            </h4>
            <p style={{ fontSize: '12.5px', color: '#667085', margin: '3px 0 0 0' }}>
              Switch to the buyer workspace to post requirements and evaluate incoming pitches.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRightLeft}
            onClick={handleSwitchToBuyer}
            loading={switching}
          >
            Switch to Buyer Workspace
          </Button>
        </div>
      </div>
    </div>
  );
};
