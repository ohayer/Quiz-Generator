import { Routes, Route, useNavigate } from 'react-router-dom';
import { HomeView } from './features/workspaces';
import { CreateWizard, WorkspaceView } from './features/documents';
import './App.css';
import './index.css';

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
