import React from 'react';
import Layout from '@/shared/components/Layout';
import PathDetails from '@/modules/paths/ui/PathDetails';

const ViewPathPage = () => {
  return (
    <Layout title="Path Details" showBackButton>
      <PathDetails />
    </Layout>
  );
};

export default ViewPathPage;