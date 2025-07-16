// Topic.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// import { FixedSizeList as List } from 'react-window';
import Selector from '../components/Topic_Company_wise/Selector';
import FiltersAndSorting from '../components/Topic_Company_wise/FiltersAndSorting';
import ProgressBar from '../components/Topic_Company_wise/ProgressBar';
import QuestionCard from '../components/Topic_Company_wise/QuesCard';
import API from '../api/axios';

export default function Topic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  const selectedTopic = searchParams.get('topic') || 'Array';
  const statusFilter = searchParams.get('status') || null;
  const difficultyFilter = searchParams.get('difficulty') || null;

  const topics = [
        "Array",
        "Backtracking",
        "Binary Indexed Tree",
        "Binary Search",
        "Binary Search Tree",
        "Binary Tree",
        "Bit Manipulation",
        "Bitmask",
        "Biconnected Component",
        "Brainteaser",
        "Breadth-First Search",
        "Bucket Sort",
        "Combinatorics",
        "Concurrency",
        "Counting",
        "Counting Sort",
        "Database",
        "Data Stream",
        "Design",
        "Depth-First Search",
        "Divide and Conquer",
        "Doubly-Linked List",
        "Dynamic Programming",
        "Enumeration",
        "Eulerian Circuit",
        "Game Theory",
        "Geometry",
        "Graph",
        "Greedy",
        "Hash Function",
        "Hash Table",
        "Heap (Priority Queue)",
        "Interactive",
        "Iterator",
        "Line Sweep",
        "Linked List",
        "Math",
        "Matrix",
        "Memoization",
        "Merge Sort",
        "Minimum Spanning Tree",
        "Monotonic Queue",
        "Monotonic Stack",
        "Number Theory",
        "Ordered Set",
        "Prefix Sum",
        "Probability and Statistics",
        "Quickselect",
        "Queue",
        "Radix Sort",
        "Recursion",
        "Rejection Sampling",
        "Reservoir Sampling",
        "Rolling Hash",
        "Segment Tree",
        "Shell",
        "Shortest Path",
        "Simulation",
        "Sliding Window",
        "Sorting",
        "Stack",
        "String",
        "String Matching",
        "Strongly Connected Component",
        "Suffix Array",
        "Topological Sort",
        "Tree",
        "Trie",
        "Two Pointers",
        "Union Find"
    ];

  const setParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const topic = selectedTopic;
        const status = statusFilter || 'null';
        const difficulty = difficultyFilter || 'null';
        const endpoint = `/topics/${topic}/${status}/${difficulty}`;
        const res = await API.get(endpoint);
        
        setResponse(res.data.statusCode);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [searchParams]);

  if (loading || !response) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0f0f1c] text-white space-y-4">
        <div className="flex space-x-3">
          <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="h-5 w-5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="h-5 w-5 bg-purple-500 rounded-full animate-bounce" />
        </div>
        <p className="text-lg text-white">
          "Generating testcases... Verifying against hidden inputs... 🙃"
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0f0f1c] min-h-screen flex gap-6">
      <div className="w-64 shrink-0">
        <Selector
          topics={topics}
          selectedTopic={selectedTopic}
          onSelect={(topic) => setParam('topic', topic)}
        />
      </div>

      <div className="flex-1 mt-8">
        <h1 className="text-3xl pl-2 font-bold text-white mb-6">{selectedTopic}</h1>

        <ProgressBar
          topic="Progress"
          completed={response.solvedCount}
          total={response.total}
        />

        <FiltersAndSorting
          statusFilter={statusFilter}
          setStatusFilter={(status) => setParam('status', status)}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={(difficulty) => setParam('difficulty', difficulty)}
          onSelect={(topic) => setParam('topic', topic)}
        />

        <div className="mt-6 h-[70vh] overflow-y-auto flex flex-col gap-4">
          {response.questions.map((q) => (
            <QuestionCard
              key={q.Qid}
              Qid={q.Qid}
              title={q.title}
              slug={q.slug}
              difficulty={q.difficulty}
              solved={q.solved}
              topics={q.topics}
              companyTags={q.companyTags}
            />
          ))}
        </div>
      </div>
    </div>
  );
}