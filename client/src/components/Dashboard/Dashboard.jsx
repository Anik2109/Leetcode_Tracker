import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import API from "../../api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [nextContest, setNextContest] = useState(null);
  const navigate = useNavigate();

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      await API.post("/users/sync_daily");
      const res = await API.get("/users/stats");
      setStats(res.data.statusCode.stats);
    } catch (err) {
      console.error("Failed to sync:", err);
      alert("Failed to sync. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/users/stats");
        setStats(res.data.statusCode.stats);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0f0f1c] text-white space-y-4">
      {/* Bouncing dots */}
      <div className="flex space-x-3">
        <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-5 w-5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-5 w-5 bg-purple-500 rounded-full animate-bounce"></div>
      </div>

      {/* Funny DSA comment */}
      <p className="text-lg text-white">
        "Generating testcases... Verifying against hidden inputs... 🙃"
      </p>
    </div>
  );
}
  if (!stats) {
  return (
    <div className="min-h-screen bg-[#0f0f1c] text-white p-6 space-y-10">
      {/* Top Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-gradient-to-r from-[#1a1b2e] via-[#2b2b3e] to-[#1a1b2e] animate-[pulse_1.5s_ease-in-out_infinite]"
          ></div>
        ))}
      </div>

      {/* Progress + Difficulty Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Skeleton (Progress + Activity) */}
        <div className="bg-[#1a1b2e] border border-[#2b2b3e] rounded-xl p-6 space-y-8">
          <div className="flex gap-8">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#2b2b3e] via-[#3b3b4e] to-[#2b2b3e] animate-pulse"></div>
            <div className="flex flex-col gap-4 justify-center">
              <div className="h-6 w-40 bg-[#2b2b3e] rounded animate-pulse" />
              <div className="h-8 w-36 bg-[#2b2b3e] rounded animate-pulse" />
              <div className="h-4 w-48 bg-[#2b2b3e] rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-48 bg-[#2b2b3e] rounded animate-pulse" />
            <div className="flex space-x-6">
              {Array(7).fill(0).map((_, idx) => (
                <div key={idx} className="w-10 h-10 rounded-md bg-[#2b2b3e] animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Skeleton (Difficulty Cards) */}
        <div className="flex flex-col gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gradient-to-r from-[#1a1b2e] via-[#2b2b3e] to-[#1a1b2e] animate-[pulse_1.5s_ease-in-out_infinite]"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

  const totalSolved = stats.totalSolved || 0;
  const totalQuestions = 3611;

  const difficulties = [
    {
      label: "Easy",
      solved: stats.easySolved || 0,
      total: 885,
      color: "green",
      percent: Math.round((stats.easySolved / 885) * 100),
    },
    {
      label: "Medium",
      solved: stats.mediumSolved || 0,
      total: 1878,
      color: "orange",
      percent: Math.round((stats.mediumSolved / 1878) * 100),
    },
    {
      label: "Hard",
      solved: stats.hardSolved || 0,
      total: 848,
      color: "red",
      percent: Math.round((stats.hardSolved / 848) * 100),
    },
  ];

  const colorPalette = [
    "bg-slate-800 text-white",      // 0 - Inactive
    "bg-emerald-300 text-gray-900",       // 1
    "bg-emerald-400 text-gray-900",       // 2
    "bg-emerald-500 text-gray-900",       // 3
    "bg-emerald-600 text-white",       // 4
    "bg-emerald-700 text-white",       // 5
    "bg-emerald-800 text-white",       // 6–7
    "bg-emerald-900 text-white",       // 8–9
    "bg-green-800 text-white",         // 10–14
    "bg-green-900 text-white",         // 15–19
    "bg-lime-950 text-white",          // 20–24
    "bg-violet-500 text-white",        // 25+ (legendary)
  ];
  const getColorClass = (count) => {
    if (count === 0) return colorPalette[0];  // Inactive
    if (count === 1) return colorPalette[1];
    if (count === 2) return colorPalette[2];
    if (count === 3) return colorPalette[3];
    if (count === 4) return colorPalette[4];
    if (count === 5) return colorPalette[5];
    if (count <= 7) return colorPalette[6];
    if (count <= 9) return colorPalette[7];
    if (count <= 14) return colorPalette[8];
    if (count <= 19) return colorPalette[9];
    if (count <= 24) return colorPalette[10];
    return colorPalette[11]; // 25+
  };
  const getDuration = (start, end) => {
    const dur = dayjs(end).diff(dayjs(start), "minute");
    const hrs = Math.floor(dur / 60);
    const mins = dur % 60;
    return `${hrs ? `${hrs}h ` : ""}${mins}m`;
  };


  const activity = Object.values(stats.dailySolved);
  const lastSyncedRelative = dayjs(stats.lastSynced).fromNow();

  return (
    <div className="bg-[#0f0f1c] text-white p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl text-white font-bold tracking-tight">Analytics Dashboard</h1>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <p>Last refreshed: {lastSyncedRelative}</p>
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className={`text-blue-400 hover:underline hover:text-blue-300 transition ${syncing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {syncing ? "Syncing..." : "Sync now"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card title="This Week" value={`${stats.weekCount} problems solved`} icon="🗓️" />
        <Card title="Current Streak" value={`${stats.streak} days in a row`} icon="🔥" />

        {stats.nextContest ? (
          <div
            onClick={() => navigate("/contest")}
            className="bg-[#1a1b2e] hover:bg-[#23253b] transition border border-[#2b2b3e] rounded-xl p-5 shadow-sm flex flex-col cursor-pointer w-full"
          >
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-[#a0aec0] mb-1">Next Contest</p>

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-white text-base font-bold truncate">{stats.nextContest.name}</h2>
              <p className="text-xs text-gray-400">
                {dayjs(stats.nextContest.startTime).format("ddd, MMM D, hh:mm A")}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-white">{stats.nextContest.platform}</p>
              <p className="text-xs text-gray-400 font-medium">
                {getDuration(stats.nextContest.startTime, stats.nextContest.endTime)}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1b2e] border border-[#2b2b3e] rounded-xl p-5 shadow-sm w-full">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-sm text-[#a0aec0] mb-1">Next Contest</p>
            <p className="text-lg font-semibold text-white">No contests</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#1a1b2e] p-6 shadow-sm border border-[#2b2b3e] flex flex-col justify-between">
          <div className="flex items-center gap-8">
            <CircularProgress value={totalSolved} total={totalQuestions} />
            <div>
              <p className="text-2xl text-[#a0aec0]">Questions Solved</p>
              <p className="text-3xl font-bold">{totalSolved} / {totalQuestions}</p>
              <p className="text-md text-[#718096] mt-1">
                {totalQuestions - totalSolved} problems remaining
              </p>
            </div>
          </div>

          <div className="">
            <h2 className="font-semibold text-4xl text-[#cbd5e1] mb-7">Recent Activity</h2>
            <div className="flex space-x-6 mx-auto">
              {activity.map((count, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center rounded-md text-[12px] font-bold shadow transition-all duration-300 ease-in-out scale-100 hover:scale-105 ${getColorClass(count)} animate-fade-in`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {count}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {difficulties.map((item) => (
            <DifficultyCard key={item.label} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-[#1a1b2e] border border-[#2b2b3e] rounded-xl p-5 shadow-sm flex flex-col gap-2">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm text-[#a0aec0] mb-1">{title}</p>
      <p className="text-xl font-semibold text-white leading-snug mb-1">{value}</p>
    </div>
  );
}

function DifficultyCard({ label, solved, total, color, percent }) {
  const colorMap = {
    green: "bg-green-400",
    orange: "bg-orange-400",
    red: "bg-red-400",
  };
  const textColor = {
    green: "text-green-300",
    orange: "text-orange-300",
    red: "text-red-300",
  };
  const badgeBg = {
    green: "bg-green-900",
    orange: "bg-orange-900",
    red: "bg-red-900",
  };

  return (
    <div className="bg-[#1a1b2e] border border-[#2b2b3e] rounded-xl p-4 shadow-sm text-sm">
      <div className="flex justify-between items-center mb-1">
        <p className={`text-base font-semibold ${textColor[color]}`}>{label}</p>
        <span className={`text-sm px-2 py-0.5 rounded-full ${badgeBg[color]} ${textColor[color]}`}>{percent}%</span>
      </div>
      <p className="text-sm text-[#a0aec0] mb-1">Solved</p>
      <ProgressBar value={solved} total={total} color={colorMap[color]} />
      <p className="text-base text-[#718096] mt-1">{solved} / {total}</p>
    </div>
  );
}

function ProgressBar({ value, total, color = "bg-blue-500" }) {
  const percent = (value / total) * 100;
  return (
    <div className="w-full h-2.5 bg-[#2b2b3e] rounded-full">
      <div
        className={`${color} h-full rounded-full transition-all duration-300`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function CircularProgress({ value, total }) {
  const radius = 70;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const percent = (value / total) * 100;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-36 h-36">
      <svg height="100%" width="100%">
        <circle
          stroke="#25263d"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="50%"
          cy="50%"
        />
        <circle
          stroke="#3b82f6"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx="50%"
          cy="50%"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}