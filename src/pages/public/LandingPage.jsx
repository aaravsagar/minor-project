import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import { requirementService } from '../../services/requirementService';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  PlusCircle, 
  Search, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Tag,
  ShieldCheck,
  Zap,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

export const LandingPage = () => {
  const { currentUser, userProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [sampleReqs, setSampleReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, reqs] = await Promise.all([
          categoryService.getCategories(),
          requirementService.getActiveRequirements({ sortBy: 'newest' })
        ]);
        setCategories(cats);
        setSampleReqs(reqs.slice(0, 3));
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePostRequirement = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (userProfile?.role === 'buyer') {
      navigate('/buyer/requirements/new');
    } else if (userProfile?.role === 'seller') {
      navigate('/seller/requirements');
    } else {
      navigate('/onboarding');
    }
  };

  const handleBrowseNeeds = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (userProfile?.role === 'seller') {
      navigate('/seller/requirements');
    } else {
      navigate('/buyer/requirements');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E5E9',
          padding: '68px 24px 76px',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: '38px',
              fontWeight: 800,
              color: '#1F2933',
              lineHeight: 1.22,
              marginBottom: '18px',
              letterSpacing: '-0.5px'
            }}
          >
            Post what you need. <br />
            <span style={{ color: '#2457A6' }}>Let sellers come to you.</span>
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#4B5563',
              lineHeight: 1.6,
              maxWidth: '660px',
              margin: '0 auto 32px'
            }}
          >
            Describe what you're looking for, receive relevant offers from sellers, compare your options, and choose the offer that works best for you.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              icon={PlusCircle}
              onClick={handlePostRequirement}
            >
              Post a Requirement
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={Search}
              onClick={handleBrowseNeeds}
            >
              Browse Requirements
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works 01 - 04 */}
      <section style={{ backgroundColor: '#F7F7F5', padding: '64px 24px' }} id="how-it-works">
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1F2933', marginBottom: '8px' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '14px', color: '#667085' }}>
              A straightforward reverse marketplace designed to save time and secure better deals.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '24px 20px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E5E9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#2457A6', marginBottom: '10px' }}>01</div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>Post Your Need</h4>
              <p style={{ fontSize: '13px', color: '#667085', lineHeight: 1.45, margin: 0 }}>
                Tell sellers exactly what you are looking for, including specifications, location, and your target budget.
              </p>
            </div>

            <div style={{ padding: '24px 20px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E5E9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#2457A6', marginBottom: '10px' }}>02</div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>Receive Offers</h4>
              <p style={{ fontSize: '13px', color: '#667085', lineHeight: 1.45, margin: 0 }}>
                Sellers respond directly with their price, product condition, and proposal delivery timeline.
              </p>
            </div>

            <div style={{ padding: '24px 20px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E5E9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#2457A6', marginBottom: '10px' }}>03</div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>Compare</h4>
              <p style={{ fontSize: '13px', color: '#667085', lineHeight: 1.45, margin: 0 }}>
                Compare prices, seller information, delivery details, and customer reviews side by side.
              </p>
            </div>

            <div style={{ padding: '24px 20px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E5E9', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#2457A6', marginBottom: '10px' }}>04</div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>Choose</h4>
              <p style={{ fontSize: '13px', color: '#667085', lineHeight: 1.45, margin: 0 }}>
                Accept the offer that works best for you and coordinate directly via real-time messaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Concept Section */}
      <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E5E9', borderBottom: '1px solid #E2E5E9', padding: '64px 24px' }} id="about">
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1F2933', marginBottom: '12px' }}>
            About Need Connect
          </h2>
          <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.6, marginBottom: '24px' }}>
            Need Connect is a reverse marketplace where buyers post what they need and sellers respond with relevant offers. Rather than browsing through expired listings or negotiating with dozens of sellers individually, buyers state their requirements and let motivated sellers compete for their business.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', textAlign: 'left', marginTop: '32px' }}>
            <div style={{ padding: '18px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E5E9' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>For Buyers</h4>
              <p style={{ fontSize: '13px', color: '#667085', lineHeight: 1.4, margin: 0 }}>
                Save time searching. State your exact budget and product condition, and receive tailored quotes directly.
              </p>
            </div>

            <div style={{ padding: '18px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E5E9' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>For Sellers</h4>
              <p style={{ fontSize: '13px', color: '#667085', lineHeight: 1.4, margin: 0 }}>
                Discover verified active demand in your area. Pitch competitive deals to customers ready to purchase.
              </p>
            </div>

            <div style={{ padding: '18px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E5E9' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>Direct Communication</h4>
              <p style={{ fontSize: '13px', color: '#667085', lineHeight: 1.4, margin: 0 }}>
                Connect through secure 1-to-1 messaging upon offer acceptance to organize delivery and handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '64px 24px', maxWidth: '1060px', margin: '0 auto' }} id="categories">
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1F2933', marginBottom: '4px' }}>
            Popular Categories
          </h2>
          <p style={{ fontSize: '13.5px', color: '#667085' }}>
            Explore demand across top product and service categories.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E5E9',
                borderRadius: '6px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1F2933' }}>
                {cat.name}
              </div>
              <div style={{ fontSize: '12px', color: '#667085', lineHeight: 1.35 }}>
                {cat.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Buyer Demands Section */}
      {sampleReqs.length > 0 && (
        <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E5E9', padding: '64px 24px' }}>
          <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1F2933', marginBottom: '4px' }}>
                  Recent Requirements
                </h2>
                <p style={{ fontSize: '13.5px', color: '#667085' }}>
                  Browse active requests posted by verified buyers.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleBrowseNeeds}>
                View All Demands
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
              {sampleReqs.map((req) => (
                <div
                  key={req.id}
                  style={{
                    border: '1px solid #E2E5E9',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#FAFAFA',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <Badge variant="active">Active</Badge>
                      <span style={{ fontSize: '12px', color: '#667085' }}>
                        {formatDate(req.createdAt)}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>
                      {req.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '14px', lineHeight: 1.45 }}>
                      {req.description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #E2E5E9', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#667085' }}>Buyer Budget</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#2457A6' }}>
                        {formatCurrency(req.budget)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#667085' }}>Location</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2933' }}>
                        {req.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
