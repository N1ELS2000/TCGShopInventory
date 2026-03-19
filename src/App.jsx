import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, X, Star, Package,
  Users, ClipboardList, LogIn, UserPlus, Shield, ChevronRight,
  CheckCircle, Clock, AlertCircle, Edit3, PlusCircle, Menu, XCircle
} from 'lucide-react';
import { mockOrders, mockPlayers as initialPlayers } from './data';
import { supabase } from './lib/supabase';

// ─── Playability Stars ───────────────────────────────────
function PlayabilityStars({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={i <= score ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

// ─── Type Badge Color ────────────────────────────────────
function typeBadge(type) {
  const map = {
    'Pokémon': 'bg-red-50 text-red-700 border-red-200',
    'Supporter': 'bg-violet-50 text-violet-700 border-violet-200',
    'Item': 'bg-sky-50 text-sky-700 border-sky-200',
    'Tool': 'bg-amber-50 text-amber-700 border-amber-200',
    'Stadium': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Energy': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };
  return map[type] || 'bg-gray-50 text-gray-700 border-gray-200';
}

// ─── Status Badge ────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  const icons = {
    'Pending': <Clock size={12} />,
    'Processing': <AlertCircle size={12} />,
    'Completed': <CheckCircle size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {icons[status]} {status}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState('landing');
  const [cart, setCart] = useState([]);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState(initialPlayers);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchCards() {
      try {
        // 1. Haal de kaarten op, inclusief de gekoppelde sets
        const { data, error } = await supabase
          .from('cards')
          .select(`
            id,
            name,
            type,
            stock,
            image_url,
            playability,
            card_sets (
              sets (
                name
              )
            )
          `);

        if (error) {
          console.error("Fout bij ophalen van kaarten:", error.message);
          return;
        }

        if (data) {
          // 2. Vorm de data om naar het formaat dat je React app verwacht
          const formattedCards = data.map(card => {
            // Haal de set-namen uit de geneste structuur
            const setNames = card.card_sets
              ? card.card_sets.map(cs => cs.sets.name)
              : [];

            return {
              id: card.id,
              name: card.name,
              type: card.type,
              stock: card.stock,
              imageUrl: card.image_url, // Zet snake_case om naar camelCase
              playability: card.playability,
              set: setNames // array van strings, bijv: ["Obsidian Flames", "Paldean Fates"]
            };
          });

          // 3. Sla de geformatteerde kaarten op in de state
          setCards(formattedCards);
        }
      } catch (err) {
        console.error("Onverwachte fout:", err);
      } finally {
        setIsLoading(false);
      }
    }
    async function fetchPlayers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) {
          console.error("Fout bij ophalen van spelers:", error.message);
          return;
        }

        if (data) {
          // Vorm de profiles om naar het formaat dat je app verwacht
          const formattedPlayers = data.map(profile => ({
            id: profile.id,
            // Voeg voor- en achternaam samen
            name: `${profile.first_name} ${profile.last_name}`.trim(),
            email: profile.email,
            // Jouw app verwacht 'Active' of 'Waitlist'
            status: profile.status
          }));

          setPlayers(formattedPlayers);
        }
      } catch (err) {
        console.error("Onverwachte fout bij spelers:", err);
      }
    }

    fetchCards();
    fetchPlayers()
  }, []);

  // Cart helpers
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  function addToCart(card) {
    setCart(prev => {
      const existing = prev.find(i => i.id === card.id);
      if (existing) {
        if (existing.qty >= 4) return prev;           // max 4 rule
        if (existing.qty >= card.stock) return prev;   // can't exceed stock
        return prev.map(i => i.id === card.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...card, qty: 1 }];
    });
  }

  function removeFromCart(cardId) {
    setCart(prev => {
      const existing = prev.find(i => i.id === cardId);
      if (existing && existing.qty > 1) {
        return prev.map(i => i.id === cardId ? { ...i, qty: i.qty - 1 } : i);
      }
      return prev.filter(i => i.id !== cardId);
    });
  }

  function removeAllFromCart(cardId) {
    setCart(prev => prev.filter(i => i.id !== cardId));
  }

  function getCartQty(cardId) {
    const item = cart.find(i => i.id === cardId);
    return item ? item.qty : 0;
  }

  // Accept a waitlist player
  function acceptPlayer(playerId) {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, status: 'accepted' } : p));
  }

  const navItems = [
    { key: 'landing', label: 'Landing' },
    { key: 'login', label: 'Login' },
    { key: 'register', label: 'Register' },
    { key: 'shop', label: 'Player Shop' },
    { key: 'cart', label: 'Cart' },
    { key: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      {/* ── NAVIGATION BAR ─────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => setView('landing')} className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                <Package size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight hidden sm:block">TCGShopInventory</span>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    view === item.key
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Cart icon + Mobile menu toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('cart')}
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-1 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setView(item.key); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    view === item.key
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── MAIN CONTENT ───────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'landing' && <LandingPage onNavigate={setView} />}
        {view === 'login' && <LoginPage onNavigate={setView} />}
        {view === 'register' && <RegisterPage />}
        {view === 'shop' && (
          <ShopView cards={cards} addToCart={addToCart} removeFromCart={removeFromCart} getCartQty={getCartQty} />
        )}
        {view === 'cart' && (
          <CartView cart={cart} removeFromCart={removeFromCart} removeAllFromCart={removeAllFromCart} addToCart={addToCart} onNavigate={setView} setCart={setCart} />
        )}
        {view === 'admin' && (
          <AdminDashboard cards={cards} setCards={setCards} players={players} acceptPlayer={acceptPlayer} />
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2026 TCGShopInventory — Van spelers, voor spelers</p>
          <p className="text-xs text-gray-400">Lokaal afhalen in Boom</p>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════
function LandingPage({ onNavigate }) {
  const rules = [
    { title: "Max 4 per kaart", desc: "Je mag maximaal 4 exemplaren van dezelfde kaart claimen — net als de officiële TCG-regels." },
    { title: "Alleen lokaal afhalen", desc: "Alle kaarten worden lokaal in Boom afgehaald. Geen verzending." },
    { title: "Van spelers, voor spelers", desc: "Alle kaarten zijn donaties van de community. Gratis claimen, gratis geven." },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="text-center pt-8 sm:pt-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-sm font-medium mb-6 border border-red-100">
          <Package size={14} /> Community Pokémon TCG Platform
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
          Claim kaarten.
          <br />
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Bouw je deck.
          </span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          TCGShopInventory is een community platform waar spelers kaarten doneren en claimen. Zoek wat je nodig hebt, voeg toe aan je lijst en haal lokaal af.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> Log In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> Registreer als Speler
          </button>
        </div>
      </div>

      {/* Community Rules */}
      <div>
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400 mb-8">Community Regels</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {rules.map((rule, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold text-lg mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{rule.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════
function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin(role) {
    alert(`[Mockup] Logging in as ${role} with ${email || '(no email)'}`);
    onNavigate(role === 'Admin' ? 'admin' : 'shop');
  }

  return (
    <div className="max-w-md mx-auto pt-8 sm:pt-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welkom terug</h1>
        <p className="text-gray-500 mt-2">Log in op je account</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jouw@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => handleLogin('Player')}
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={16} /> Log in als Speler
          </button>
          <button
            onClick={() => handleLogin('Admin')}
            className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Shield size={16} /> Log in als Admin
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REGISTER PAGE
// ═══════════════════════════════════════════════════════════
function RegisterPage() {
  const [isNew, setIsNew] = useState(true);

  function handleSubmit(e) {
    e.preventDefault();
    alert('[Mockup] Registration submitted!');
  }

  return (
    <div className="max-w-md mx-auto pt-8 sm:pt-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Account aanmaken</h1>
        <p className="text-gray-500 mt-2">Registreer om kaarten te kunnen claimen</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Voornaam</label>
            <input type="text" placeholder="Dennis" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Achternaam</label>
            <input type="text" placeholder="Mampaey" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" placeholder="bigboss@tcgshop.eu" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefoonnummer</label>
          <input type="tel" placeholder="+32 4XX XX XX XX" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
          <input type="password" placeholder="Min. 8 tekens" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm" />
        </div>

        {/* New Player Toggle */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">Nieuwe speler?</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsNew(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                isNew ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Ja, ik ben nieuw
            </button>
            <button
              type="button"
              onClick={() => setIsNew(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                !isNew ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Nee, bestaande speler
            </button>
          </div>
        </div>

        {/* Player ID (conditional) */}
        {!isNew && (
          <div className="animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Speler ID</label>
            <input type="text" placeholder="XXXXXXX" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm" />
          </div>
        )}

        <button
          type="submit"
          className="w-full mt-4 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          Registreer
        </button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PLAYER SHOP VIEW
// ═══════════════════════════════════════════════════════════
function ShopView({ cards, addToCart, removeFromCart, getCartQty }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterSet, setFilterSet] = useState('All');

  const allTypes = ['All', ...new Set(cards.map(c => c.type))];
  const allSets = ['All', ...new Set(cards.flatMap(c => c.set))];

  const filtered = useMemo(() => {
    return cards.filter(card => {
      const matchName = card.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'All' || card.type === filterType;
      const matchSet = filterSet === 'All' || card.set.includes(filterSet);
      return matchName && matchType && matchSet;
    });
  }, [cards, search, filterType, filterSet]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kaarten Inventaris</h1>
        <p className="text-gray-500 mt-1">Blader door beschikbare kaarten en voeg toe aan je lijst</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek op naam..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm bg-white"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm bg-white"
        >
          {allTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'Alle Types' : t}</option>)}
        </select>
        <select
          value={filterSet}
          onChange={e => setFilterSet(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm bg-white"
        >
          {allSets.map(s => <option key={s} value={s}>{s === 'All' ? 'Alle Sets' : s}</option>)}
        </select>
      </div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Geen kaarten gevonden</p>
          <p className="text-sm">Probeer een andere zoekopdracht of filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(card => {
            const inCartQty = getCartQty(card.id);
            const maxReached = inCartQty >= 4 || inCartQty >= card.stock;

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all group"
              >
                {/* Card Image */}
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  {/* Stock badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      card.stock === 0 ? 'bg-red-100 text-red-700' :
                      card.stock <= 3 ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {card.stock === 0 ? 'Uitverkocht' : `${card.stock} op voorraad`}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{card.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{card.set.join(' · ')}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${typeBadge(card.type)}`}>
                      {card.type}
                    </span>
                    <PlayabilityStars score={card.playability} />
                  </div>

                  {/* Add/Remove Cart Controls */}
                  {card.stock === 0 ? (
                    <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
                      Niet beschikbaar
                    </button>
                  ) : inCartQty === 0 ? (
                    <button
                      onClick={() => addToCart(card)}
                      className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus size={16} /> Toevoegen
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(card.id)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors shrink-0"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="flex-1 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold">
                        {inCartQty} in lijst
                      </div>
                      <button
                        onClick={() => addToCart(card)}
                        disabled={maxReached}
                        className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors shrink-0 ${
                          maxReached
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CART VIEW
// ═══════════════════════════════════════════════════════════
function CartView({ cart, removeFromCart, removeAllFromCart, addToCart, onNavigate, setCart }) {
  if (cart.length === 0) {
    return (
      <div className="text-center py-24">
        <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Je lijst is leeg</h2>
        <p className="text-gray-500 mb-8">Nog geen kaarten toegevoegd. Ga naar de inventaris om kaarten te claimen.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
        >
          Bekijk Inventaris <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mijn Lijst</h1>
        <p className="text-gray-500 mt-1">{totalItems} kaart{totalItems !== 1 ? 'en' : ''} geselecteerd</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
        {cart.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            {/* Thumbnail */}
            <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-contain p-1"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              <p className="text-xs text-gray-400">{item.type} · {item.set[0]}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.qty >= 4 || item.qty >= item.stock}
                  className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeAllFromCart(item.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Verwijder"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500">Totaal kaarten</span>
          <span className="text-xl font-bold">{totalItems}</span>
        </div>
        <button
          onClick={() => {
            alert(`[Mockup] Bestelling geplaatst! ${totalItems} kaarten aangevraagd.`);
            setCart([]);
          }}
          className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} /> Bestelling Bevestigen
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">Je wordt bericht wanneer je bestelling klaar is voor afhaling</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
function AdminDashboard({ cards, setCards, players, acceptPlayer }) {
  const [activeTab, setActiveTab] = useState('inventory');

  const pendingOrders = mockOrders.filter(o => o.status !== 'Completed').length;
  const waitlistPlayers = players.filter(p => p.status === 'waitlisted').length;

  const tabs = [
    { key: 'inventory', label: 'Inventaris', icon: Package },
    { key: 'players', label: 'Spelers', icon: Users },
    { key: 'orders', label: 'Bestellingen', icon: ClipboardList },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Beheer inventaris, spelers en bestellingen</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Totaal Kaarten', value: cards.reduce((s, c) => s + c.stock, 0), color: 'bg-blue-50 text-blue-600' },
          { label: 'Unieke Kaarten', value: cards.length, color: 'bg-violet-50 text-violet-600' },
          { label: 'Openstaande Bestellingen', value: pendingOrders, color: 'bg-amber-50 text-amber-600' },
          { label: 'Wachtlijst', value: waitlistPlayers, color: 'bg-red-50 text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' && <AdminInventory cards={cards} setCards={setCards} />}
      {activeTab === 'players' && <AdminPlayers players={players} acceptPlayer={acceptPlayer} />}
      {activeTab === 'orders' && <AdminOrders />}
    </div>
  );
}

// ── Admin: Inventory ─────────────────────────────────────
// ── Card Form Modal ─────────────────────────────────────
const CARD_TYPES = ['Pokémon', 'Supporter', 'Item', 'Tool', 'Stadium', 'Energy'];

const emptyForm = { name: '', set: '', type: 'Pokémon', stock: 0, imageUrl: '', playability: 3 };

function CardFormModal({ isOpen, onClose, onSave, initialData, title, saveLabel }) {
  const [form, setForm] = useState(emptyForm);

  // Sync form when modal opens or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      setForm(initialData
        ? { ...initialData, set: Array.isArray(initialData.set) ? initialData.set.join(', ') : initialData.set }
        : { ...emptyForm }
      );
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Vul een kaartnaam in.');
    const parsed = {
      ...form,
      set: form.set.split(',').map(s => s.trim()).filter(Boolean),
      stock: Math.max(0, Number(form.stock) || 0),
      playability: Math.min(5, Math.max(1, Number(form.playability) || 1)),
    };
    onSave(parsed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn">
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="bijv. Charizard ex"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Set (comma-separated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Set(s) <span className="text-gray-400 font-normal">— gescheiden door komma</span></label>
            <input
              type="text"
              value={form.set}
              onChange={e => handleChange('set', e.target.value)}
              placeholder="bijv. Obsidian Flames, Paldean Fates"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Type + Stock row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => handleChange('type', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
              >
                {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voorraad</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={e => handleChange('stock', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Afbeelding URL</label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={e => handleChange('imageUrl', e.target.value)}
              placeholder="https://images.pokemontcg.io/..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Playability — interactive stars */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Speelbaarheid</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleChange('playability', i)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    size={22}
                    className={`transition-colors ${
                      i <= (Number(form.playability) || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs text-gray-400 self-center">{form.playability}/5</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              {saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Admin: Inventory ─────────────────────────────────────
function AdminInventory({ cards, setCards }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null); // null = "add new" mode

  function openEdit(card) {
    setEditingCard(card);
    setModalOpen(true);
  }

  function openAdd() {
    setEditingCard(null);
    setModalOpen(true);
  }

  async function handleSave(formData) {
    try {
      let currentCardId = editingCard?.id;

      // 1. Bereid de kaart data voor (let op snake_case voor Supabase!)
      const cardPayload = {
        name: formData.name,
        type: formData.type,
        stock: Number(formData.stock),
        image_url: formData.imageUrl,
        playability: Number(formData.playability)
      };

      // --- DEEL A: KAART OPSLAAN ---
      if (editingCard) {
        // Update bestaande kaart
        const { error: updateError } = await supabase
          .from('cards')
          .update(cardPayload)
          .eq('id', currentCardId);

        if (updateError) throw updateError;
      } else {
        // Nieuwe kaart toevoegen
        const { data: newCard, error: insertError } = await supabase
          .from('cards')
          .insert([cardPayload])
          .select()
          .single(); // We hebben het gegenereerde ID nodig!

        if (insertError) throw insertError;
        currentCardId = newCard.id;
      }

      // --- DEEL B: SETS KOPPELEN ---
      // Verwijder eerst eventuele oude links als we aan het bewerken zijn
      if (editingCard) {
        await supabase.from('card_sets').delete().eq('card_id', currentCardId);
      }

      // formData.set is al een array (bijv. ['Obsidian Flames']), dankzij jouw CardFormModal!
      for (const setName of formData.set) {
        // Bestaat deze set al?
        let { data: existingSet } = await supabase
          .from('sets')
          .select('id')
          .eq('name', setName)
          .single();

        let setId;

        if (existingSet) {
          setId = existingSet.id; // Ja, gebruik bestaand ID
        } else {
          // Nee, maak een nieuwe set aan
          const { data: newSet, error: setError } = await supabase
            .from('sets')
            .insert([{ name: setName }])
            .select()
            .single();

          if (setError) throw setError;
          setId = newSet.id;
        }

        // Maak de link in de tussentabel
        const { error: linkError } = await supabase
          .from('card_sets')
          .insert([{ card_id: currentCardId, set_id: setId }]);

        if (linkError) throw linkError;
      }

      // --- DEEL C: LOKALE UI UPDATEN ---
      const newLocalCard = {
        id: currentCardId,
        name: formData.name,
        type: formData.type,
        stock: Number(formData.stock),
        imageUrl: formData.imageUrl,
        playability: Number(formData.playability),
        set: formData.set
      };

      if (editingCard) {
        setCards(prev => prev.map(c => c.id === currentCardId ? newLocalCard : c));
      } else {
        setCards(prev => [...prev, newLocalCard]);
      }

      // Sluit de modal af
      setModalOpen(false);
      setEditingCard(null);

    } catch (error) {
      console.error("Fout bij opslaan:", error);
      alert("Er ging iets mis bij het opslaan: " + error.message);
    }
  }

  function handleDelete(card) {
    if (confirm(`Weet je zeker dat je "${card.name}" wilt verwijderen?`)) {
      setCards(prev => prev.filter(c => c.id !== card.id));
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">{cards.length} kaarten</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-1.5"
        >
          <PlusCircle size={16} /> Kaart Toevoegen
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Kaart</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Set</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Speelbaarheid</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Voorraad</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cards.map(card => (
                <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img src={card.imageUrl} alt="" className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none'; }} />
                      </div>
                      <span className="font-semibold text-gray-900">{card.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${typeBadge(card.type)}`}>{card.type}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{card.set.join(', ')}</td>
                  <td className="py-3 px-4"><PlayabilityStars score={card.playability} /></td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-bold ${
                      card.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {card.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(card)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Bewerken"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(card)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Verwijderen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared modal for Edit / Add */}
      <CardFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCard(null); }}
        onSave={handleSave}
        initialData={editingCard}
        title={editingCard ? `Bewerk "${editingCard.name}"` : 'Nieuwe Kaart Toevoegen'}
        saveLabel={editingCard ? 'Opslaan' : 'Kaart Aanmaken'}
      />
    </div>
  );
}

// ── Admin: Players ───────────────────────────────────────
function AdminPlayers({ players, acceptPlayer }) {
  const waitlist = players.filter(p => p.status === 'waitlisted');
  const active = players.filter(p => p.status === 'accepted');

  return (
    <div className="space-y-8">
      {/* Waitlist */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock size={18} className="text-amber-500" /> Wachtlijst / Nieuwe Aanvragen
          {waitlist.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{waitlist.length}</span>
          )}
        </h2>
        {waitlist.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
            <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p>Geen openstaande aanvragen</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {waitlist.map(player => (
              <div key={player.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-gray-900">{player.name}</p>
                  <p className="text-xs text-gray-400">{player.email} · {player.id}</p>
                </div>
                <button
                  onClick={() => acceptPlayer(player.id)}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle size={14} /> Accepteren
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users size={18} className="text-emerald-500" /> Actieve Spelers
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">{active.length}</span>
        </h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {active.map(player => (
            <div key={player.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                  {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{player.name}</p>
                  <p className="text-xs text-gray-400">{player.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Actief
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Admin: Orders ────────────────────────────────────────
function AdminOrders() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">{mockOrders.length} bestellingen</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Speler</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Kaarten</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{order.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{order.user}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{order.items.join(', ')}</td>
                  <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
