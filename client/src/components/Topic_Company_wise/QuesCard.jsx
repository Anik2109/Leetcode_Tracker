import { CheckCircle } from 'lucide-react';

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default function QuestionCard({ Qid, title, slug, difficulty, solved, topics = [], companyTags = [] }) {
  const difficultyClass =
    difficulty === 'Easy'
      ? 'bg-green-800/30 text-green-300'
      : difficulty === 'Medium'
      ? 'bg-yellow-700/30 text-yellow-300'
      : 'bg-red-800/30 text-red-400';

  return (
    <a
      href={`https://leetcode.com/problems/${slug}/description/`}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 rounded-2xl transition duration-200 bg-[#1a1b2e] flex flex-col gap-3 shadow-md border border-white/10 hover:shadow-xl hover:bg-[#1c1d2f]"
    >
      {/* Top row: Qid, icon, title, difficulty */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {solved ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <div className="h-5 w-5 rounded-full border border-gray-500" />
          )}
          <span className="text-base font-medium text-white">{Qid}. </span>
          <span className="text-base font-medium text-white truncate max-w-[200px] md:max-w-[400px]">
            {title}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${difficultyClass}`}>
          {difficulty}
        </div>
      </div>

      {/* Topics */}
      <div className="flex flex-col gap-1">
        {chunkArray(topics, 10).map((chunk, idx) => (
          <div key={`topics-row-${idx}`} className="flex flex-wrap gap-2">
            {chunk.map((topic, tIdx) => (
              <span
                key={`topic-${idx}-${tIdx}`}
                className="bg-[#2b2c3c] text-gray-300 text-xs px-2 py-1 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Company Tags */}
      <div className="flex flex-col gap-1">
        {chunkArray(companyTags, 8).map((chunk, idx) => (
          <div key={`company-row-${idx}`} className="flex flex-wrap gap-2">
            {chunk.map((company, cIdx) => (
              <span
                key={`company-${idx}-${cIdx}`}
                className="bg-[#3c2a4d] text-purple-300 text-xs px-2 py-1 rounded-full"
              >
                {company}
              </span>
            ))}
          </div>
        ))}
      </div>
    </a>
  );
}