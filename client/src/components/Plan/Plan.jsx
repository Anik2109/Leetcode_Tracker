import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';

const ProgressBar = ({ percent }) => (
  <div className="mt-2 w-full bg-gray-900 rounded-full h-2">
    <div
      className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full"
      style={{ width: `${percent}%` }}
    />
  </div>
);

const Plan = ({ title, questions }) => {
  const [open, setOpen] = useState(false);

  const completed = questions.filter((q) => q.solved).length;
  const total = questions.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="mb-6 w-full max-w-6xl mx-auto bg-[#1a1b2e] border rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div
        className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 px-6 py-5 text-white cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="h-5 w-5 shrink-0 text-white rotate-180 transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 shrink-0 text-white rotate-0 transition-transform" />
          )}
          <span className="text-xl font-semibold">{title}</span>
        </div>

        {/* Stats & progress – stacked on mobile */}
        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 w-full xs:w-auto">
          <div className="text-sm text-gray-400 text-left xs:text-right">
            {completed} / {total} completed
          </div>
          <div className="w-full xs:w-32">
            <ProgressBar percent={percent} />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="pb-4 px-6 bg-[#1a1b2e]">
        <div className={`space-y-3 mt-4 transition-all duration-500 ease-in-out ${open ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          {questions.map((q, i) => (
            <a
              key={i}
              href={`https://leetcode.com/problems/${q.slug}/description/`}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-4 rounded-2xl transition duration-200 ${
                q.solved ? 'bg-[#1a1b2e]' : 'bg-[#1a1b2e]'
              } flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 shadow-md border border-white/10 hover:shadow-xl hover:bg-[#1c1d2f]`}
            >
              <div className="flex items-center gap-3">
                {q.solved ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-gray-500" />
                )}
                <span className="text-base font-medium text-white">{q.title}</span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  q.difficulty === 'Easy'
                    ? 'bg-green-800/30 text-green-300'
                    : q.difficulty === 'Medium'
                    ? 'bg-yellow-700/30 text-yellow-300'
                    : 'bg-red-800/30 text-red-400'
                }`}
              >
                {q.difficulty}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plan;