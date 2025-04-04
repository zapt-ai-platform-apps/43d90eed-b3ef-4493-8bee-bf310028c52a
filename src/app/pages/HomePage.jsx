import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/shared/components/Layout';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import PathList from '@/modules/paths/ui/PathList';

const HomePage = () => {
  return (
    <Layout title="Path Recorder">
      <div className="space-y-6">
        <Card>
          <h1 className="text-2xl font-bold text-center mb-4">Path Recorder</h1>
          <p className="text-gray-600 text-center mb-6">
            Record and save your travel paths to navigate through them later
          </p>
          
          <Link to="/record" className="block">
            <Button className="w-full">Record New Path</Button>
          </Link>
        </Card>
        
        <PathList />
      </div>
    </Layout>
  );
};

export default HomePage;