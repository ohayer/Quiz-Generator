import { Routes, Route, useNavigate } from 'react-router-dom';
import { HomeView } from './features/workspaces/components/HomeView';
import { CreateWizard } from './features/documents/components/views/CreateWizard';
import { WorkspaceView } from './features/documents/components/views/WorkspaceView';
import './App.css';

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeView
            onCreateNew={() => navigate('/create')}
            onSelectWorkspace={(id) => navigate(`/workspace/${id}`)}
          />
        }
      />
      <Route path="/create" element={<CreateWizard />} />
      <Route path="/workspace/:id" element={<WorkspaceView />} />
    </Routes>
  );
}

export default App;
