// src/pages/Search.tsx
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search as SearchIcon,
  Building2,
  Users,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import {
  customerService,
  teamService,
  planService,
} from '../services/dataService';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(initialQuery);

  useEffect(() => {
    setInputVal(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(inputVal.trim() ? { q: inputVal.trim() } : {});
  };

  const query = (searchParams.get('q') || '').trim().toLowerCase();

  const allCustomers = useMemo(() => customerService.getAll(), []);
  const allTeam = useMemo(() => teamService.getAll(), []);
  const allPlans = useMemo(() => planService.getAll(), []);

  // Filtered entity matches
  const customerMatches = useMemo(() => {
    if (!query) return [];
    return allCustomers.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.contactPerson.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.industry.toLowerCase().includes(query) ||
      c.plan.toLowerCase().includes(query)
    );
  }, [allCustomers, query]);

  const teamMatches = useMemo(() => {
    if (!query) return [];
    return allTeam.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query) ||
      (u.department || '').toLowerCase().includes(query)
    );
  }, [allTeam, query]);

  const planMatches = useMemo(() => {
    if (!query) return [];
    return allPlans.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.features.some(f => f.toLowerCase().includes(query))
    );
  }, [allPlans, query]);

  const totalMatches = customerMatches.length + teamMatches.length + planMatches.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Global Directory Search
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Unified index across customer tenants, team members, and subscription tiers.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <SearchIcon className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Search organizations, emails, members, plans..."
          className="w-full pl-11 pr-24 py-3 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          className="absolute inset-y-1.5 right-1.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results or Empty States */}
      {!query ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          <SearchIcon className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Search Across Everything
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Type an organization name, team member, corporate email, or plan title above to instantly search local records.
          </p>
        </div>
      ) : totalMatches === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No matches found for &ldquo;{query}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Check the spelling or try searching for a broader keyword like &ldquo;tech&rdquo;, &ldquo;admin&rdquo;, or &ldquo;pro&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-xs font-medium text-slate-500">
            Found <strong className="text-slate-900 dark:text-white">{totalMatches}</strong> total results for &ldquo;{query}&rdquo;
          </div>

          {/* Customer Matches */}
          {customerMatches.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Customer Organizations ({customerMatches.length})
                  </h3>
                </div>
                <Link to="/app/customers" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  All Customers &rarr;
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {customerMatches.map(c => (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.contactPerson} • {c.email} • {c.industry}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {c.plan} ({c.seats} seats)
                      </span>
                      <Link
                        to={`/app/customers?q=${encodeURIComponent(c.name)}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View in Customer Management"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Matches */}
          {teamMatches.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Team Members ({teamMatches.length})
                  </h3>
                </div>
                <Link to="/app/team" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  All Team &rarr;
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {teamMatches.map(u => (
                  <div key={u.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {u.email} • {u.department || 'Operations'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {u.role}
                      </span>
                      <Link
                        to="/app/team"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plan Matches */}
          {planMatches.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Subscription Plans ({planMatches.length})
                  </h3>
                </div>
                <Link to="/app/plans" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  All Plans &rarr;
                </Link>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {planMatches.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {p.name} Plan
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        ${p.price}/mo
                      </span>
                      <Link
                        to="/app/plans"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
