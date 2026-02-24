import './App.css';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <div className="App">
          <Header/>
          </div>
        </AlertProvider>
      </AuthProvider>
    </Router>
    
  );
}

export default App;
