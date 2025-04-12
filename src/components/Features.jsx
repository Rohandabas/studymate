import React from 'react';
import { Brain, Youtube, BookOpen, Layout } from 'lucide-react';

function Features() {
  const features = [
    {
      icon: <Youtube className="h-6 w-6 text-purple-500" />,
      title: "Smart Playlist Comparison",
      description: "Compare multiple YouTube playlists to find the best learning resources for your needs."
    },
    {
      icon: <Brain className="h-6 w-6 text-purple-500" />,
      title: "AI-Generated Summaries",
      description: "Get instant summaries, key points, and timestamps from any educational video."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      title: "Interactive Learning",
      description: "Access AI-generated quizzes, flashcards, and study materials based on video content."
    },
    {
      icon: <Layout className="h-6 w-6 text-purple-500" />,
      title: "Personalized Study Plans",
      description: "Create customized learning paths combining the best content from different sources."
    }
  ];

  return (
    <div className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Features that Enhance Your Learning
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Everything you need to master any subject efficiently
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="absolute -top-4 left-4 bg-gray-900 p-3 rounded-lg">
                {feature.icon}
              </div>
              <h3 className="mt-8 text-lg font-medium text-white">{feature.title}</h3>
              <p className="mt-2 text-base text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Features;