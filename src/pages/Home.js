import logo from '../logo.png';
import { useState } from "react";
import TypingEffect from "../components/TypingEffect";


function Home() {

  const [showSecond, setShowSecond] = useState(false);

  return (
    <div className='bg-slate-50 flex flex-col space-y-4 items-center content-start text-center w-full h-dvh pt-12'>

      <img src={logo} className='max-w-full' alt="logo" />

      <p className='font-mono font-semibold text-2xl'>
        <TypingEffect words={["Visualise", " your", " internet", " footprint!"]} speed={65} delay={50} disableSpaces={true} onComplete={() => setShowSecond(true)}/>
      </p>

      <div className='bg-slate-500 w-11/12 max-w-md h-0.5 ' />

      {showSecond && (
        <p className='font-mono font-semibold text-base'>
        <TypingEffect words={["Coming", " soon", ".", ".", "."]} speed={65} delay={50} disableSpaces={true}/>
        </p>
  
      )}
      
    </div>
  );
}
export default Home;
