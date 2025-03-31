import logo from '../logo.png';
import { useState, useEffect } from "react";
import TypingEffect from "../components/TypingEffect";


function Home() {

  const [showSecond, setShowSecond] = useState(false);

  const [width, setWidth] = useState("w-0"); // Start with width 0

  useEffect(() => {
    if (showSecond) {
      const timeout = setTimeout(() => {
          setWidth("w-11/12"); // Expand to w-11/12
      }, 100); // Delay before expanding
      
      return () => clearTimeout(timeout);
  }
}, [showSecond]); 


const [isUp, setIsUp] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsUp((prev) => !prev); // Toggle between up and down
        }, 1000); // Adjust speed of bounce

        return () => clearInterval(interval);
    }, []);



  return (
    <div className='bg-slate-50 flex flex-col space-y-4 items-center content-start text-center w-full h-dvh pt-12 px-5'>

      <img src={logo} className={`max-w-full transition-transform duration-1000 ease-in-out ${
                isUp ? "translate-y-0" : "translate-y-1"}`} alt="logo" />

      <p className='font-mono font-semibold text-2xl'>
        <TypingEffect words={["Visualise", " your", " internet", " footprint!"]} speed={85} delay={50} disableSpaces={true} onComplete={() => setShowSecond(true)}/>
      </p>

      <div className={`bg-slate-500 h-0.5 transition-all duration-1000 max-w-80 ease-in-out ${width}`} />
      {showSecond && (
        <p className='font-mono font-semibold text-base'>
        <TypingEffect words={["Coming", " soon", ".", ".", "."]} speed={85} delay={50} disableSpaces={true}/>
        </p>
  
      )}
      
    </div>
  );
}
export default Home;
