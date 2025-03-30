import logo from './logo.png';
import './App.css';

function App() {
  return (
    <div>
<div style={{ height :'15px', width:'20px', alignItems:"center", display:"flex", flexDirection:"column", position:'absolute', top:'10px', left:'6px', justifyContent:'space-between'}}>
<div style={{backgroundColor : '#000', height :'1px', width:'100%'  }} />
<div style={{backgroundColor : '#000', height :'1px', width:'100%'  }} />
<div style={{backgroundColor : '#000', height :'1px', width:'100%'  }} />
</div>

      <header style={{backgroundColor : '#fff', color : '#000', minHeight:"100vh", maxWidth:"100vw", padding:"20px", alignItems:"center", display:"flex", flexDirection:"column", }}>

        <img src={logo} className="" alt="logo" style={{maxWidth : 'calc(100% - 40px)'}}/>

        <h1>
          Visualise your internet footprint
        </h1>
        <div style={{backgroundColor : '#000', height :'1px', maxWidth:'500px',  width:'calc(100% - 20px)'   }} />

        <h4>
          Coming soon...
        </h4>
      </header>
    </div>
  );
}

export default App;
