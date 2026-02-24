import './App.css';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;