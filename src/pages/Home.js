import logo from '../logo.png';

function Home() {
  return (
    <div className='bg-slate-100 flex flex-col space-y-4 items-center content-start text-center w-full h-dvh pt-12'>

      <img src={logo} className='max-w-full' alt="logo" />

      <p className='font-mono font-semibold text-2xl'>
        Visualise your internet footprint
      </p>

      <div className='bg-slate-500 w-11/12 max-w-md h-0.5 ' />


      <p className='font-mono font-semibold text-base'>
        Coming soon...
      </p>

    </div>
  );
}
export default Home;
