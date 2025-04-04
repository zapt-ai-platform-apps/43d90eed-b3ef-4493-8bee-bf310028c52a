import React, { useState, useEffect } from 'react';
import { api as pathsApi } from '../api';
import Button from '@/shared/components/Button';
import { formatDistance, formatDuration } from '@/shared/utils/formatters';

const PathRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    distance: 0,
    duration: 0,
    pointCount: 0
  });
  
  useEffect(() => {
    const unsubscribeStatus = pathsApi.onRecordingStatusChange(({ isRecording }) => {
      setIsRecording(isRecording);
    });
    
    const unsubscribeStats = pathsApi.onRecordingStatsUpdated((newStats) => {
      setStats(newStats);
    });
    
    return () => {
      unsubscribeStatus();
      unsubscribeStats();
    };
  }, []);
  
  const handleStartRecording = () => {
    pathsApi.startRecording();
  };
  
  const handleStopRecording = async () => {
    setIsProcessing(true);
    try {
      await pathsApi.stopRecording();
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancelRecording = () => {
    if (window.confirm('Are you sure you want to cancel this recording? All data will be lost.')) {
      pathsApi.cancelRecording();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Path Recorder</h2>
        
        {isRecording ? (
          <div className="mb-4">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse"></div>
              <span className="text-red-500 font-medium">Recording</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded text-center">
                <div className="text-sm text-gray-500">Distance</div>
                <div className="font-semibold">{formatDistance(stats.distance)}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded text-center">
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-semibold">{formatDuration(stats.duration)}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded text-center">
                <div className="text-sm text-gray-500">Points</div>
                <div className="font-semibold">{stats.pointCount}</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="success"
                className="flex-1 cursor-pointer"
                onClick={handleStopRecording}
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : 'Stop & Save'}
              </Button>
              
              <Button
                variant="danger"
                className="flex-1 cursor-pointer"
                onClick={handleCancelRecording}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Click the button below to start recording your path. The app will track your location as you move.
            </p>
            
            <Button
              variant="primary"
              className="w-full cursor-pointer"
              onClick={handleStartRecording}
            >
              Start Recording
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PathRecorder;