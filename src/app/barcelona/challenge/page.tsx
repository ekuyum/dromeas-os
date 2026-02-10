'use client';

import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Palette,
  Mountain,
  Plus,
  Trash2,
  Check,
  Star,
  Calendar,
  MapPin,
  X,
} from 'lucide-react';

interface ChallengeItem {
  id: string;
  name: string;
  date?: string;
  location?: string;
  rating?: number;
  notes?: string;
  completed: boolean;
}

interface Category {
  name: string;
  icon: React.ReactNode;
  target: number;
  color: string;
  items: ChallengeItem[];
}

// Initial data based on the master knowledge base
const initialCategories: Category[] = [
  {
    name: 'Restaurants',
    icon: <UtensilsCrossed className="w-6 h-6" />,
    target: 50,
    color: 'cyan',
    items: [],
  },
  {
    name: 'Cultural Activities',
    icon: <Palette className="w-6 h-6" />,
    target: 50,
    color: 'purple',
    items: [],
  },
  {
    name: 'Day Trips',
    icon: <Mountain className="w-6 h-6" />,
    target: 50,
    color: 'green',
    items: [],
  },
];

export default function BarcelonaChallengeChallengePage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ChallengeItem>>({});

  const addItem = () => {
    if (!newItem.name) return;

    const item: ChallengeItem = {
      id: Date.now().toString(),
      name: newItem.name,
      date: newItem.date,
      location: newItem.location,
      rating: newItem.rating,
      notes: newItem.notes,
      completed: true,
    };

    setCategories(prev => {
      const updated = [...prev];
      updated[activeCategory].items.push(item);
      return updated;
    });

    setNewItem({});
    setShowAddModal(false);
  };

  const removeItem = (itemId: string) => {
    setCategories(prev => {
      const updated = [...prev];
      updated[activeCategory].items = updated[activeCategory].items.filter(
        item => item.id !== itemId
      );
      return updated;
    });
  };

  const totalCompleted = categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );
  const totalTarget = categories.reduce((sum, cat) => sum + cat.target, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🗺️ 50-50-50 Barcelona Challenge
        </h1>
        <p className="text-gray-600">
          Experience Barcelona fully: 50 restaurants, 50 cultural activities, 50
          day trips
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm opacity-80">Total Progress</div>
            <div className="text-4xl font-bold">
              {totalCompleted} / {totalTarget}
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">
              {Math.round((totalCompleted / totalTarget) * 100)}%
            </div>
            <div className="text-sm opacity-80">Complete</div>
          </div>
        </div>
        <div className="h-4 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${(totalCompleted / totalTarget) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {categories.map((category, idx) => (
          <div
            key={category.name}
            onClick={() => setActiveCategory(idx)}
            className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
              activeCategory === idx
                ? `border-${category.color}-500 bg-${category.color}-50`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg ${
                  activeCategory === idx
                    ? `bg-${category.color}-100 text-${category.color}-600`
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {category.icon}
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {category.items.length}/{category.target}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {category.name}
            </h3>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  category.color === 'cyan'
                    ? 'bg-cyan-500'
                    : category.color === 'purple'
                    ? 'bg-purple-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${(category.items.length / category.target) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Active Category Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {categories[activeCategory].name}
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        {categories[activeCategory].items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p>No items yet. Start exploring Barcelona!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-indigo-600 hover:underline"
            >
              Add your first {categories[activeCategory].name.toLowerCase()}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories[activeCategory].items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {item.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                      )}
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      )}
                      {item.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {item.rating}/5
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="mt-8 bg-amber-50 rounded-xl p-6 border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">
          💡 Suggestions for {categories[activeCategory].name}
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {activeCategory === 0 && (
            <>
              <div className="text-sm text-amber-800">• La Boqueria Market - Famous food market</div>
              <div className="text-sm text-amber-800">• Can Culleretes - Oldest restaurant in Barcelona</div>
              <div className="text-sm text-amber-800">• Bar Cañete - Traditional tapas</div>
              <div className="text-sm text-amber-800">• Tickets Bar - Adrià brothers&apos; tapas bar</div>
            </>
          )}
          {activeCategory === 1 && (
            <>
              <div className="text-sm text-amber-800">• Sagrada Família - Gaudí&apos;s masterpiece</div>
              <div className="text-sm text-amber-800">• Picasso Museum - Extensive collection</div>
              <div className="text-sm text-amber-800">• Camp Nou Tour - FC Barcelona stadium</div>
              <div className="text-sm text-amber-800">• Palau de la Música Catalana - UNESCO site</div>
            </>
          )}
          {activeCategory === 2 && (
            <>
              <div className="text-sm text-amber-800">• Montserrat - Mountain monastery</div>
              <div className="text-sm text-amber-800">• Costa Brava - Beautiful coastline</div>
              <div className="text-sm text-amber-800">• Girona - Medieval city</div>
              <div className="text-sm text-amber-800">• Sitges - Beach town with charm</div>
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Add {categories[activeCategory].name.slice(0, -1)}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newItem.name || ''}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`e.g., ${
                    activeCategory === 0
                      ? 'La Boqueria'
                      : activeCategory === 1
                      ? 'Sagrada Família'
                      : 'Montserrat'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newItem.date || ''}
                  onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newItem.location || ''}
                  onChange={e =>
                    setNewItem({ ...newItem, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Gothic Quarter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setNewItem({ ...newItem, rating })}
                      className={`p-2 rounded-lg ${
                        newItem.rating === rating
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newItem.notes || ''}
                  onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  placeholder="Any thoughts or memories..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addItem}
                  disabled={!newItem.name}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
