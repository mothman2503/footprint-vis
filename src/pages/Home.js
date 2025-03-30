import logo from '../logo.png';

function Home () { return (
    <div>


      <header style={{ color : '#000', maxWidth:"100vw", padding:"20px", alignItems:"center", display:"flex", flexDirection:"column", textAlign : 'center'}}>

        <img src={logo} className="" alt="logo" style={{maxWidth : 'calc(100% - 40px)', marginTop : '20px', marginBottom : '20px'}}/>

        <h1>
          Visualise your internet footprint
        </h1>
        <div style={{backgroundColor : '#000', height :'1px', maxWidth:'500px',  width:'calc(100% - 20px)'   }} />

        <h4>
          Coming soon...
        </h4>
      </header>
    </div>
  );;
}
export default Home;
