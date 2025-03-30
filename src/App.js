import logo from './logo.png';
import './App.css';

function App() {
  return (
    <div>
      <header style={{backgroundColor : '#996622', color : '#000', minHeight:"100vh", maxWidth:"100vw", padding:"20px", alignItems:"center", display:"flex", flexDirection:"column", }}>
        <img src={logo} className="" alt="logo" style={{maxWidth : 'calc(100% - 40px)'}}/>
        <h1>
          Visualise your internet footprint
        </h1>

        <h4>
          Coming soon...
        </h4>
      </header>
    </div>
  );
}

export default App;
