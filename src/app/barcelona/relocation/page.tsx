'use client';

import React, { useState } from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Phone,
  Calendar,
  FileText,
  MapPin,
} from 'lucide-react';

interface Task {
  id: string;
  task: string;
  status: 'completed' | 'in_progress' | 'urgent' | 'pending';
  deadline?: string;
  notes?: string;
  link?: string;
  contact?: string;
  location?: string;
}

interface Section {
  title: string;
  emoji: string;
  tasks: Task[];
}

const initialSections: Section[] = [
  {
    title: 'Completed',
    emoji: '✅',
    tasks: [
      { id: '1', task: 'NIE obtained', status: 'completed', notes: 'Via Illay Legal' },
      { id: '2', task: 'Bank account opened', status: 'completed', notes: 'Santander' },
      { id: '3', task: 'Sanitas insurance signed', status: 'completed', notes: '€310/month, humans + pets' },
      { id: '4', task: 'Padrón appointment booked', status: 'completed', deadline: '2026-02-11', location: 'OAC Monumental, C. Sicilia 216' },
      { id: '5', task: 'Driver license research complete', status: 'completed', notes: 'Bilateral agreement confirmed' },
      { id: '6', task: '3 expat Facebook groups joined', status: 'completed' },
      { id: '7', task: 'Orange Spanish SIMs acquired', status: 'completed' },
    ],
  },
  {
    title: 'Critical This Week',
    emoji: '🔴',
    tasks: [
      { id: '8', task: 'Empadronamiento (Padrón)', status: 'in_progress', deadline: '2026-02-11', location: 'OAC Monumental' },
      { id: '9', task: 'DGT driver license verification', status: 'urgent', notes: 'START TODAY', link: 'https://sede.dgt.gob.es' },
      { id: '10', task: 'TIE application', status: 'pending', notes: 'After Padrón' },
      { id: '11', task: 'Update phone to Spanish number', status: 'pending', deadline: 'This week' },
    ],
  },
  {
    title: 'First Month',
    emoji: '🟡',
    tasks: [
      { id: '12', task: 'TIE card application', status: 'pending', notes: 'After Padrón, fingerprint appointment' },
      { id: '13', task: 'Clave (digital ID)', status: 'pending', notes: 'CRITICAL for all online gov services' },
      { id: '14', task: 'CATSALUT registration', status: 'pending', notes: 'Public health, get TSI card', link: 'https://catsalut.gencat.cat' },
      { id: '15', task: 'Driver license exchange', status: 'pending', notes: 'After TIE received (March/April)' },
      { id: '16', task: 'Social Security number', status: 'pending', notes: 'If self-employed' },
    ],
  },
  {
    title: 'First 6 Months',
    emoji: '🟢',
    tasks: [
      { id: '17', task: 'Beckham Law application', status: 'pending', deadline: '2026-07-16', notes: 'CRITICAL - €500K+ impact' },
      { id: '18', task: 'Find permanent apartment', status: 'pending', notes: 'Month 2-3' },
      { id: '19', task: 'Spanish language basics', status: 'pending', notes: 'Post-marathon' },
    ],
  },
  {
    title: 'Driver License Process',
    emoji: '🚗',
    tasks: [
      { id: '20', task: 'Phase 1: DGT online verification', status: 'urgent', notes: 'sede.dgt.gob.es → Cita Previa → Canjes → Turkey', link: 'https://sede.dgt.gob.es' },
      { id: '21', task: 'Phase 2: TIE application (after Feb 11)', status: 'pending', notes: 'Monitor DGT status ("Contestado" = ready)' },
      { id: '22', task: 'Phase 3: Book DGT appointment', status: 'pending', notes: 'After TIE received' },
      { id: '23', task: 'Get medical certificate', status: 'pending', notes: '€40-50, valid 90 days' },
      { id: '24', task: 'Photo 32x26mm', status: 'pending' },
      { id: '25', task: 'Pay €28.87 fee', status: 'pending' },
    ],
  },
  {
    title: 'Pet Admin (Lobo & Zilli)',
    emoji: '🐕',
    tasks: [
      { id: '26', task: 'Municipal census registration', status: 'pending', notes: 'After Padrón' },
      { id: '27', task: 'Civil liability insurance', status: 'pending', notes: 'Check if in Sanitas' },
      { id: '28', task: 'Vet visit (Spanish cartilla)', status: 'pending', notes: 'After Sanitas active' },
      { id: '29', task: 'Confirm vaccinations', status: 'pending', notes: 'Especially rabies' },
      { id: '30', task: 'Get Lobo equipment', status: 'pending', notes: 'Tactical vest, muzzle, leashes, ID tag' },
    ],
  },
  {
    title: 'Family Setup (Derya)',
    emoji: '👧',
    tasks: [
      { id: '31', task: 'Scuola Italiana enrollment', status: 'completed' },
      { id: '32', task: 'Martial arts trial', status: 'in_progress', notes: 'Saturday scheduled' },
      { id: '33', task: 'Club Gimnàstic Barcelona', status: 'in_progress', notes: 'Email sent' },
      { id: '34', task: 'Gymnastics follow-up', status: 'pending', notes: 'If no response by Friday' },
      { id: '35', task: 'Vaccination card check', status: 'pending', notes: 'Ask Yasemin' },
    ],
  },
  {
    title: 'Expat Integration',
    emoji: '🌍',
    tasks: [
      { id: '36', task: 'Facebook groups', status: 'completed', notes: '3 joined' },
      { id: '37', task: 'Visit L\'Illa & Co / Lexington coworking', status: 'pending' },
      { id: '38', task: 'DiR/Metropolitan gym', status: 'pending' },
      { id: '39', task: 'Neighbor intro letters', status: 'pending', notes: 'Print 40 copies' },
      { id: '40', task: 'Neighbor chocolates', status: 'pending', notes: 'Buy Lindt Lindor' },
    ],
  },
];

export default function BarcelonaRelocationPage() {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Completed': false,
    'Critical This Week': true,
    'First Month': true,
    'First 6 Months': false,
    'Driver License Process': true,
    'Pet Admin (Lobo & Zilli)': false,
    'Family Setup (Derya)': false,
    'Expat Integration': false,
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleTask = (sectionIdx: number, taskId: string) => {
    setSections(prev => {
      const updated = [...prev];
      const task = updated[sectionIdx].tasks.find(t => t.id === taskId);
      if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
      }
      return updated;
    });
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded" />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">Done</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">In Progress</span>;
      case 'urgent':
        return <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700">URGENT</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">Pending</span>;
    }
  };

  const totalTasks = sections.reduce((sum, s) => sum + s.tasks.length, 0);
  const completedTasks = sections.reduce(
    (sum, s) => sum + s.tasks.filter(t => t.status === 'completed').length,
    0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏠 Barcelona Relocation Tracker
        </h1>
        <p className="text-gray-600">
          All administrative tasks for your family&apos;s move to Barcelona
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="font-semibold">
            {completedTasks} / {totalTasks} tasks ({Math.round((completedTasks / totalTasks) * 100)}%)
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
          />
        </div>
      </div>

      {/* Important Contacts */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <h3 className="font-semibold text-blue-900 mb-3">📞 Important Contacts</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-blue-600 font-medium">Emergency</div>
            <div>112 (General) | 088 (Mossos) | 061 (Medical)</div>
          </div>
          <div>
            <div className="text-blue-600 font-medium">Barcelona City</div>
            <div>010</div>
          </div>
          <div>
            <div className="text-blue-600 font-medium">DGT (Traffic)</div>
            <div>sede.dgt.gob.es</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, sectionIdx) => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.emoji}</span>
                <span className="font-semibold text-gray-900">{section.title}</span>
                <span className="text-sm text-gray-500">
                  ({section.tasks.filter(t => t.status === 'completed').length}/{section.tasks.length})
                </span>
              </div>
              {expandedSections[section.title] ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections[section.title] && (
              <div className="border-t border-gray-100 divide-y divide-gray-100">
                {section.tasks.map(task => (
                  <div
                    key={task.id}
                    className={`px-6 py-3 flex items-start gap-4 ${
                      task.status === 'urgent' ? 'bg-red-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(sectionIdx, task.id)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-medium ${
                            task.status === 'completed'
                              ? 'text-gray-400 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {task.task}
                        </span>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                        {task.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.deadline}
                          </span>
                        )}
                        {task.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {task.location}
                          </span>
                        )}
                        {task.notes && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {task.notes}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.link && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
