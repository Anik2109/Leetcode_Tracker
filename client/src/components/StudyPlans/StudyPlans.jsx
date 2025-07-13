import React,{useState,useEffect} from 'react';
import Plan from '../Plan/Plan';
import API from '../../api/axios';


export default function StudyPlans() {
    const [topics, setTopics] = useState([]);
    useEffect(() => {
        const fetchStudyPlans = async () => {
        try {
            const res = await API.get('/studyplan/');

            
            setTopics(res.data.statusCode.topics);
        } catch (error) {
            console.error('Failed to fetch study plans:', error);
        }
        };

        fetchStudyPlans();
    }, []);



  return (
    <div className="px-6 bg-[#0f0f1c] pb-25 pt-10">
      <div className="text-5xl text-white  font-bold mb-16">Study Plan</div>

      {topics.map((topic, index) => (
        <div key={index} className="mb-5">
          <Plan
            title={topic.title}
            questions={topic.questions} 
          />
        </div>
      ))}
    </div>
  );
};
