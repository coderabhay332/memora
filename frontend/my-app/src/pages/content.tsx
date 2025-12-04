import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentViewer from '../components/ContentViewer';

const ContentRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return null;
  }

  return (
    <ContentViewer
      contentId={id}
      onClose={() => navigate(-1)}
    />
  );
};

export default ContentRoute;


