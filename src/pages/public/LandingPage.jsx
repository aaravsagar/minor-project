import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import { requirementService } from '../../services/requirementService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  Zap,
  TrendingDown,
  ArrowRight,
  Star,
  Users,
  Package,
  MessageCircle,
  ChevronDown,
  Sparkles
} from 'lucide-react';

/* ─── Category emoji map ─────────────────────────────────── */
const CAT_EMOJI = {
  cat_electronics: '🎧', cat_mobiles: '📱', cat_laptops: '💻',
  cat_furniture: '🪑', cat_vehicles: '🚗', cat_appliances: '🏠',
  cat_fashion: '👗', cat_books: '📚', cat_services: '🔧',
  cat_sports: '⚽', cat_groceries: '🛒', cat_beauty: '💄',
  cat_toys: '🎮', cat_stationery: '📝'
};

/* ─── Animated counter hook ──────────────────────────────── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

/* ─── Stats ticker ───────────────────────────────────────── */
function StatBadge({ value, suffix = '', label }) {
  const count = useCountUp(value);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
        {count.toLocaleString('en-IN')}{suffix}
      </div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.72)', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

export const LandingPage = () => {
  const { currentUser, userProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [realRequirements, setRealRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, reqs] = await Promise.all([
          categoryService.getCategories(),
          requirementService.getActiveRequirements({ sortBy: 'newest' })
        ]);
        setCategories(cats);
        // Exclusively real user postings (up to 6)
        setRealRequirements(reqs.slice(0, 6));
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePostRequirement = () => {
    if (!isAuthenticated) navigate('/login?tab=register');
    else if (userProfile?.role === 'buyer') navigate('/buyer/requirements/new');
    else if (userProfile?.role === 'seller') navigate('/seller/requirements');
    else navigate('/onboarding');
  };

  const handleBrowseNeeds = () => {
    if (!isAuthenticated) navigate('/login');
    else if (userProfile?.role === 'seller') navigate('/seller/requirements');
    else navigate('/buyer/requirements');
  };

  const handleViewRequirement = (req) => {
    if (!isAuthenticated) navigate('/login');
    else if (userProfile?.role === 'seller') navigate('/seller/requirements');
    else navigate('/buyer/requirements');
  };

  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════
          HERO — gradient background with floating shapes
      ══════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1e3a6e 55%, #2457A6 100%)',
        padding: '90px 24px 100px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,160,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,220,180,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.20)',
            borderRadius: '999px', padding: '6px 16px',
            fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)',
            marginBottom: '24px', backdropFilter: 'blur(8px)',
            letterSpacing: '0.3px', textTransform: 'uppercase'
          }}>
            <Sparkles size={13} style={{ color: '#60a5fa' }} />
            India's Reverse Marketplace
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 900, color: '#FFFFFF',
            lineHeight: 1.12, marginBottom: '20px',
            letterSpacing: '-1px'
          }}>
            Post what you need.{' '}
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Let sellers compete.
            </span>
          </h1>

          <p style={{
            fontSize: '17px', color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.65, maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Stop scrolling through endless listings. Describe exactly what you need, set your budget, and let qualified sellers bring their best offers directly to you.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              id="hero-post-requirement"
              onClick={handlePostRequirement}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#2563EB', color: '#FFFFFF',
                border: 'none', borderRadius: '10px',
                padding: '14px 28px', fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.45)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2563EB'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.45)'; }}
            >
              <PlusCircle size={18} />
              Post a Requirement
            </button>

            <button
              id="hero-browse-needs"
              onClick={handleBrowseNeeds}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.10)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '10px', padding: '14px 28px',
                fontSize: '15px', fontWeight: 600,
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Search size={18} />
              Browse Requirements
            </button>
          </div>

          {/* Scroll hint */}
          <div style={{ marginTop: '60px', color: 'rgba(255,255,255,0.35)', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <ChevronDown size={18} style={{ animation: 'bounce 2s infinite' }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(90deg, #1B4280 0%, #2457A6 100%)',
        padding: '36px 24px'
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '32px'
        }}>
          <StatBadge value={categories.length || 14} label="Product Categories" />
          <StatBadge value={realRequirements.length} suffix={realRequirements.length === 1 ? ' Need' : ' Needs'} label="Live Buyer Demands" />
          <StatBadge value={100} suffix="%" label="Real Buyer Posts" />
          <StatBadge value={0} suffix=" spam" label="Zero Middlemen" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '88px 24px' }} id="how-it-works">
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-block', backgroundColor: '#EBF2FC',
              color: '#2457A6', borderRadius: '999px',
              padding: '5px 16px', fontSize: '12px',
              fontWeight: 700, letterSpacing: '0.5px',
              textTransform: 'uppercase', marginBottom: '14px'
            }}>How It Works</div>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#1F2933', marginBottom: '10px', letterSpacing: '-0.5px' }}>
              Simple. Fast. Buyer-First.
            </h2>
            <p style={{ fontSize: '15px', color: '#667085', maxWidth: '520px', margin: '0 auto' }}>
              A reverse marketplace that puts you in control. Post once, get multiple competitive offers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { num: '01', icon: <PlusCircle size={22} color="#2457A6" />, title: 'Post Your Need', desc: 'Tell sellers what you\'re looking for — specifications, location, budget, and timeline.' },
              { num: '02', icon: <MessageCircle size={22} color="#287D3C" />, title: 'Receive Offers', desc: 'Qualified sellers in your area respond with price, condition, and delivery details.' },
              { num: '03', icon: <Star size={22} color="#A15C00" />, title: 'Compare & Score', desc: 'Our MCDM scoring ranks offers by price, delivery time, seller rating and more.' },
              { num: '04', icon: <CheckCircle2 size={22} color="#2457A6" />, title: 'Accept & Connect', desc: 'Choose the best offer and communicate directly via secure real-time messaging.' }
            ].map((step, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredCard(`step-${i}`)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: `1px solid ${hoveredCard === `step-${i}` ? '#BCD0EE' : '#E2E5E9'}`,
                  padding: '28px 24px',
                  boxShadow: hoveredCard === `step-${i}`
                    ? '0 8px 32px rgba(36,87,166,0.12)'
                    : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.25s ease',
                  transform: hoveredCard === `step-${i}` ? 'translateY(-4px)' : 'translateY(0)',
                  cursor: 'default'
                }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '44px', height: '44px', borderRadius: '12px',
                  backgroundColor: '#F0F5FF', marginBottom: '16px'
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA5B1', marginBottom: '6px', letterSpacing: '1px' }}>STEP {step.num}</div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#1F2933', marginBottom: '8px' }}>{step.title}</h4>
                <p style={{ fontSize: '13.5px', color: '#667085', lineHeight: 1.55, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VALUE PROPS (3-column)
      ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '88px 24px', borderTop: '1px solid #E2E5E9' }} id="about">
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-block', backgroundColor: '#EBF6EE',
              color: '#287D3C', borderRadius: '999px',
              padding: '5px 16px', fontSize: '12px',
              fontWeight: 700, letterSpacing: '0.5px',
              textTransform: 'uppercase', marginBottom: '14px'
            }}>Why Need Connect</div>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#1F2933', letterSpacing: '-0.5px' }}>
              Built for both sides of the deal
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
            {[
              {
                icon: <TrendingDown size={26} color="#2457A6" />,
                bg: '#EBF2FC', title: 'Buyers Save More',
                points: ['Set your own budget ceiling', 'Sellers compete for your business', 'Compare multiple offers side-by-side', 'No pressure, no cold calls']
              },
              {
                icon: <Zap size={26} color="#287D3C" />,
                bg: '#EBF6EE', title: 'Sellers Find Real Leads',
                points: ['Browse verified active demand', 'Pitch only to ready-to-buy buyers', 'No advertising costs', 'Build trust score with reviews']
              },
              {
                icon: <ShieldCheck size={26} color="#A15C00" />,
                bg: '#FEF6EC', title: 'Safe & Transparent',
                points: ['Structured offer comparison', 'Seller trust scores & reviews', 'Secure in-app messaging', 'Category price limit enforcement']
              }
            ].map((col, i) => (
              <div key={i} style={{
                borderRadius: '16px',
                border: '1px solid #E2E5E9',
                padding: '32px 28px',
                backgroundColor: '#FAFAFA'
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  backgroundColor: col.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  {col.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2933', marginBottom: '16px' }}>{col.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.points.map((p, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px', color: '#4B5563' }}>
                      <CheckCircle2 size={15} color="#287D3C" style={{ marginTop: '2px', flexShrink: 0 }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CATEGORIES GRID
      ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '88px 24px', borderTop: '1px solid #E2E5E9' }} id="categories">
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-block', backgroundColor: '#F0F5FF',
              color: '#2457A6', borderRadius: '999px',
              padding: '5px 16px', fontSize: '12px',
              fontWeight: 700, letterSpacing: '0.5px',
              textTransform: 'uppercase', marginBottom: '14px'
            }}>Categories</div>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#1F2933', letterSpacing: '-0.5px' }}>
              Shop smarter across every category
            </h2>
            <p style={{ fontSize: '15px', color: '#667085', marginTop: '10px' }}>
              From gadgets to groceries — post your need in any category.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ height: '88px', borderRadius: '12px', backgroundColor: '#E2E5E9', animation: 'pulse 1.4s ease infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCat(cat.id)}
                  onMouseLeave={() => setHoveredCat(null)}
                  onClick={handleBrowseNeeds}
                  style={{
                    backgroundColor: hoveredCat === cat.id ? '#2457A6' : '#FFFFFF',
                    border: `1px solid ${hoveredCat === cat.id ? '#2457A6' : '#E2E5E9'}`,
                    borderRadius: '12px',
                    padding: '18px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: hoveredCat === cat.id ? 'translateY(-3px)' : 'translateY(0)',
                    boxShadow: hoveredCat === cat.id ? '0 8px 24px rgba(36,87,166,0.2)' : '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>
                    {CAT_EMOJI[cat.id] || '📦'}
                  </div>
                  <div style={{
                    fontWeight: 600, fontSize: '13px',
                    color: hoveredCat === cat.id ? '#FFFFFF' : '#1F2933',
                    lineHeight: 1.3
                  }}>
                    {cat.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LIVE MARKETPLACE POSTINGS (real user postings only)
      ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '88px 24px', borderTop: '1px solid #E2E5E9' }} id="live-postings">
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#FEF6EC', color: '#A15C00',
                borderRadius: '999px', padding: '5px 16px',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px',
                textTransform: 'uppercase', marginBottom: '10px'
              }}>
                <Sparkles size={13} color="#A15C00" />
                Live Marketplace Feed
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1F2933', letterSpacing: '-0.5px' }}>
                Active Buyer Requirements
              </h2>
              <p style={{ fontSize: '14px', color: '#667085', marginTop: '6px' }}>
                Real-time buyer needs posted across categories. Only genuine buyer demand ready for seller offers.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                id="postings-browse-btn"
                onClick={handleBrowseNeeds}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: 'transparent',
                  color: '#2457A6', border: '1.5px solid #2457A6',
                  borderRadius: '8px', padding: '10px 18px',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2457A6'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2457A6'; }}
              >
                Browse All <ArrowRight size={15} />
              </button>
              <button
                id="postings-create-btn"
                onClick={handlePostRequirement}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: '#2563EB', color: '#FFFFFF',
                  border: 'none', borderRadius: '8px',
                  padding: '10px 18px', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2563EB'; }}
              >
                <PlusCircle size={15} />
                Post Need
              </button>
            </div>
          </div>

          {loading ? (
            /* Loading skeletons */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: '240px', borderRadius: '14px', backgroundColor: '#F1F5F9', animation: 'pulse 1.4s ease infinite' }} />
              ))}
            </div>
          ) : realRequirements.length > 0 ? (
            /* Real postings grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {realRequirements.map((req, i) => (
                <div
                  key={req.id}
                  onMouseEnter={() => setHoveredCard(`req-${i}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleViewRequirement(req)}
                  style={{
                    border: `1px solid ${hoveredCard === `req-${i}` ? '#BCD0EE' : '#E2E5E9'}`,
                    borderRadius: '14px',
                    padding: '24px',
                    backgroundColor: hoveredCard === `req-${i}` ? '#F7F9FF' : '#FAFAFA',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    boxShadow: hoveredCard === `req-${i}` ? '0 8px 28px rgba(36,87,166,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.25s ease',
                    transform: hoveredCard === `req-${i}` ? 'translateY(-3px)' : 'translateY(0)',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        backgroundColor: '#EBF6EE', color: '#287D3C',
                        borderRadius: '999px', padding: '3px 10px',
                        fontSize: '11px', fontWeight: 600
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#287D3C', display: 'inline-block' }} />
                        Active Request
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#9AA5B1' }}>
                        {formatDate(req.createdAt)}
                      </span>
                    </div>

                    {/* Category pill and urgency badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {req.categoryName && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          backgroundColor: '#F0F5FF', color: '#2457A6',
                          borderRadius: '6px', padding: '3px 8px',
                          fontSize: '11px', fontWeight: 600
                        }}>
                          <span>{CAT_EMOJI[req.categoryId] || '📦'}</span>
                          {req.categoryName}
                        </div>
                      )}
                      {req.urgency && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          backgroundColor: req.urgency === 'Immediate' ? '#FEF2F2' : '#F8FAFC',
                          color: req.urgency === 'Immediate' ? '#DC2626' : '#64748B',
                          border: `1px solid ${req.urgency === 'Immediate' ? '#FECACA' : '#E2E8F0'}`,
                          borderRadius: '6px', padding: '2px 7px',
                          fontSize: '10.5px', fontWeight: 600
                        }}>
                          <Clock size={10} />
                          {req.urgency}
                        </div>
                      )}
                      {req.quantity && req.quantity > 1 && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          backgroundColor: '#F3F4F6', color: '#374151',
                          borderRadius: '6px', padding: '2px 7px',
                          fontSize: '10.5px', fontWeight: 600
                        }}>
                          Qty: {req.quantity}
                        </div>
                      )}
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2933', marginBottom: '8px', lineHeight: 1.35 }}>
                      {req.title}
                    </h4>
                    <p style={{
                      fontSize: '13px', color: '#4B5563', marginBottom: '18px',
                      lineHeight: 1.5, display: '-webkit-box',
                      WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {req.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{ borderTop: '1px solid #E2E5E9', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#9AA5B1', marginBottom: '2px' }}>Budget Ceiling</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#2457A6' }}>
                          {formatCurrency(req.budget)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#9AA5B1', marginBottom: '2px' }}>Location</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                          <MapPin size={12} color="#667085" />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#4B5563' }}>{req.location || 'Pan-India'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                      <span style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageCircle size={13} color="#2457A6" />
                        {req.offerCount ? `${req.offerCount} ${req.offerCount === 1 ? 'offer' : 'offers'}` : 'Open for offers'}
                      </span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', fontWeight: 700, color: '#2457A6'
                      }}>
                        Submit Pitch <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Live Postings Board Empty State */
            <div style={{
              backgroundColor: '#FAFCFF',
              border: '1.5px dashed #CBD5E1',
              borderRadius: '18px',
              padding: '60px 24px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '18px',
                backgroundColor: '#EBF2FC', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', color: '#2457A6'
              }}>
                <Package size={30} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1F2933', marginBottom: '10px' }}>
                Real-Time Marketplace Feed is Active
              </h3>
              <p style={{ fontSize: '14.5px', color: '#64748B', maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                There are currently no active buyer postings in this window. As soon as buyers submit what they need, their verified requests will appear here live for competitive seller bidding.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <button
                  id="empty-state-post-req"
                  onClick={handlePostRequirement}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    backgroundColor: '#2563EB', color: '#FFFFFF',
                    border: 'none', borderRadius: '10px',
                    padding: '12px 24px', fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2563EB'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <PlusCircle size={17} />
                  Post the First Requirement
                </button>
                <button
                  onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    backgroundColor: '#FFFFFF', color: '#1F2933',
                    border: '1px solid #CBD5E1', borderRadius: '10px',
                    padding: '12px 22px', fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2457A6'; e.currentTarget.style.color = '#2457A6'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#1F2933'; }}
                >
                  Explore Categories
                </button>
              </div>

              {/* Trust micro-badges */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', paddingTop: '20px', borderTop: '1px solid #E2E8F0', maxWidth: '720px', margin: '0 auto' }}>
                <span style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#287D3C" /> 100% Verified Buyer Demand
                </span>
                <span style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#287D3C" /> Direct Seller Competition
                </span>
                <span style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#287D3C" /> MCDM Multi-Criteria Scoring
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1e3a6e 60%, #2457A6 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Ready to get better deals?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.70)', marginBottom: '36px', lineHeight: 1.6 }}>
            Join thousands of buyers who let sellers come to them. Create a free account and post your first requirement in under 60 seconds.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              id="cta-get-started"
              onClick={() => navigate('/login?tab=register')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#FFFFFF', color: '#1F2933',
                border: 'none', borderRadius: '10px',
                padding: '14px 28px', fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.30)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)'; }}
            >
              Get Started Free <ArrowRight size={17} />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'transparent', color: 'rgba(255,255,255,0.80)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '10px', padding: '14px 28px',
                fontSize: '15px', fontWeight: 600,
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer style={{
        backgroundColor: '#0F172A',
        padding: '36px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
              Need Connect
            </span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link to="/terms" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >Terms</Link>
              <Link to="/privacy" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >Privacy</Link>
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.30)' }}>
              © {new Date().getFullYear()} Need Connect. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
