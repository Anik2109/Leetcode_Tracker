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

  const selectedCompany = searchParams.get('company') || 'Amazon';
  const statusFilter = searchParams.get('status') || null;
  const difficultyFilter = searchParams.get('difficulty') || null;

const companies = [
  "Amazon",
  "Adobe",
  "Google",
  "Apple",
  "Microsoft",
  "Facebook",
  "Bloomberg",
  "Uber",
  "Spotify",
  "Expedia",
  "Oracle",
  "Yahoo",
  "Zoho",
  "Visa",
  "Paypal",
  "Intel",
  "Salesforce",
  "Samsung",
  "Intuit",
  "Zillow",
  "Ebay",
  "Alibaba",
  "Affirm",
  "Huawei",
  "Morgan-stanley",
  "Ibm",
  "Linkedin",
  "Bytedance",
  "Lyft",
  "Snapchat",
  "Godaddy",
  "Tencent",
  "Wish",
  "Vmware",
  "Sap",
  "Yandex",
  "Twitter",
  "Audible",
  "Factset",
  "Tableau",
  "Groupon",
  "Citadel",
  "Goldman-sachs",
  "Twilio",
  "Cloudera",
  "Servicenow",
  "Indeed",
  "Didi",
  "Mathworks",
  "Jpmorgan",
  "Cisco",
  "Quora",
  "Yelp",
  "Nvidia",
  "Roblox",
  "Splunk",
  "Qualcomm",
  "Box",
  "Dropbox",
  "Blackrock",
  "Airbnb",
  "Redfin",
  "Flipkart",
  "Docusign",
  "Grab",
  "Capital-one",
  "Coupang",
  "Twitch",
  "Atlassian",
  "Two-sigma",
  "Zulily",
  "Houzz",
  "Nutanix",
  "Wayfair",
  "Pure-storage",
  "Appdynamics",
  "Barclays",
  "Coursera",
  "Databricks",
  "Palantir-technologies",
  "Pocket-gems",
  "Qualtrics",
  "Ixl",
  "Pinterest",
  "Tesla",
  "Citrix",
  "Doordash",
  "Square",
  "Akuna-capital",
  "Postmates",
  "Quip",
  "Netflix",
  "Liveramp",
  "Epic-systems",
  "Arista-networks",
  "Cruise-automation",
  "Cohesity",
  "Hulu",
  "Tripadvisor",
  "Reddit",
  "Electronic-arts",
  "Asana",
  "Robinhood"
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
        const company = selectedCompany;
        const status = statusFilter || 'null';
        const difficulty = difficultyFilter || 'null';
        const endpoint = `/companies/${company}/${status}/${difficulty}`;
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
          topics={companies}
          selectedTopic={selectedCompany}
          onSelect={(company) => setParam('company', company)}
        />
      </div>

      <div className="flex-1 mt-8">
        <h1 className="text-3xl pl-2 font-bold text-white mb-6">{selectedCompany}</h1>

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
          onSelect={(company) => setParam('company', company)}
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