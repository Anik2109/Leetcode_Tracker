import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import API from "../api/axios";

dayjs.extend(duration);

const ContestPage = () => {
  const [upcommingcontests, setUpcommingContests] = useState([]);
  const [awaitedcontests, setAwaitedContests] = useState([]);



  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await API.get("/contest/active");
        const upcomming = res.data?.statusCode?.upcomingContests || [];
        const awaited = res.data?.statusCode?.awaitedContests || [];
        setAwaitedContests(awaited);
        setUpcommingContests(upcomming);
      } catch (err) {
        console.error("Failed to fetch contests:", err);
      }
    };
    fetchContests();
  }, []);

  const formatDate = (iso) => dayjs(iso).format("MMM D, YYYY hh:mm A");
  const getDuration = (start, end) => {
    const dur = dayjs(end).diff(dayjs(start), "minute");
    const hrs = Math.floor(dur / 60);
    const mins = dur % 60;
    return `${hrs ? `${hrs}h ` : ""}${mins}m`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f1c] text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upcoming Contests</h1>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto rounded-lg border border-white/10 shadow-md">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#1a1b2e] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Start Time</th>
                <th className="px-4 py-3">End Time</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="bg-[#11121c] divide-y divide-gray-800">
              {upcommingcontests.map((c, i) => (
                <tr key={i} className="hover:bg-[#1f2233] transition">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {c.name}
                    </a>
                  </td>
                  <td className="px-4 py-3">{c.platform}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">{formatDate(c.startTime)}</td>
                  <td className="px-4 py-3">{formatDate(c.endTime)}</td>
                  <td className="px-4 py-3 text-white font-semibold">
                    {getDuration(c.startTime, c.endTime)}
                  </td>
                </tr>
              ))}
              {upcommingcontests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-400">
                    No upcoming contests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Table */}
        <div className="sm:hidden">
          <table className="min-w-full text-sm rounded-md overflow-hidden border border-white/10 shadow-md">
            <thead className="bg-[#1a1b2e] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Platform</th>
                <th className="px-2 py-2">Start</th>
                <th className="px-2 py-2">⏱</th>
              </tr>
            </thead>
            <tbody className="bg-[#11121c] divide-y divide-gray-800">
              {upcommingcontests.map((c, i) => (
                <tr
                  key={i}
                  onClick={() => window.open(c.link, "_blank")}
                  className="hover:bg-[#1f2233] transition cursor-pointer"
                >
                  <td className="px-2 py-2 text-center">{i + 1}</td>
                  <td className="px-2 py-2">{c.platform}</td>
                  <td className="px-2 py-2 text-xs whitespace-nowrap">
                    {dayjs(c.startTime).format("MMM D, hh:mm A")}
                  </td>
                  <td className="px-2 py-2 font-semibold">
                    {getDuration(c.startTime, c.endTime)}
                  </td>
                </tr>
              ))}
              {upcommingcontests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                    No upcoming contests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Completed Contests Section */}
        <h2 className="text-2xl font-bold mt-12 mb-4">Completed Contests</h2>

        {/* Desktop Card Layout */}
        <div className="hidden sm:grid grid-cols-2 gap-4">
          {awaitedcontests.map((contest, idx) => (
            <div
              key={idx}
              className="bg-[#1a1b2e] p-4 rounded-xl shadow-md border border-white/10 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">{contest.name}</h3>
                <span className="text-sm text-gray-400">{contest.platform}</span>
              </div>
              <p className="text-sm text-gray-300 mb-1">
                <span className="font-semibold text-white">Type:</span> {contest.type}
              </p>
              <p className="text-sm text-gray-300 mb-1">
                <span className="font-semibold text-white">Start:</span> {formatDate(contest.startTime)}
              </p>
              <p className="text-sm text-gray-300 mb-2">
                <span className="font-semibold text-white">Duration:</span> {getDuration(contest.startTime, contest.endTime)}
              </p>
              <a
                href={contest.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-blue-400 hover:underline"
              >
                View Contest →
              </a>
            </div>
          ))}
        </div>

        {/* Mobile Card Layout */}
        <div className="sm:hidden flex flex-col gap-4">
          {awaitedcontests.map((contest, idx) => (
            <div
              key={idx}
              className="bg-[#1a1b2e] p-4 rounded-xl shadow-md border border-white/10 hover:shadow-lg transition"
              onClick={() => window.open(contest.link, "_blank")}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-md font-semibold text-white">
                  {contest.name.length > 30
                    ? contest.name.slice(0, 28) + "..."
                    : contest.name}
                </h3>
                <span className="text-xs text-gray-400">{contest.platform}</span>
              </div>
              <p className="text-xs text-gray-300">
                <span className="font-medium text-white">⏱</span>{" "}
                {dayjs(contest.startTime).format("MMM D, hh:mm A")} ・{" "}
                {getDuration(contest.startTime, contest.endTime)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContestPage;